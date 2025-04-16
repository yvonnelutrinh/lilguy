import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    customColor: v.string(),
    tokenIdentifier: v.string(),
    localIdentifier: v.string(),
    lastSeenIp: v.string(),
    updatedAt: v.number(),
  }).index("by_token", ["tokenIdentifier"]),

  sitevisits: defineTable({
    userId: v.string(),
    hostname: v.string(),
    visits: v.number(),
    totalDuration: v.number(),
    sessions: v.number(),
    classification: v.string(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  goals: defineTable({
    userId: v.string(),
    title: v.string(),
    completed: v.boolean(),
    progress: v.number(),
  }).index("by_user", ["userId"]),

  lilguys: defineTable({
    userId: v.string(),
    name: v.string(),
    health: v.boolean(),
    progress: v.number(),
  }).index("by_user", ["userId"]),

  messages: defineTable({
    userId: v.string(),
    type: v.string(),
    read: v.boolean(),
    source: v.string(),
    health: v.number(),
    intensity: v.number(),
    timestamp: v.number(),
  }).index("by_user", ["userId"]),

  apikeys: defineTable({
    key: v.string(),
    service: v.string(),
  }).index("by_key", ["key"]),

});
