"use client";
import { useListenToEmotions } from "@/lib/emotionContext";
import { useEffect, useRef, useState } from "react";
import LilGuyInteractor from "../LilGuyInteractor/LilGuyInteractor";
import { HealthBar } from "../HealthBar/HealthBar";
import type { EmotionEvent } from "@/lib/emotionEventBus";
import { useHealth } from "@/context/HealthContext";

// helper function to safely access localStorage
const getLocalStorageItem = (key: string, defaultValue: any) => {
  if (typeof window !== 'undefined') {
    const item = localStorage.getItem(key);
    return item ? (typeof defaultValue === 'number' ? JSON.parse(item) : item) : defaultValue;
  }
  return defaultValue;
};

// helper function to safely set localStorage item
const setLocalStorageItem = (key: string, value: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, typeof value === 'object' || typeof value === 'number' ? JSON.stringify(value) : value);
  }
};

export type LilGuyColor = "green" | "blue" | "black";
export type LilGuyAnimation = "idle" | "walk" | "happy" | "angry" | "sad" | "shocked" | "shake" | "hatch" | "roll";
export type LilGuyStage = "normal" | "egg" | "angel" | "devil" | "hatchling";

interface LilGuyProps {
  showControls?: boolean;
  showHealthBar?: boolean;
  size?: "normal" | "widget";
  className?: string;
  initialAnimation?: LilGuyAnimation;
  health?: number;
  setHealth?: React.Dispatch<React.SetStateAction<number | undefined>>;
}

function getSpriteSheetForStageAndColor(stage: LilGuyStage, color: LilGuyColor) {
  // Map to the correct sheet based on stage and color
  const base = `/assets/sprites/sheets/${color}`;
  switch (stage) {
    case "angel":
      return `${base}/lilguy_angel_${color}.png`;
    case "devil":
      return `${base}/lilguy_devil_${color}.png`;
    case "egg":
      return `${base}/lilguy_egg_${color}.png`;
    case "normal":
    default:
      return `${base}/lilguy_main_${color}.png`;
  }
}

// --- Helper: get animation states for current stage ---
function getAnimationStates(stage: LilGuyStage) {
  if (stage === "egg") {
    return [
      { name: "idle", frames: 6, row: 0 },
      { name: "hatch", frames: 6, row: 1 },
    ];
  }
  return [
    { name: "idle", frames: 6, row: 0 },
    { name: "walk", frames: 5, row: 1 },
    { name: "happy", frames: 6, row: 2 },
    { name: "angry", frames: 5, row: 3 },
    { name: "sad", frames: 5, row: 4 },
    { name: "shocked", frames: 4, row: 5 },
    { name: "shake", frames: 4, row: 6 },
  ];
}

