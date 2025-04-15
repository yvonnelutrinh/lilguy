"use client";
import { useListenToEmotions } from "@/lib/emotionContext";
import { useEffect, useRef, useState } from "react";
import LilGuyInteractor from "../LilGuyInteractor/LilGuyInteractor";
import { HealthBar } from "../HealthBar/HealthBar";
import type { EmotionEvent } from "@/lib/emotionEventBus";

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
export type LilGuyAnimation = "idle" | "walk" | "happy" | "angry" | "sad" | "shocked";
export type LilGuyStage = "normal" | "egg" | "angel" | "devil";

interface LilGuyProps {
  showControls?: boolean;
  showHealthBar?: boolean;
  size?: "normal" | "widget";
  className?: string;
  initialAnimation?: LilGuyAnimation;
  health?: number;
  setHealth?: React.Dispatch<React.SetStateAction<number | undefined>>;
}

function LilGuyCanvas({
  showControls = false,
  showHealthBar = false,
  size = "normal",
  className = "",
  initialAnimation = "idle",
}: LilGuyProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);
  const [animation, setAnimation] = useState<LilGuyAnimation>(initialAnimation);
  const [health, setHealth] = useState<number>();
  const [lilGuyColor, setLilGuyColor] = useState<LilGuyColor>("green");
  const [lilGuyStage, setLilGuyStage] = useState<LilGuyStage>("normal");
  const [message, setMessage] = useState<string>("");
  const [modifiedHealth, setModifiedHealth] = useState<number>();

  // listen for emotion updates
  useListenToEmotions((emotionEvent: EmotionEvent) => {
    if (emotionEvent.type === "walk" || emotionEvent.type === "idle" || 
        emotionEvent.type === "happy" || emotionEvent.type === "angry" || 
        emotionEvent.type === "sad" || emotionEvent.type === "shocked") {
      
      setAnimation(emotionEvent.type);
      
      if (emotionEvent.source === "goalCompletion") {
        // if health is low, give a bigger boost for completing goals
        setModifiedHealth((prevHealth) => {
          const currentHealth = prevHealth || 0;
          let boost = 0;
          if (currentHealth < 30) {
            boost = 15;
          } else if (currentHealth < 60) {
            boost = 10;
          } else {
            boost = 5;
          }
          const newHealth = Math.min(100, currentHealth + boost);
          setLocalStorageItem("modifiedHealth", newHealth); 
          return newHealth;
        });
        setMessage("Great job on completing that goal!");
      } else if (emotionEvent.source === "goalUnfinished") {
        setModifiedHealth((prevHealth) => {
          const newHealth = Math.max(0, (prevHealth || 0) - 5);
          setLocalStorageItem("modifiedHealth", newHealth);
          return newHealth;
        });
        setMessage("Don't worry, you can try again!");
      } else if (emotionEvent.source === "goodProgress") {
        setModifiedHealth((prevHealth) => {
          const newHealth = Math.min(100, (prevHealth || 0) + 2);
          setLocalStorageItem("modifiedHealth", newHealth);
          return newHealth;
        });
        setMessage("Making good progress!");
      }
    }
  });

  // on mount, get health and other data from localStorage
  useEffect(() => {
    // Get cached modified health from localStorage
    const storedModifiedHealth = getLocalStorageItem("modifiedHealth", 55);
    setModifiedHealth(Number(storedModifiedHealth));

    // Get cached color from localStorage
    const storedColor = getLocalStorageItem("lilGuyColor", "green");
    setLilGuyColor(storedColor as LilGuyColor);

    // Get cached stage from localStorage
    const storedStage = getLocalStorageItem("lilGuyStage", "normal");
    setLilGuyStage(storedStage as LilGuyStage);

    // Reset health bar
    const health = localStorage.getItem("health");
    if (health) {
      setHealth(JSON.parse(health));
    } else {
      setHealth(100);
    }

    // set up window event listeners for localStorage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "lilGuyColor") {
        setLilGuyColor((e.newValue || "green") as LilGuyColor);
      } else if (e.key === "lilGuyStage") {
        setLilGuyStage((e.newValue || "normal") as LilGuyStage);
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
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("localStorageChanged", handleCustomStorageChange as EventListener);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("localStorageChanged", handleCustomStorageChange as EventListener);
    };
  }, []);

  // Draw LilGuy on canvas
  useEffect(() => {
    // handle extreme health
    if (modifiedHealth !== undefined) {
      if (modifiedHealth <= 30) {
        setAnimation("sad");
      } else if (modifiedHealth >= 80) {
        setAnimation("happy");
      }
    }
    
    // for extreme health values, override the stage
    if (modifiedHealth !== undefined) {
      if (modifiedHealth <= 20) {
        if (lilGuyStage !== "devil") {
          setLilGuyStage("devil");
          setLocalStorageItem("lilGuyStage", "devil");
        }
      } else if (modifiedHealth >= 90) {
        if (lilGuyStage !== "angel") {
          setLilGuyStage("angel");
          setLocalStorageItem("lilGuyStage", "angel");
        }
      }
    }
  }, [modifiedHealth, lilGuyStage]);

  // Respond to health changes
  useEffect(() => {
    if (health === undefined) return;

    setLocalStorageItem("health", health);

    if (health < 40) {
      setAnimation("sad");
    }

    if (health > 90) {
      setAnimation("happy");
    }
  }, [health]);

  // main canvas drawing function
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let CANVAS_WIDTH: number, CANVAS_HEIGHT: number;

    if (size === "widget") {
      CANVAS_WIDTH = canvas.width = 48;
      CANVAS_HEIGHT = canvas.height = 48;
    } else {
      CANVAS_WIDTH = canvas.width = 400;
      CANVAS_HEIGHT = canvas.height = 250;
    }

    // create and load the sprite image
    const playerImage = new Image();
    let imageLoaded = false;
    
    // Define our animation function
    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      if (imageLoaded) {
        const position = Math.floor(gameFrame / staggerFrames) % 5;
        if (!spriteAnimations[animation]) {
          return;
        }

        let frameX = spriteAnimations[animation].loc[position]
          ? spriteAnimations[animation].loc[position].x
          : 0;
        let frameY = spriteAnimations[animation].loc[position]
          ? spriteAnimations[animation].loc[position].y
          : 0;

        ctx.drawImage(
          playerImage,
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
        // Draw loading text if image not loaded
        ctx.fillStyle = 'black';
        ctx.font = '16px Arial';
        ctx.fillText('Loading...', CANVAS_WIDTH/2 - 30, CANVAS_HEIGHT/2);
      }
      
      gameFrame++;
      animRef.current = requestAnimationFrame(animate);
    }
    
    try {
      // First try to use our fallback sprite that we know works
      playerImage.src = `/lilguy_3.png`;
      console.log("Loading basic sprite:", playerImage.src);
      
      playerImage.onload = () => {
        imageLoaded = true;
        console.log("Basic sprite loaded successfully");
        
        // Start animation once the image is loaded
        if (animRef.current) {
          cancelAnimationFrame(animRef.current);
        }
        animRef.current = requestAnimationFrame(animate);
      };
      
      playerImage.onerror = () => {
        console.error("Error loading basic sprite");
        // Try fallback SVG or other fallback mechanism
      };
      
    } catch (e) {
      console.error("Error in sprite loading:", e);
    }

    const spriteWidth = 500;
    const spriteHeight = 500;
    let gameFrame = 0;
    const staggerFrames = 5;

    let scale;
    if (size === "widget") {
      scale = 0.25 * 0.4;
    } else {
      scale = 0.25;
    }

    const displayWidth = spriteWidth * scale;
    const displayHeight = spriteHeight * scale;
    const centerX = (CANVAS_WIDTH - displayWidth) / 2;
    const centerY = (CANVAS_HEIGHT - displayHeight) / 2;

    const spriteAnimations: Record<
      string,
      { loc: { x: number; y: number }[] }
    > = {};

    const animationStates = [
      { name: "idle", frames: 6 },
      { name: "walk", frames: 5 },
      { name: "happy", frames: 6 },
      { name: "angry", frames: 5 },
      { name: "sad", frames: 5 },
      { name: "shocked", frames: 4 },
    ];

    // set up animation frames
    animationStates.forEach((state, index) => {
      const frames = {
        loc: [] as { x: number; y: number }[],
      };
      for (let j = 0; j < state.frames; j++) {
        const positionX = j * spriteWidth;
        const positionY = index * spriteHeight;
        frames.loc.push({ x: positionX, y: positionY });
      }
      spriteAnimations[state.name] = frames;
    });

    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, [animation, size, lilGuyColor, lilGuyStage]);

  const canvasClasses = `${size === "normal"
    ? "border border-black bg-gray-100 w-[100%] h-[auto] pb-4 relative"
    : "w-[48px] h-[48px] relative"
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
        <div className="relative">
          <canvas className={canvasClasses} ref={canvasRef} />
          
          {showHealthBar && (
            <div className="absolute bottom-2 left-0 right-0 w-[80%] mx-auto">
              <HealthBar health={modifiedHealth || 0} />
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
function WidgetLilGuy() {
  return <LilGuyCanvas size="widget" showHealthBar={false} />;
}

export { LilGuy, WidgetLilGuy };
