// Convex API wrapper for LilGuy app
// Replace with actual Convex client imports and types as needed

export const convexApi = {
  async getAppState(userId?: string) {
    // TODO: Replace with actual Convex query
    return {
      health: 100,
      mood: "neutral",
      goals: [],
      today: { productive: 0, unproductive: 0 },
      lilGuyStage: "egg",
    };
  },
  async updateHealth(health: number) {
    // TODO: Call Convex mutation
    return true;
  },
  async updateMood(mood: string) {
    // TODO: Call Convex mutation
    return true;
  },
  async updateStage(stage: string) {
    // TODO: Call Convex mutation
    return true;
  },
  async sync(state: any) {
    // TODO: Sync all state to Convex
    return true;
  },
};
