import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from 'next/server';
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { hostname, duration } = body;
    const userId = request.headers.get('x-user-id');
    if (!hostname || !duration || !userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'hostname, siteData, and userId are required to track a site visit'
        },
        { status: 400 }
      );
    }

    // Check if site visit already exists
    const existingSiteVisit = await convex.query(api.sitevisits.getSiteVisit, {
      userId,
      hostname,
    });

    if (existingSiteVisit) {
      switch (existingSiteVisit.classification) {
        case "productive":
          if (existingSiteVisit.goalId) {
            convex.mutation(api.messages.createMessage, {
              userId,
              body: `LilGuy loves productivity! You visited ${hostname} for ${duration} seconds`,
              type: "sitevisit-goal",
              source: hostname,
              durationSeconds: duration,
            })
          } else {
            convex.mutation(api.messages.createMessage, {
              userId,
              body: `LilGuy loves productivity! You visited ${hostname} for ${duration} seconds`,
              type: "sitevisit",
              source: hostname,
              durationSeconds: duration,
            })
          }
          break;
        case "unproductive":
          convex.mutation(api.messages.createMessage, {
            userId,
            body: `LilGuy hates slackers! You visited ${hostname} for ${duration} seconds`,
            type: "sitevisit",
            source: hostname,
            durationSeconds: duration,
          })
          break;
        default:
          if (duration > 10) {
            convex.mutation(api.messages.createMessage, {
              userId,
              body: `Interesting! You visited ${hostname} for ${duration} seconds`,
              type: "sitevisit",
              source: hostname,
              durationSeconds: duration,
            })
          }
          break;
      }
      //  use the existing classification
      const sitevisitId = await convex.mutation(api.sitevisit.addSiteVisit, {
        userId,
        hostname,
        duration,
        classification: existingSiteVisit.classification,
      });

      return NextResponse.json({
        success: true,
        message: 'Site visit updated successfully',
        data: { sitevisitId }
      });
    } else {
      // Create a new record
      const sitevisitId = await convex.mutation(api.sitevisit.addSiteVisit, {
        userId,
        hostname,
        duration,
        classification: "neutral",
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
