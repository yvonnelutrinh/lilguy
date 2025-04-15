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
export type LilGuyAnimation = "idle" | "walk" | "happy" | "angry" | "sad" | "shocked" | "shake" | "hatch";
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
  const [lilGuyName, setLilGuyName] = useState("LilGuy");

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

  useEffect(() => {
    // Health updates
    // Listen for health events in localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "health") {
        try {
          const newHealth = e.newValue ? parseInt(e.newValue, 10) : null;
          setHealth(newHealth || 0);
        } catch (err) {
          console.error("Failed to parse health:", err);
        }
      } else if (e.key === "modifiedHealth") {
        try {
          const newHealth = e.newValue ? parseInt(e.newValue, 10) : null;
          setModifiedHealth(newHealth || 0);
        } catch (err) {
          console.error("Failed to parse modified health:", err);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    
    // Listen for custom events
    const handleCustomEvent = (e: any) => {
      if (e.detail?.key === "health") {
        setHealth(parseInt(e.detail.value, 10) || 0);
      } else if (e.detail?.key === "modifiedHealth") {
        setModifiedHealth(parseInt(e.detail.value, 10) || 0);
      }
    };
    
    window.addEventListener("localStorageChanged", handleCustomEvent);

    // Get initial health value
    const currentHealth = localStorage.getItem("health");
    const currentModifiedHealth = localStorage.getItem("modifiedHealth");
    
    if (currentHealth) {
      try {
        setHealth(parseInt(currentHealth, 10));
      } catch (err) {
        console.error("Failed to parse initial health:", err);
      }
    }
    
    if (currentModifiedHealth) {
      try {
        setModifiedHealth(parseInt(currentModifiedHealth, 10));
      } catch (err) {
        console.error("Failed to parse initial modified health:", err);
      }
    }

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("localStorageChanged", handleCustomEvent);
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
    
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // create and load the sprite image
    const playerImage = new Image();
    let imageLoaded = false;
    let recoloredImage: HTMLImageElement | null = null;

    // Palette swap integration
    import("./SpriteManager").then(({ recolorSpriteImage }) => {
      playerImage.src = `/lilguy_3.png`;
      playerImage.onload = () => {
        imageLoaded = true;
        // Only recolor if not black (default sprite is black)
        if (lilGuyColor !== "black") {
          recolorSpriteImage(playerImage, lilGuyColor as any, (img: HTMLImageElement) => {
            recoloredImage = img;
            if (animRef.current) {
              cancelAnimationFrame(animRef.current);
            }
            animRef.current = requestAnimationFrame(animate);
          });
        } else {
          recoloredImage = null;
          if (animRef.current) {
            cancelAnimationFrame(animRef.current);
          }
          animRef.current = requestAnimationFrame(animate);
        }
      };
      playerImage.onerror = () => {
        console.error("Error loading basic sprite");
      };
    });

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
        const imgToDraw = recoloredImage || playerImage;
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
      animRef.current = requestAnimationFrame(animate);
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
      { name: "shake", frames: 4 },
      { name: "hatch", frames: 4 },
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
    ? "border-2 border-black bg-white pixelated w-[100%] h-[auto] pb-4 relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
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
            <div className="absolute bottom-4 left-0 right-0 w-[80%] mx-auto">
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
