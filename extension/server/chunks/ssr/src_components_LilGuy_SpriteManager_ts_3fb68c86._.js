module.exports = {

"[project]/src/components/LilGuy/SpriteManager.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// Sprite Manager for LilGuy Character
__turbopack_context__.s({
    "getAnimationFrameIndex": (()=>getAnimationFrameIndex),
    "getAnimationFrames": (()=>getAnimationFrames),
    "getSpriteSheetPath": (()=>getSpriteSheetPath),
    "spriteDimensions": (()=>spriteDimensions)
});
const spriteDimensions = {
    width: 500,
    height: 500,
    columns: 1
};
// Frame counts for each animation type
const animationFrames = {
    idle: 5,
    walk: 4,
    happy: 5,
    angry: 4,
    sad: 6,
    sleepy: 6,
    move: 6,
    hatch: 6 // Hatch animation
};
const getAnimationFrameIndex = (animation, frameCount)=>{
    const animKey = getAnimationKey(animation);
    const frameMax = animationFrames[animKey] || 1;
    // Calculate frame based on frame count
    return Math.floor(frameCount / 10) % frameMax;
};
// Map animation types to their corresponding file name parts
const getAnimationKey = (animation)=>{
    switch(animation){
        case 'shocked':
            return 'sleepy'; // Using sleepy for shocked since we don't have shocked
        case 'shake':
            return 'move'; // Using move for shake animation
        default:
            return animation;
    }
};
const getSpriteSheetPath = (stage, color, animation, frameIndex)=>{
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
const getAnimationFrames = (stage, animation)=>{
    // Get the animation key (e.g., 'idle', 'walk', etc.)
    const animKey = getAnimationKey(animation);
    // Get the number of frames for this animation
    const frameCount = animationFrames[animKey] || 1;
    // Create an array of frames
    const frames = Array.from({
        length: frameCount
    }, (_, i)=>({
            x: 0,
            y: 0,
            frameIndex: i
        }));
    // Return the animation data
    return {
        frames,
        frameRate: getFrameRate(animation),
        frameCount
    };
};
// Get the frame rate for different animations
const getFrameRate = (animation)=>{
    switch(animation){
        case 'walk':
            return 10;
        case 'happy':
            return 12;
        case 'sad':
            return 8;
        case 'angry':
            return 10;
        case 'shocked':
            return 12;
        case 'shake':
            return 12;
        case 'hatch':
            return 6;
        default:
            return 8; // Default for idle
    }
};
}}),

};

//# sourceMappingURL=src_components_LilGuy_SpriteManager_ts_3fb68c86._.js.map