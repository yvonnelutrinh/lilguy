// This file contains fallback sprite data for when actual sprite files can't be loaded
// Only used as a last resort when proper sprite images aren't available

import { LilGuyColor } from '../../components/LilGuy/LilGuy';

// Helper to check if we're in a browser environment
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

// Helper to create a basic colored square sprite data (as a fallback)
const createBasicSprite = (color: string): string => {
  if (!isBrowser) return '';
  
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 500; // Match actual sprite dimensions
    canvas.height = 500;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return '';
    
    // Fill with transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw a basic character shape
    // Basic character shape
    ctx.fillStyle = color;
    ctx.fillRect(150, 150, 200, 200); // Center square for body
    
    // Eyes
    ctx.fillStyle = 'white';
    ctx.fillRect(200, 200, 30, 30);
    ctx.fillRect(270, 200, 30, 30);
    
    // Simple mouth
    ctx.fillRect(220, 270, 60, 10);
    
    return canvas.toDataURL('image/png');
  } catch (e) {
    console.error('Error creating fallback sprite:', e);
    return '';
  }
};

// Helper function to get a data URL for a sprite
export const getSpriteDataUrl = (color: LilGuyColor): string => {
  // Only generate sprites in browser environment
  if (!isBrowser) return '';
  
  // Color values for different character colors
  const colorValues = {
    green: '#4CAF50',
    blue: '#2196F3',
    black: '#333333',
    pink: '#EC6BAE', // Added pink for sad button
  };
  
  // Create and return sprite data for the specified color
  return createBasicSprite(colorValues[color]);
};

// Function to determine if we should use fallback sprites
export const shouldUseSpriteData = (): boolean => {
  // Only use fallback in browser environment
  return isBrowser;
};
