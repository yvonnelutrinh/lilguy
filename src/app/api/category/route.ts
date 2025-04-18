import { NextResponse } from "next/server";
import { encode, decode } from "gpt-tokenizer";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const openaiApiKey = process.env.OPEN_AI_API_KEY
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const DEFAULT_GOALS = {
  nextjs: "learning to use the Next.js framework",
  javascript: "learning to use the javascript programming language",
  routing: "learning routing in Next.js",
  "file-based-routing": "learning file-based routing in Next.js",
  "dynamic-routing": "learning dynamic routing in Next.js",
  "app-router": "learning how to use the App Router in Next.js",
  "pages-router": "learning how to use the Pages Router in Next.js",
  react: "learning how to use React",
  ssr: "learning server-side rendering in Next.js",
  ssg: "learning static site generation in Next.js",
  csr: "learning client-side rendering in Next.js",
  "api-routes": "learning how to use API routes in Next.js",
  "data-fetching": "learning data fetching strategies in Next.js",
  getStaticProps: "learning how to use getStaticProps",
  getServerSideProps: "learning how to use getServerSideProps",
  middleware: "learning how to use middleware in Next.js",
  "image-optimization": "learning image optimization in Next.js",
  seo: "learning SEO best practices with Next.js",
  "head-component": "learning how to use the Head component in Next.js",
  auth: "learning how to implement authentication in Next.js",
  deployment: "learning how to deploy a Next.js app",
  vercel: "learning how to deploy with Vercel",
  tailwind: "learning how to use Tailwind CSS with Next.js",
  typescript: "learning how to use TypeScript with Next.js",
  fullstack: "learning to build a full-stack app using Next.js",
  "dashboard-ui": "learning how to build a dashboard UI with Next.js",
};

function splitByToken(text: string, maxTokens = 100) {
  const tokens = encode(text);
  const batches = [];

  for (let i = 0; i < tokens.length; i += maxTokens) {
    const chunkTokens = tokens.slice(i, i + maxTokens);
    const chunkText = decode(chunkTokens);
    batches.push(chunkText);
  }
  return batches;
}

async function getGoalsForUser(userId: string | null) {
  if (!userId) {
    return DEFAULT_GOALS;
  }

  const existingGoals = await convex.query(api.goals.getGoals, {
    userId,
  });

  if (existingGoals && existingGoals.length > 0) {
    return existingGoals.reduce((acc, goal) => {
      acc[goal.title] = goal.title;
      return acc;
    }, {} as { [key: string]: string });
  }

  return DEFAULT_GOALS;
}

function cosineSimilarity(vecA: number[], vecB: number[]) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dot / (normA * normB);
}

async function getEmbedding(text: string | string[]) {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text,
    }),
  });

  const data = await response.json();
  if (data.error) {
    return console.error(data);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.data.map((item: any) => item.embedding);
}

const catPage = async ({
  pageText,
  pageName,
}: {
  pageText: string;
  pageName: string;
}, userId: string | null) => {
  const pageChunks: string[] = splitByToken(pageText);
  async function getGoalEmbeddings() {
    const goals = await getGoalsForUser(userId);
    const inputTexts = Object.values(goals);

    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: inputTexts,
      }),
    });

    type EmbeddingResponse = {
      data: { embedding: number[] }[];
    };
    const data: EmbeddingResponse = await response.json();
    const goalEmbeddings: { [key: string]: number[] } = {};
    Object.keys(goals).forEach((key, index) => {
      goalEmbeddings[key] = data.data[index].embedding;
    });

    return goalEmbeddings;
  }
  const goalEmbeddings = await getGoalEmbeddings();
  const chunkEmbeddings = await getEmbedding(pageChunks);
  const hostname = new URL(pageName).hostname;
  let largestSimilarity = -Infinity;
  for (const goal in goalEmbeddings) {
    let highest = 0;
    for (const emb of chunkEmbeddings) {
      const similarity =
        Math.round(cosineSimilarity(goalEmbeddings[goal], emb) * 10) / 10;
      if (similarity > highest) highest = similarity;
    }
    if (highest > largestSimilarity) {
      largestSimilarity = highest;
    }
  }
  return {
    hostname,
    category: largestSimilarity >= 0.5 ? "productive" : "unproductive",
  };
};

export async function POST(request: Request) {
  const body = await request.json();
  const userId = request.headers.get('x-user-id');
  const res = await catPage(body, userId)
  console.log(res);

  if (userId) {
    const existingSiteVisit = await convex.query(api.sitevisits.getSiteVisit, {
      userId,
      hostname: res.hostname,
    });
    if (existingSiteVisit?.classification == 'neutral') {
      await convex.mutation(api.sitevisits.updateClassification, {
        classification: res.category,
        sitevisitId: existingSiteVisit!._id
      })
    }
  }

  //return {hostname, category};
  return NextResponse.json(res);
}
