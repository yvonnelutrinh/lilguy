import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function middleware(request: NextRequest) {
  // Skip middleware for certain paths if needed
  if (request.nextUrl.pathname.startsWith('/_next') || 
      request.nextUrl.pathname.startsWith('/api/auth') ||
      request.nextUrl.pathname.startsWith('/static')) {
    return NextResponse.next();
  }

  // Get identifiable information from request headers
  const userAgent = request.headers.get('user-agent') || '';
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || ''; // cant get IP
  // const acceptLanguage = request.headers.get('accept-language') || ''; // different for front/backend
  
  // Create a unique identifier using header information
  const identifierParts = [
    userAgent,
    // acceptLanguage,
  ].filter(Boolean);

  const localIdentifier = `local:${identifierParts.join('-')}`;
  
  try {
    // Check if user already exists
    const existingUser = await convex.query(api.users.getUser, {
      localIdentifier: localIdentifier
    });

    let userId;
    if (existingUser) {
      // If user exists, use their existing identifier
      userId = existingUser._id;
      await convex.mutation(api.users.updateUser, {
        localIdentifier: localIdentifier,
        lastSeenIp: ip,
      });
    } else {
      // Create a new user with the unique identifier
      const newUserId = await convex.mutation(api.users.createUser, {
        name: "Anonymous User",
        email: "",
        customColor: "#3B82F6",
        tokenIdentifier: localIdentifier,
        localIdentifier: localIdentifier,
        lastSeenIp: ip,
      });
      userId = newUserId;
    }

    // Clone the request headers and add the userId
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', userId);

    // Return the response with the modified headers
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Error in middleware:', error);
    // Continue without user identification if there's an error
    return NextResponse.next();
  }
}

// Configure which paths the middleware should run on
// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for the ones starting with:
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      * - public folder
//      */
//     '/((?!_next/static|_next/image|favicon.ico|public).*)',
//   ],
// };

// new one 
// import { clerkMiddleware } from "@clerk/nextjs/server";

// export default clerkMiddleware({
//       // Routes that can be accessed while signed out
//   publicRoutes: ["/", "/api(.*)"],
//   // Routes that can always be accessed, and have
//   // no authentication information
//   ignoredRoutes: ["/no-auth-required"],
// });

// export const config = {
//   matcher: [
//     // Skip Next.js internals and all static files, unless found in search params
//     '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
//     // Always run for API routes
//     '/(api|trpc)(.*)',
//   ],
// };
