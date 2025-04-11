// src/hooks/useEmotionEvents.ts
import { useEffect } from 'react';
import eventBus, { EmotionEvent, EventCallback } from './emotionEventBus';
import { LilGuyAnimation } from '@/components/LilGuy/LilGuy';

export function useEmitEmotion() {
  return (type: LilGuyAnimation, intensity: number, source: string) => {
    eventBus.publish<EmotionEvent>('emotion', {
      type,
      intensity,
      source,
      timestamp: Date.now()
    });
  };
}

export function useListenToEmotions(callback: EventCallback<EmotionEvent>) {
  useEffect(() => {
    const unsubscribe = eventBus.subscribe<EmotionEvent>('emotion', callback);
    return unsubscribe;
  }, [callback]);
}
