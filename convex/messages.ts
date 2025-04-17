import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Query to get all messages for a specific user
export const getMessagesByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
    
    return messages;
  },
});

// Query to get unread messages for a specific user
export const getUnreadMessagesByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("read"), false))
      .order("desc")
      .collect();
    
    return messages;
  },
});

// Query to get messages by type for a specific user
export const getMessagesByType = query({
  args: { userId: v.string(), type: v.string() },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("type"), args.type))
      .order("desc")
      .collect();
    
    return messages;
  },
});

// Query to get messages within a time range for a specific user
export const getMessagesByTimeRange = query({
  args: { 
    userId: v.string(), 
    startTime: v.number(), 
    endTime: v.number() 
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => 
        q.and(
          q.gte(q.field("timestamp"), args.startTime),
          q.lte(q.field("timestamp"), args.endTime)
        )
      )
      .order("desc")
      .collect();
    
    return messages;
  },
});

// Mutation to create a new message
export const createMessage = mutation({
  args: {
    userId: v.string(),
    body: v.string(),
    type: v.string(),
    source: v.string(),
    durationSeconds: v.number(),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      userId: args.userId,
      body: args.body,
      type: args.type,
      read: false,
      source: args.source,
      durationSeconds: args.durationSeconds,
      timestamp: Date.now(),
    });
    
    return messageId;
  },
});

// Mutation to mark a message as read
export const markMessageAsRead = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, {
      read: true,
    });
  },
});

// Mutation to mark all messages as read for a user
export const markAllMessagesAsRead = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("read"), false))
      .collect();
    
    for (const message of messages) {
      await ctx.db.patch(message._id, {
        read: true,
      });
    }
  },
});

// Query to get message statistics for a user
export const getMessageStats = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    const totalMessages = messages.length;
    const unreadMessages = messages.filter(m => !m.read).length;
    
    // Group messages by type
    const messagesByType: Record<string, number> = {};
    messages.forEach(message => {
      if (!messagesByType[message.type]) {
        messagesByType[message.type] = 0;
      }
      messagesByType[message.type]++;
    });
    
    // Calculate total health change
    const totaldurationSeconds = messages.reduce((sum, message) => sum + message.durationSeconds, 0);
    
    return {
      totalMessages,
      unreadMessages,
      messagesByType,
      totaldurationSeconds,
    };
  },
});

// 
// Mutation to delete a message
export const deleteMessage = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.messageId);
  },
});

// Mutation to delete all messages for a user
export const deleteAllMessagesForUser = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
  },
});

