import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new lilguy for a user
export const create = mutation({
  args: {
    userId: v.string(),
    color: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const lilguyId = await ctx.db.insert("lilguys", {
      userId: args.userId,
      color: args.color,
      name: args.name,
      health: 100,
      stage: "egg",
      lastAnimation: "idle",
      updatedAt: Date.now(),
    });
    return lilguyId;
  },
});

// Get a user's lilguy
export const get = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const lilguy = await ctx.db
      .query("lilguys")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    return lilguy;
  },
});

// Update a lilguy's basic properties
export const update = mutation({
  args: {
    userId: v.string(),
    color: v.optional(v.string()),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const lilguy = await ctx.db
      .query("lilguys")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!lilguy) {
      throw new Error("Lilguy not found");
    }

    await ctx.db.patch(lilguy._id, {
      ...(args.color && { color: args.color }),
      ...(args.name && { name: args.name }),
      updatedAt: Date.now(),
    });
  },
});

// Update a lilguy's health
export const updateHealth = mutation({
  args: {
    userId: v.string(),
    healthChange: v.number(),
  },
  handler: async (ctx, args) => {
    const lilguy = await ctx.db
      .query("lilguys")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!lilguy) {
      throw new Error("Lilguy not found");
    }

    const newHealth = Math.max(0, Math.min(100, lilguy.health + args.healthChange));
    
    await ctx.db.patch(lilguy._id, {
      health: newHealth,
      updatedAt: Date.now(),
    });
  },
});

// Update a lilguy's stage
export const updateStage = mutation({
  args: {
    userId: v.string(),
    stage: v.string(),
  },
  handler: async (ctx, args) => {
    const lilguy = await ctx.db
      .query("lilguys")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!lilguy) {
      throw new Error("Lilguy not found");
    }

    await ctx.db.patch(lilguy._id, {
      stage: args.stage,
      updatedAt: Date.now(),
    });
  },
});

// Update a lilguy's animation
export const updateAnimation = mutation({
  args: {
    userId: v.string(),
    animation: v.string(),
  },
  handler: async (ctx, args) => {
    const lilguy = await ctx.db
      .query("lilguys")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!lilguy) {
      throw new Error("Lilguy not found");
    }

    await ctx.db.patch(lilguy._id, {
      lastAnimation: args.animation,
      updatedAt: Date.now(),
    });
  },
});
