// Sprite Manager for LilGuy Character
import { LilGuyStage, LilGuyColor, LilGuyAnimation } from '../../components/LilGuy/LilGuy';

// Define specific animation types for each stage
type EggAnimation = 'idle' | 'shake' | 'hatch';
type HatchlingAnimation = 'idle' | 'walk' | 'happy' | 'sad';
type FullAnimation = 'idle' | 'walk' | 'happy' | 'angry' | 'sad' | 'shocked';

// Sprite dimensions
export const spriteDimensions = {
  width: 500,  // Match actual sprite size
  height: 500, // Match actual sprite size
  columns: 1,  // Each sprite is a separate image
};

// Frame counts for each animation type
const animationFrames: Record<string, number> = {
  idle: 5,
  walk: 4,
  happy: 5,
  angry: 4,
  sad: 6,
  sleepy: 6, // Used for shocked animation
  move: 6,   // Used for shake animation
  hatch: 6   // Hatch animation
};

// Get the current frame index for an animation
export const getAnimationFrameIndex = (animation: LilGuyAnimation, frameCount: number): number => {
  const animKey = getAnimationKey(animation);
  const frameMax = animationFrames[animKey] || 1;
  
  // Calculate frame based on frame count
  return Math.floor(frameCount / 10) % frameMax;
};

// Map animation types to their corresponding file name parts
const getAnimationKey = (animation: LilGuyAnimation): string => {
  switch (animation) {
    case 'shocked': return 'sleepy'; // Using sleepy for shocked since we don't have shocked
    case 'shake': return 'move';     // Using move for shake animation
    default: return animation;
  }
};

// Get sprite sheet path based on stage, color, and animation
export const getSpriteSheetPath = (stage: LilGuyStage, color: LilGuyColor, animation: LilGuyAnimation, frameIndex?: number): string => {
  // Get the appropriate animation key
  const animKey = getAnimationKey(animation);
  
  // Use the provided frame index or default to 0
  const frame = frameIndex !== undefined ? frameIndex : 0;
  
  // Format the animation name with frame index
  const animName = `${animKey}_${frame}`;
  
  // Build the path based on the file naming pattern
  const basePath = `/assets/sprites/${color}/`;
  
  if (stage === 'egg') {
    return `${basePath}lilguy_egg_${color}_${animName}.png`;
  } else if (stage === 'hatchling') {
    // Since we don't have dedicated hatchling sprites, use egg sprites
    return `${basePath}lilguy_egg_${color}_${animName}.png`;
  } else if (stage === 'angel') {
    // For green, the naming pattern is different
    if (color === 'green') {
      return `${basePath}lilguy_angel_${color}_${animName}.png`;
    }
    // For other colors
    return `${basePath}lilguy_angel_${animName}.png`;
  } else if (stage === 'devil') {
    // For green, the naming pattern is different
    if (color === 'green') {
      return `${basePath}lilguy_devil_${color}_${animName}.png`;
    }
    // For other colors
    return `${basePath}lilguy_devil_${animName}.png`;
  } else {
    // Normal lilguy
    // For green, the naming pattern includes 'main'
    if (color === 'green') {
      return `${basePath}lilguy_main_${color}_${animName}.png`;
    }
    // For other colors - just use lilguy_ prefix
    return `${basePath}lilguy_${animName}.png`;
  }
};

// Get animation frames for a specific stage and animation type
export const getAnimationFrames = (stage: LilGuyStage, animation: LilGuyAnimation) => {
  // Get the animation key (e.g., 'idle', 'walk', etc.)
  const animKey = getAnimationKey(animation);
  
  // Get the number of frames for this animation
  const frameCount = animationFrames[animKey] || 1;
  
  // Create an array of frames
  const frames = Array.from({ length: frameCount }, (_, i) => ({ x: 0, y: 0, frameIndex: i }));
  
  // Return the animation data
  return {
    frames,
    frameRate: getFrameRate(animation),
    frameCount
  };
};

// Get the frame rate for different animations
const getFrameRate = (animation: LilGuyAnimation): number => {
  switch (animation) {
    case 'walk': return 10;
    case 'happy': return 12;
    case 'sad': return 8;
    case 'angry': return 10;
    case 'shocked': return 12;
    case 'shake': return 12;
    case 'hatch': return 6;
    default: return 8; // Default for idle
  }
};

