import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
// import { clerkClient } from "@clerk/nextjs";

export async function GET(request: NextRequest) {
  // This is required for Clerk OAuth callbacks
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  
  if (!code) {
    return new Response("Missing code parameter", { status: 400 });
  }

  try {
    await clerkClient.signIn.createFromOAuth({
      strategy: "oauth_google",
      code,
      redirectUrl: `${process.env.NEXT_PUBLIC_CLERK_REDIRECT_URL}/`,
    });
    
    return Response.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("OAuth error:", error);
    return new Response("OAuth error", { status: 500 });
  }
}
