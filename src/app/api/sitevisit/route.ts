import { NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);


// {
//   "sitevisitId": "your-sitevisit-id"
// }
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { sitevisitId } = body;


    // safely update the sitevitis/crea new

    if (!sitevisitId) {
      return NextResponse.json(
        {
          success: false,
          message: 'sitevisitId is required'
        },
        { status: 400 }
      );
    }

    // Call the incrementVisits mutation
    const newVisitCount = await convex.mutation(api.sitevisits.incrementVisits, {
      sitevisitId
    });

    return NextResponse.json({
      success: true,
      message: 'Visit count incremented successfully',
      data: { newVisitCount }
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

// GET /api/sitewow?userId=user123
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
