// src/lib/lilguyActions.ts
// Shared LilGuy action logic for first goal sequence and more

import { getRandomColor } from "@/components/LilGuy/LilGuy";

export function triggerFirstGoalSequence({
  emitEmotion,
  setAndSyncMessage,
}: {
  emitEmotion: (animation: string, intensity: number, source?: string) => void,
  setAndSyncMessage: (msg: string) => void,
}) {
  if (typeof window === 'undefined') return;

  // Randomize LilGuy color if not already set
  if (!localStorage.getItem('lilGuyColor')) {
    const color = getRandomColor();
    localStorage.setItem('lilGuyColor', color);
    window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'lilGuyColor', value: color } }));
  }

  localStorage.setItem('lilGuyStage', 'egg');
  emitEmotion('hatch', 100, 'button');
  setAndSyncMessage('First goal set! LilGuy is hatching...');
  window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'lilGuyStage', value: 'egg' } }));
  setTimeout(() => {
    localStorage.setItem('lilGuyStage', 'normal');
    localStorage.setItem('lilGuyProductivity', '50');
    localStorage.setItem('lilGuyTrackedHours', '0');
    emitEmotion('idle', 100, 'button');
    setAndSyncMessage('LilGuy hatched! Ready to work.');
    window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'lilGuyStage', value: 'normal' } }));
  }, 1400);
}
