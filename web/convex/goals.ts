import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { ConvexError } from "convex/values";

export const getGoals = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const goals = await ctx.db
      .query("goals")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return goals;
  },
});

export const createGoal = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    completed: v.optional(v.boolean()),
    progress: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const goalId = await ctx.db.insert("goals", {
      userId: args.userId,
      title: args.title,
      completed: args.completed || false,
      progress: args.progress || 0,
      updatedAt: Date.now(),
    });

    return goalId;
  },
});

export const updateGoal = mutation({
  args: {
    goalId: v.id("goals"),
    title: v.optional(v.string()),
    completed: v.optional(v.boolean()),
    progress: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const goal = await ctx.db.get(args.goalId);
    
    if (!goal) {
      throw new ConvexError("Goal not found");
    }

    const updates: any = {};
    
    if (args.title !== undefined) updates.title = args.title;
    if (args.completed !== undefined) updates.completed = args.completed;
    if (args.progress !== undefined) updates.progress = args.progress;

    await ctx.db.patch(args.goalId, updates);

    return true;
  },
});

export const deleteGoal = mutation({
  args: {
    goalId: v.id("goals"),
  },
  handler: async (ctx, args) => {
    const goal = await ctx.db.get(args.goalId);
    
    if (!goal) {
      throw new ConvexError("Goal not found");
    }

    await ctx.db.delete(args.goalId);

    return true;
  },
}); 