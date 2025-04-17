import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const addSiteVisit = mutation({
  args: {
    userId: v.string(),
    hostname: v.string(),
    classification: v.string(),
    duration: v.number(),
  },
  handler: async (ctx, args) => {

    const sitevisitId = await ctx.db.insert("sitevisit", {
      classification: args.classification,
      userId: args.userId,
      hostname: args.hostname,
      duration: args.duration,
      timeStamp: Date.now()
    });

    return sitevisitId;
  },
});


export const getWeeklyProductivityData = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get current timestamp and calculate timestamp for 7 days ago
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    
    // Fetch all site visits for this user in the last 7 days
    const siteVisits = await ctx.db
      .query("sitevisit")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gte("timeStamp", sevenDaysAgo as any))
      .collect();
    
    // Initialize result structure for all days of the week
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = dayNames.map(day => ({
      day,
      productiveDurationTotal: 0,
      unproductiveDurationTotal: 0
    }));
    
    // Group and aggregate data by day
    for (const visit of siteVisits) {
      const visitDate = new Date(visit.timeStamp);
      // Adjust the day index to shift it one day back to fix the offset
      const dayIndex = (visitDate.getDay() + 6) % 7; // Shift one day back (Sunday becomes Saturday, Monday becomes Sunday, etc.)
      
      if (visit.classification === "productive") {
        result[dayIndex].productiveDurationTotal += visit.duration;
      } else if (visit.classification === "unproductive") {
        result[dayIndex].unproductiveDurationTotal += visit.duration;
      }
    }
    
    // Rotate the array to start with Monday (if needed)
    // This shifts the array so Monday is at index 0
    const mondayIndex = 1; // Monday's index in dayNames
    const rotatedResult = [
      ...result.slice(mondayIndex),
      ...result.slice(0, mondayIndex)
    ];
    
    return rotatedResult;
  },
});

export const updateClassificationForAllSiteVisits = mutation({
  args: {
    userId: v.string(),
    hostname: v.string(),
    classification: v.string(),
  },
  handler: async (ctx, args) => {
    // Find all sitevisits with the same hostname and userId
    const siteVisits = await ctx.db
      .query("sitevisit")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("hostname"), args.hostname))
      .collect();
    
    // Update each sitevisit with the new classification
    for (const siteVisit of siteVisits) {
      await ctx.db.patch(siteVisit._id, {
        classification: args.classification,
      });
    }
    
    return siteVisits.length; // Return the number of updated records
  },
});