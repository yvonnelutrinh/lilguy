import { NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);


// {
//   hostname: "example.com",
//   siteData: {
//     visits: 5,
//     sessions: 3,
//     totalDuration: 1200000,
//     userId: "clerk:user_2vhLHFwbblBU9J4M5qWkEKQKcFK"
//   },
//   userId: "clerk:user_2vhLHFwbblBU9J4M5qWkEKQKcFK"
// }

export async function POST(request: Request) {
  try {
    const body = await request.json();


    const { hostname, siteData } = body;
    let { userId } = body;

    if (!hostname || !siteData) {
      return NextResponse.json(
        {
          success: false,
          message: 'hostname, and siteData are required'
        },
        { status: 400 }
      );
    }
    if (!userId){
      // Get identifiable information from request headers
      const userAgent = request.headers.get('user-agent') || '';
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
      const acceptLanguage = request.headers.get('accept-language') || '';
      const platform = request.headers.get('sec-ch-ua-platform') || '';
      
      // create a unique identifier using header information
      const identifierParts = [
        hostname,
        userAgent,
        ip,
        acceptLanguage,
        platform,
        Date.now()
      ].filter(Boolean); // Remove empty values
      
      const localIdentifier = `local:${identifierParts.join('-')}`;
      
      // Check if user already exists
      const existingUser = await convex.query(api.users.getUser, {
        tokenIdentifier: localIdentifier
      });

      if (existingUser) {
        // If user exists, use their identifier
        userId = localIdentifier;
      } else {
        // Create a new user with the unique identifier
        const newUserId = await convex.mutation(api.users.createUser, {
          tokenIdentifier: localIdentifier,
          name: "Anonymous User",
          email: "",
          customColor: "#3B82F6"
        });
        userId = localIdentifier;
      }
    }


    // First, check if a site visit record already exists for this user and hostname
    const existingSiteVisits = await convex.query(api.sitevisits.getSiteVisits, {
      userId
    });
    
    const existingSiteVisit = existingSiteVisits.find(
      (visit) => visit.hostname === hostname
    );

    if (existingSiteVisit) {
      // Update the existing record
      await convex.mutation(api.sitevisits.updateSiteVisit, {
        sitevisitId: existingSiteVisit._id,
        visits: siteData.visits,
        sessions: siteData.sessions,
        totalDuration: siteData.totalDuration
      });

      return NextResponse.json({
        success: true,
        message: 'Site visit updated successfully',
        data: { sitevisitId: existingSiteVisit._id }
      });
    } else {
      // Create a new record
      const sitevisitId = await convex.mutation(api.sitevisits.addSiteVisit, {
        userId,
        hostname,
        classification: "uncategorized" // Default classification
      });

      // Update the newly created record with the site data
      await convex.mutation(api.sitevisits.updateSiteVisit, {
        sitevisitId,
        visits: siteData.visits,
        sessions: siteData.sessions,
        totalDuration: siteData.totalDuration
      });

      return NextResponse.json({
        success: true,
        message: 'Site visit created successfully',
        data: { sitevisitId }
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error processing request',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/sitevisit?userId=user123
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'userId is required'
        },
        { status: 400 }
      );
    }

    // Call the getSiteVisits query
    const siteVisits = await convex.query(api.sitevisits.getSiteVisits, {
      userId
    });

    return NextResponse.json({
      success: true,
      message: 'Site visits retrieved successfully',
      data: siteVisits
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error processing request',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
