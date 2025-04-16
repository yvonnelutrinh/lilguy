import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUser = query({
  args: { tokenIdentifier: v.optional(v.string()), localIdentifier: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.tokenIdentifier) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier!))
        .unique();
      
      if (user) return user;
    }

    if (args.localIdentifier) {
      // note: if someone logs out, we still wanna track but under a different user
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("localIdentifier"), args.localIdentifier!))
        .order("desc")
        .first();
      
      return user;
    }

    return null;
  },
});

export const createUser = mutation({
  args: {
    tokenIdentifier: v.string(),
    name: v.string(),
    email: v.string(),
    localIdentifier: v.string(),
    customColor: v.optional(v.string()),
    lastSeenIp: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .unique();
    
    if (existingUser) {
      throw new ConvexError("User already exists");
    }

    const userId = await ctx.db.insert("users", {
      tokenIdentifier: args.tokenIdentifier,
      name: args.name,
      email: args.email,
      customColor: args.customColor || "#3B82F6", // Default blue color
      localIdentifier: args.localIdentifier,
      updatedAt: Date.now(),
      lastSeenIp: args.lastSeenIp || "",
    });

    return userId;
  },
});

export const updateCustomColor = mutation({
  args: {
    tokenIdentifier: v.string(),
    customColor: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    await ctx.db.patch(user._id, {
      customColor: args.customColor,
    });

    return user._id;
  },
});

export const updateUser = mutation({
  args: {
    tokenIdentifier: v.optional(v.string()),
    localIdentifier: v.optional(v.string()),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    customColor: v.optional(v.string()),
    lastSeenIp: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Find the user by either tokenIdentifier or localIdentifier
    let user = null;
    if (args.tokenIdentifier) {
      user = await ctx.db
        .query("users")
        .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.tokenIdentifier!))
        .unique();
    }
    
    if (!user && args.localIdentifier) {
      // note: if someone logs out, we still wanna track but under a different user
      user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("localIdentifier"), args.localIdentifier!))
        .order("desc")
        .first();
    }

    if (!user) {
      throw new ConvexError("User not found");
    }

    // Prepare update object with only the fields that were provided
    const updateFields: any = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updateFields.name = args.name;
    if (args.email !== undefined) updateFields.email = args.email;
    if (args.customColor !== undefined) updateFields.customColor = args.customColor;
    if (args.lastSeenIp !== undefined) updateFields.lastSeenIp = args.lastSeenIp;

    // Update the user
    await ctx.db.patch(user._id, updateFields);

    return user._id;
  },
});
