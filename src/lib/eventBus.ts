import mitt from "mitt";

// Define event types for type safety
export type LilGuyEvents =
  | { type: "hpChange"; health: number }
  | { type: "moodChange"; mood: string }
  | { type: "goalCompleted"; goalId: string }
  | { type: "stageChange"; stage: string }
  | { type: "widgetSync"; key: string; value: any }
  | { type: "emotion"; emotion: string; intensity?: number }
  | { type: string; [key: string]: any };

const emitter = mitt();
export const eventBus = {
  on: (type: string, handler: (event: any) => void) => emitter.on(type, handler),
  off: (type: string, handler: (event: any) => void) => emitter.off(type, handler),
  emit: (type: string, event?: any) => emitter.emit(type, event),
};
