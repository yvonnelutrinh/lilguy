import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { ConvexError } from "convex/values";

export const getSiteVisits = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const sitevisits = await ctx.db
      .query("sitevisits")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return sitevisits;
  },
});

export const addSiteVisit = mutation({
  args: {
    userId: v.string(),
    hostname: v.string(),
    classification:v.string(),
  },
  handler: async (ctx, args) => {
    const sitevisitId = await ctx.db.insert("sitevisits", {
      userId: args.userId,
      hostname: args.hostname,
      visits: 0,
      totalDuration: 0,
      sessions: 0,
      classification: args.classification
    });

    return sitevisitId;
  },
});

// make this to update the "website state"
export const incrementVisits = mutation({
  args: {
    sitevisitId: v.id("sitevisits"),
  },
  handler: async (ctx, args) => {
    const sitevisit = await ctx.db.get(args.sitevisitId);
    
    if (!sitevisit) {
      throw new ConvexError("Website not found");
    }

    await ctx.db.patch(args.sitevisitId, {
      visits: sitevisit.visits + 1,
    });

    return sitevisit.visits + 1;
  },
});

// Update an existing site visit with the latest data from the extension
export const updateSiteVisit = mutation({
  args: {
    sitevisitId: v.id("sitevisits"),
    visits: v.number(),
    sessions: v.number(),
    totalDuration: v.number(),
  },
  handler: async (ctx, args) => {
    const sitevisit = await ctx.db.get(args.sitevisitId);
    
    if (!sitevisit) {
      throw new ConvexError("Site visit not found");
    }

    await ctx.db.patch(args.sitevisitId, {
      visits: args.visits,
      sessions: args.sessions,
      totalDuration: args.totalDuration,
    });

    return true;
  },
});

export const updateClassification = mutation({
  args: {
    sitevisitId: v.id("sitevisits"),
    classification: v.string(),
  },
  handler: async (ctx, args) => {
    const sitevisit = await ctx.db.get(args.sitevisitId);
    
    if (!sitevisit) {
      throw new ConvexError("Site visit not found");
    }

    await ctx.db.patch(args.sitevisitId, {
      classification: args.classification,
    });

    return true;
  },
});
