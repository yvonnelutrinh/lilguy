import { NextResponse } from "next/server";
import { encode, decode } from "gpt-tokenizer";

const openaiApiKey = process.env.OPEN_AI_API_KEY;

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
  return data.data.map((item: any) => item.embedding);
}

const catPage = async ({
  pageText,
  pageName,
}: {
  pageText: string;
  pageName: string;
}) => {
  const pageChunks: string[] = splitByToken(pageText);
  // const goalEmbedding = await getEmbedding("learning how to use the Next.js framework to build websites");
  async function getGoalEmbeddings() {
    const goals = {
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
  const res = await catPage(body)
  console.log(res);

  //return {hostname, category};
  return NextResponse.json(res);
}
