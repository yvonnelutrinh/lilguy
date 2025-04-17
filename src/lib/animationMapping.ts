// Central animation mapping for LilGuy
// Maps events or state changes to animation types

export type AnimationEventType =
  | 'goalCompleted'
  | 'healthLow'
  | 'evolveAngel'
  | 'evolveDevil'
  | 'moodEcstatic'
  | 'moodSad'
  | 'idle'
  | 'hatch'
  | 'firstGoalSet'
  | 'stageChange'
  | 'emotion'
  | 'productivityChange'
  | 'trackedHoursChange'
  | 'lilGuyColor:randomize'
  | 'shake' // specific to egg sprite
  | 'custom';

export type LilGuyAnimationType =
  | 'happy'
  | 'sad'
  | 'shocked'
  | 'angel'
  | 'devil'
  | 'ecstatic'
  | 'idle'
  | 'hatch'
  | 'walk'
  | 'angry'
  | 'shake'; // keep shake for egg sprite

// Main mapping: event/state → animation
export const animationMapping: Record<AnimationEventType, LilGuyAnimationType> = {
  goalCompleted: 'happy',
  healthLow: 'shocked',
  evolveAngel: 'angel',
  evolveDevil: 'devil',
  moodEcstatic: 'ecstatic',
  moodSad: 'sad',
  idle: 'idle',
  hatch: 'hatch',
  firstGoalSet: 'hatch',
  stageChange: 'idle',
  emotion: 'idle',
  productivityChange: 'happy',
  trackedHoursChange: 'walk',
  'lilGuyColor:randomize': 'idle',
  shake: 'shake',
  custom: 'idle', // fallback
};

// Helper to get animation type from event/state
export function getAnimationForEvent(eventType: AnimationEventType): LilGuyAnimationType {
  return animationMapping[eventType] || 'idle';
}
