// This helper file adapts sprite frame calculations specific to different colored sprites
import { LilGuyAnimation, LilGuyColor, LilGuyStage } from '../../components/LilGuy/LilGuy';

// For blue sprites, we need to map the animations from the provided sprite sheet
export const getBlueAnimationOverrides = (animation: LilGuyAnimation): LilGuyAnimation => {
  // Return the exact same animation - this is just an example adapter
  // If the blue sprite sheet has a different layout than the others,
  // you could modify the animation type here
  return animation;
};

// For green sprites, we need to map the animations from the provided sprite sheet
export const getGreenAnimationOverrides = (animation: LilGuyAnimation): LilGuyAnimation => {
  // Green sprites follow the same format as blue sprites
  return animation;
};

// Get sprite-specific animation overrides based on color
export const getColorSpecificAnimation = (animation: LilGuyAnimation, color: LilGuyColor): LilGuyAnimation => {
  if (color === 'blue') {
    return getBlueAnimationOverrides(animation);
  } else if (color === 'green') {
    return getGreenAnimationOverrides(animation);
  }
  // Default for black or other colors
  return animation;
};

// Returns the health state based on current health value
export const getHealthState = (health: number): 'low' | 'medium' | 'high' => {
  if (health < 30) return 'low';
  if (health > 80) return 'high';
  return 'medium';
};

// Returns appropriate message based on health and current stage
export const getStatusMessage = (health: number, stage: LilGuyStage): string => {
  if (stage === 'egg') {
    return "I'm growing! Add goals to help me hatch.";
  }
  
  if (stage === 'hatchling') {
    return "I just hatched! Let's work together.";
  }
  
  if (stage === 'angel') {
    return "You're doing amazing! Keep up the great work!";
  }
  
  if (stage === 'devil') {
    return "We need to get back on track with your goals.";
  }
  
  // Normal stage with health-based messages
  if (health < 30) {
    return "I'm not feeling so great. Let's complete some tasks!";
  } else if (health > 80) {
    return "You're crushing it! I feel so energized!";
  } else {
    return "We're making good progress! Keep going!";
  }
};

// Get animation duration for each animation type
export const getAnimationDuration = (animation: LilGuyAnimation): number => {
  switch (animation) {
    case 'idle': return 1000;
    case 'walk': return 1500;
    case 'happy': return 1200;
    case 'sad': return 800;
    case 'angry': return 1000;
    case 'shocked': return 600;
    case 'shake': return 500;
    case 'hatch': return 2000;
    default: return 1000;
  }
};

// Get the appropriate color for a given stage
export const getColorForStage = (stage: LilGuyStage, defaultColor: LilGuyColor): LilGuyColor => {
  // Use different colors based on stage if needed
  switch (stage) {
    case 'angel':
      // Angels could default to blue
      return 'blue';
    case 'devil':
      // Devils could default to black
      return 'black';
    default:
      // Use the provided default color for other stages
      return defaultColor;
  }
};
