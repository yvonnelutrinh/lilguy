import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { ConvexError } from "convex/values";

export const getMessages = query({
    args: { userId: v.string(), read: v.optional(v.boolean()) },
    handler: async (ctx, args) => {
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();

        // filters only the messages that are read or unread
        if (args.read !== undefined) {
            return messages.filter((message) => message.read === args.read);
        }

        return messages;
    },
});

export const createMessage = mutation({
    args: {
        userId: v.string(),
        type: v.string(),
        source: v.string(),
        health: v.optional(v.number()),
        intensity: v.optional(v.number()),
        timestamp: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const messageId = await ctx.db.insert("messages", {
            userId: args.userId,
            type: args.type,
            source: args.source,
            health: args.health || 100,
            intensity: args.intensity || 1,
            read: false,
            timestamp: args.timestamp || Date.now(),
        });

        return messageId;
    },
});

export const readMessage = mutation({
    args: {
        messageId: v.id("messages"),
        read: v.boolean(),
    },
    handler: async (ctx, args) => {
        // just change if its read or not
        const message = await ctx.db.get(args.messageId);

        if (!message) {
            throw new ConvexError("Message not found");
        }

        const updates: any = {};

        if (args.read !== undefined) updates.read = args.read;

        await ctx.db.patch(args.messageId, updates);

        return true;
    },
});

export const deleteMessage = mutation({
    args: {
        messageId: v.id("messages"),
    },
    handler: async (ctx, args) => {
        const message = await ctx.db.get(args.messageId);

        if (!message) {
            throw new ConvexError("Message not found");
        }

        await ctx.db.delete(args.messageId);

        return true;
    },
}); 