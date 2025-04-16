import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { ConvexError } from "convex/values";

export const getLilGuys = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const lilguys = await ctx.db
      .query("lilguys")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return lilguys;
  },
});

export const createLilGuy = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    health: v.optional(v.boolean()),
    progress: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const lilguyId = await ctx.db.insert("lilguys", {
      userId: args.userId,
      name: args.name,
      health: args.health || true,
      progress: args.progress || 0,
    });

    return lilguyId;
  },
});

export const updateLilGuy = mutation({
  args: {
    lilguyId: v.id("lilguys"),
    name: v.optional(v.string()),
    health: v.optional(v.boolean()),
    progress: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const lilguy = await ctx.db.get(args.lilguyId);
    
    if (!lilguy) {
      throw new ConvexError("LilGuy not found");
    }

    const updates: any = {};
    
    if (args.name !== undefined) updates.name = args.name;
    if (args.health !== undefined) updates.health = args.health;
    if (args.progress !== undefined) updates.progress = args.progress;

    await ctx.db.patch(args.lilguyId, updates);

    return true;
  },
});

export const deleteLilGuy = mutation({
  args: {
    lilguyId: v.id("lilguys"),
  },
  handler: async (ctx, args) => {
    const lilguy = await ctx.db.get(args.lilguyId);
    
    if (!lilguy) {
      throw new ConvexError("LilGuy not found");
    }

    await ctx.db.delete(args.lilguyId);

    return true;
  },
}); 