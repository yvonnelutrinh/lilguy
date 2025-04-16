import { LilGuyAnimation } from "@/components/LilGuy/LilGuy";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventCallback<T = any> = (data: T) => void;

export interface EmotionEvent {
  type: LilGuyAnimation;
  intensity: number; // 0-100
  source: string; // component that triggered it
  timestamp: number;
  health?: number; // Optional health property for health bar updates
}

class EventBus {
  private listeners: Record<string, EventCallback[]> = {};

  subscribe<T>(event: string, callback: EventCallback<T>): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback as EventCallback);

    // Return unsubscribe function
    return () => {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    };
  }

  publish<T>(event: string, data: T): void {
    if (!this.listeners[event]) {
      return;
    }
    
    this.listeners[event].forEach(callback => callback(data));
  }
}

// Create singleton instance
const eventBus = new EventBus();
export default eventBus;
