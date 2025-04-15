// src/hooks/useEmotionEvents.ts
import { useEffect } from 'react';
import eventBus, { EmotionEvent, EventCallback } from './emotionEventBus';
import { LilGuyAnimation } from '@/components/LilGuy/LilGuy';

export function useEmitEmotion() {
  // Accepts optional health parameter for emotion events
  return (type: LilGuyAnimation, intensity: number, source: string, health?: number) => {
    eventBus.publish<EmotionEvent>('emotion', {
      type,
      intensity,
      source,
      timestamp: Date.now(),
      ...(health !== undefined ? { health } : {})
    });
    // Persist animation to localStorage for widget sync
    if (typeof window !== 'undefined') {
      localStorage.setItem('lilGuyAnimation', type);
      window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'lilGuyAnimation', value: type } }));
    }
  };
}

export function useListenToEmotions(callback: EventCallback<EmotionEvent>) {
  useEffect(() => {
    const unsubscribe = eventBus.subscribe<EmotionEvent>('emotion', callback);
    return unsubscribe;
  }, [callback]);
}