// --- Palette Swap Utility for LilGuy Recoloring ---
// Palette values matched to user screenshots
const LILGUY_COLOR_PALETTES: Record<string, number[][]> = {
  black:   [
    [30, 30, 30],   // darkest
    [60, 60, 60],
    [100, 100, 100],
    [160, 160, 160],
    [220, 220, 220], // lightest
  ],
  blue:    [
    [25, 80, 170],   // dark blue outline (from reference)
    [33, 118, 217],  // main blue (from reference #2176D9)
    [87, 156, 255],  // mid highlight
    [120, 180, 255], // outline highlight (lighter blue)
    [255, 255, 255], // white
  ],
  green:   [
    [20, 100, 30],   // dark green outline (from reference)
    [54, 210, 58],   // main green (from reference #36D23A)
    [120, 240, 120], // mid highlight
    [180, 255, 180], // outline highlight (lighter green)
    [255, 255, 255], // white
  ],
  pink:    [
    [100, 30, 70],
    [220, 80, 180],
    [240, 140, 200],
    [255, 200, 220],
    [255, 220, 240],
  ]
};

// Improved: More robust outline/contour detection for colored versions
function isBodyPixel(r: number, g: number, b: number): boolean {
  // Allow a bit more color drift for outlines (tolerate up to 40 difference)
  const maxDiff = 40;
  return Math.abs(r - g) < maxDiff && Math.abs(r - b) < maxDiff && Math.abs(g - b) < maxDiff;
}

export function recolorSpriteImage(
  img: HTMLImageElement,
  targetColor: 'black' | 'blue' | 'green' | 'pink',
  callback: (recoloredImg: HTMLImageElement) => void
): void {
  console.log('[LilGuy] recolorSpriteImage called for color:', targetColor);
  const palette = LILGUY_COLOR_PALETTES[targetColor] || LILGUY_COLOR_PALETTES.black;
  const mainColor = palette[1];
  const outlineColor = palette[3];
  const darkOutline = palette[0];
  const highlightColor = palette[4];
  const offCanvas = document.createElement('canvas');
  offCanvas.width = img.width;
  offCanvas.height = img.height;
  const ctx = offCanvas.getContext('2d');
  if (!ctx) {
    console.error('[LilGuy] Failed to get 2D context');
    return;
  }
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, img.width, img.height);
  const data = imageData.data;
  let recoloredCount = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i+3] === 0) continue; // transparent
    const r = data[i], g = data[i+1], b = data[i+2];
    // If pixel is nearly white, use highlight
    if (r > 220 && g > 220 && b > 220) {
      data[i] = highlightColor[0];
      data[i+1] = highlightColor[1];
      data[i+2] = highlightColor[2];
      data[i+3] = 255;
      recoloredCount++;
      continue;
    }
    // Only recolor neutral/gray pixels (body/outline), preserve colored emotion details
    const maxDiff = 24;
    if (Math.abs(r-g) < maxDiff && Math.abs(r-b) < maxDiff && Math.abs(g-b) < maxDiff) {
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      if (brightness < 20) {
        data[i] = darkOutline[0];
        data[i+1] = darkOutline[1];
        data[i+2] = darkOutline[2];
        data[i+3] = 255;
        recoloredCount++;
      } else if (brightness < 80) {
        data[i] = outlineColor[0];
        data[i+1] = outlineColor[1];
        data[i+2] = outlineColor[2];
        data[i+3] = 255;
        recoloredCount++;
      } else {
        data[i] = mainColor[0];
        data[i+1] = mainColor[1];
        data[i+2] = mainColor[2];
        data[i+3] = 255;
        recoloredCount++;
      }
    }
    // else: colored pixel (emotion/expressive detail), preserve as-is
    if (i % 4000 === 0) {
      console.log(`[LilGuy] Recoloring pixel ${i/4}: rgb(${r},${g},${b}) -> rgb(${data[i]},${data[i+1]},${data[i+2]})`);
    }
  }
  console.log(`[LilGuy] Total recolored pixels: ${recoloredCount} / ${data.length / 4}`);
  ctx.putImageData(imageData, 0, 0);
  const recoloredImg = new window.Image();
  recoloredImg.onload = () => {
    console.log('[LilGuy] Recolored image loaded and callback called');
    callback(recoloredImg);
  };
  recoloredImg.src = offCanvas.toDataURL();
}
// --- END Palette Swap Utility ---
