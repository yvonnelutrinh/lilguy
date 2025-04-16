import { NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);


export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { hostname, siteData } = body;
    const userId = request.headers.get('x-user-id');

    if (!hostname || !siteData || !userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'hostname, siteData, and userId are required to track a site visit'
        },
        { status: 400 }
      );
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
        totalDuration: siteData.totalDuration,
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
        classification: "neutral" // default classification
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
    const userId = request.headers.get('x-user-id');

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