function LilGuyCanvas({
  showControls = false,
  showHealthBar = false,
  size = "normal",
  className = "",
  initialAnimation = "idle",
  health: controlledHealth,
  stage: controlledStage,
  animation: controlledAnimation,
}: LilGuyProps & { stage?: LilGuyStage; animation?: LilGuyAnimation }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);
  const [animation, setAnimation] = useState<LilGuyAnimation>(controlledAnimation || initialAnimation);
  const [lilGuyColor, setLilGuyColor] = useState<LilGuyColor>(() => getLocalStorageItem('lilGuyColor', 'green'));
  const [lilGuyStage, setLilGuyStage] = useState<LilGuyStage>(controlledStage || "normal");
  const [message, setMessage] = useState<string>("");
  const [lilGuyName, setLilGuyName] = useState("LilGuy");
  const { health, setHealth } = useHealth();

  // Listen for color changes from localStorage
  useEffect(() => {
    const onStorageChange = (e: StorageEvent | CustomEvent) => {
      let key, value;
      if (e instanceof CustomEvent) {
        key = e.detail.key;
        value = e.detail.value;
      } else {
        key = e.key;
        value = e.newValue;
      }
      if (key === 'lilGuyColor' && value) {
        setLilGuyColor(value);
      }
    };
    window.addEventListener('storage', onStorageChange);
    window.addEventListener('localStorageChanged', onStorageChange as EventListener);
    return () => {
      window.removeEventListener('storage', onStorageChange);
      window.removeEventListener('localStorageChanged', onStorageChange as EventListener);
    };
  }, []);

  // --- Sprite image ref ---
  const spriteImageRef = useRef<HTMLImageElement | null>(null);
  const lastSpriteSheetRef = useRef<string>("");

  // --- Sprite loading effect: runs when stage or color changes ---
  useEffect(() => {
    const spriteSheetPath = getSpriteSheetForStageAndColor(lilGuyStage, lilGuyColor);
    if (spriteSheetPath === lastSpriteSheetRef.current && spriteImageRef.current) {
      return;
    }
    lastSpriteSheetRef.current = spriteSheetPath;
    const img = new window.Image();
    img.src = spriteSheetPath;
    img.onload = () => {
      spriteImageRef.current = img;
    };
    img.onerror = () => {
      spriteImageRef.current = null;
      console.error("Error loading sprite sheet asset:", spriteSheetPath);
    };
  }, [lilGuyStage, lilGuyColor]);

  // --- Animation loop: draws the correct frame from the sprite sheet ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let gameFrame = 0;
    let running = true;
    const spriteWidth = 500;
    const spriteHeight = 500;
    let scale = size === "widget" ? 0.25 * 0.4 : 0.25;
    const displayWidth = spriteWidth * scale;
    const displayHeight = spriteHeight * scale;
    const CANVAS_WIDTH = canvas.width = size === "widget" ? 48 : 400;
    const CANVAS_HEIGHT = canvas.height = size === "widget" ? 48 : 250;
    const centerX = (CANVAS_WIDTH - displayWidth) / 2;
    const centerY = (CANVAS_HEIGHT - displayHeight) / 2;
    // Get animation states for the current stage
    const animationStates = getAnimationStates(lilGuyStage);
    const spriteAnimations: Record<string, { loc: { x: number; y: number }[] }> = {};
    animationStates.forEach((state) => {
      const frames = { loc: [] as { x: number; y: number }[] };
      for (let j = 0; j < state.frames; j++) {
        const positionX = j * spriteWidth;
        const positionY = state.row * spriteHeight;
        frames.loc.push({ x: positionX, y: positionY });
      }
      spriteAnimations[state.name] = frames;
    });
    const staggerFrames = 8; // adjust for speed
    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(0,0,0,0)";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.restore();
      const animFrames = spriteAnimations[animation]?.loc.length || 1;
      const position = Math.floor(gameFrame / staggerFrames) % animFrames;
      let frameX = spriteAnimations[animation]?.loc[position]?.x || 0;
      let frameY = spriteAnimations[animation]?.loc[position]?.y || 0;
      const imgToDraw = spriteImageRef.current;
      if (imgToDraw) {
        ctx.drawImage(
          imgToDraw,
          frameX,
          frameY,
          spriteWidth,
          spriteHeight,
          centerX,
          centerY,
          displayWidth,
          displayHeight
        );
      } else {
        ctx.fillStyle = 'black';
        ctx.font = '16px Arial';
        ctx.fillText('Loading...', CANVAS_WIDTH/2 - 30, CANVAS_HEIGHT/2);
      }
      gameFrame++;
      if (running) animRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => {
      running = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [animation, size, lilGuyStage]);

  // Listen for emotion updates and update health bar if needed
  useListenToEmotions((emotionEvent: EmotionEvent) => {
    setAnimation(emotionEvent.type);
    if (emotionEvent.health !== undefined) {
      setHealth(emotionEvent.health);
    }
  });

  // --- Listen for health and color changes via custom/localStorage events ---
  useEffect(() => {
    function handleCustomStorageChange(e: any) {
      const { key, value } = e.detail || {};
      if (key === "lilGuyColor") {
        setLilGuyColor(value as LilGuyColor);
      } else if (key === "lilGuyStage") {
        setLilGuyStage(value as LilGuyStage);
      } else if (key === "lilGuyName") {
        setLilGuyName(value);
      }
    }

    function handleStorageChange(e: StorageEvent) {
      if (e.key === "lilGuyColor") {
        setLilGuyColor((e.newValue || "green") as LilGuyColor);
      } else if (e.key === "lilGuyStage") {
        setLilGuyStage((e.newValue || "normal") as LilGuyStage);
      } else if (e.key === "lilGuyName") {
        setLilGuyName(e.newValue || "LilGuy");
      }
    }

    window.addEventListener("localStorageChanged", handleCustomStorageChange as any);
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("localStorageChanged", handleCustomStorageChange as any);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    // Get cached color from localStorage
    const storedColor = getLocalStorageItem("lilGuyColor", "green");
    setLilGuyColor(storedColor as LilGuyColor);

    // Get cached stage from localStorage
    const storedStage = getLocalStorageItem("lilGuyStage", "normal");
    setLilGuyStage(storedStage as LilGuyStage);

    // Get cached name from localStorage
    const storedName = getLocalStorageItem("lilGuyName", "LilGuy");
    setLilGuyName(storedName);

    // set up window event listeners for localStorage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "lilGuyColor") {
        setLilGuyColor((e.newValue || "green") as LilGuyColor);
      } else if (e.key === "lilGuyStage") {
        setLilGuyStage((e.newValue || "normal") as LilGuyStage);
      } else if (e.key === "lilGuyName") {
        setLilGuyName(e.newValue || "LilGuy");
      }
    };

    // Listen for custom events from the CharacterStyles component
    const handleCustomStorageChange = (e: CustomEvent) => {
      const { key, value } = e.detail;
      if (key === "lilGuyColor") {
        console.log("Custom event detected: color change to", value);
        setLilGuyColor(value as LilGuyColor);
      } else if (key === "lilGuyStage") {
        console.log("Custom event detected: stage change to", value);
        setLilGuyStage(value as LilGuyStage);
      } else if (key === "lilGuyName") {
        console.log("Custom event detected: name change to", value);
        setLilGuyName(value);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("localStorageChanged", handleCustomStorageChange as EventListener);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("localStorageChanged", handleCustomStorageChange as EventListener);
    };
  }, []);

  useEffect(() => {
    if (controlledHealth !== undefined) setHealth(controlledHealth);
  }, [controlledHealth]);
  useEffect(() => {
    if (controlledStage) setLilGuyStage(controlledStage);
  }, [controlledStage]);
  useEffect(() => {
    if (controlledAnimation) setAnimation(controlledAnimation);
  }, [controlledAnimation]);

  const canvasClasses = `${size === "normal"
    ? "border-2 border-black bg-transparent pixelated w-[100%] h-[auto] pb-4 relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
    : "w-[48px] h-[48px] relative pixelated border-2 border-black"
    } ${className}`;

  return (
    <div
      className="flex flex-col gap-5 items-center justify-center w-full sm:w-auto"
      data-testid="lilguy-canvas"
    >
      <div
        className={`relative flex flex-col items-center ${size === "normal" ? "" : "w-min"
          }`}
      >
        {/* Show name above the canvas */}
        {size === "normal" && (
          <div className="w-full bg-pixel-primary text-black px-4 py-2 border-t-2 border-l-2 border-r-2 border-black text-center font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {lilGuyName}
          </div>
        )}
        
        {/* Message box for LilGuy */}
        {message && size === "normal" && (
          <div className="pixel-window mb-2 w-full max-w-xs">
            <div className="pixel-window-content p-3">
              <p className="text-sm">{message}</p>
            </div>
          </div>
        )}
        
        <div className="relative">
          <canvas className={canvasClasses} ref={canvasRef} />
          
          {showHealthBar && (
            <div className="absolute bottom-4 left-0 right-0 w-[80%] mx-auto flex flex-col items-center">
              <HealthBar health={health} />
            </div>
          )}
        </div>
      </div>
      {showControls && size === "normal" && (
        <div className="w-full">
          <LilGuyInteractor />
        </div>
      )}
    </div>
  );
}

// LilGuy for web app
function LilGuy() {
  return (
    <div className="rounded">
      <LilGuyCanvas
        showControls
        showHealthBar
      />
    </div>
  );
}

// LilGuy for widget
function WidgetLilGuy(props: { health?: number; stage?: LilGuyStage; animation?: LilGuyAnimation }) {
  // Always hide health bar in the canvas for widget
  return <LilGuyCanvas size="widget" showHealthBar={false} {...props} />;
}

export { LilGuy, WidgetLilGuy };
