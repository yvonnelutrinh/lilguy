import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    customColor: v.string(),
    tokenIdentifier: v.string(),
  }).index("by_token", ["tokenIdentifier"]),

  sitevisits: defineTable({
    userId: v.string(),
    hostname: v.string(),
    visits: v.number(),
    totalDuration: v.number(),
    sessions: v.number(),
    classification: v.string()
  }).index("by_user", ["userId"]),
});
