import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { ConvexError } from "convex/values";
import { api } from "./_generated/api";

export const getSiteVisits = query({
  args: { userId: v.string()},
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
      classification: args.classification,
      updatedAt: Date.now(),
    });

    return sitevisitId;
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
      updatedAt: Date.now(),
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
    
    // Update the classification in sitevisits table
    await ctx.db.patch(args.sitevisitId, {
      classification: args.classification,
    });

    // Also update all associated sitevisits in the sitevisit table
    await ctx.scheduler.runAfter(0, api.sitevisit.updateClassificationForAllSiteVisits, {
      userId: sitevisit.userId,
      hostname: sitevisit.hostname,
      classification: args.classification,
    });

    return true;
  },
});

export const removeSiteVisit = mutation({
  args: {
    sitevisitId: v.id("sitevisits"),
  },
  handler: async (ctx, args) => {
    const sitevisit = await ctx.db.get(args.sitevisitId);
    
    if (!sitevisit) {
      throw new ConvexError("Site visit not found");
    }

    await ctx.db.delete(args.sitevisitId);
    return true;
  },
});

export const updateGoalId = mutation({
  args: {
    sitevisitId: v.id("sitevisits"),
    goalId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const sitevisit = await ctx.db.get(args.sitevisitId);
    
    if (!sitevisit) {
      throw new ConvexError("Site visit not found");
    }

    await ctx.db.patch(args.sitevisitId, {
      goalId: args.goalId,
      updatedAt: Date.now(),
    });

    return true;
  },
});

export const getSiteVisit = query({
  args: { 
    userId: v.string(),
    hostname: v.string()
  },
  handler: async (ctx, args) => {
    const sitevisit = await ctx.db
      .query("sitevisits")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("hostname"), args.hostname))
      .first();

    return sitevisit;
  },
});
