"use client";
import { useListenToEmotions } from "@/lib/emotionContext";
import { useEffect, useRef, useState } from "react";
import LilGuyInteractor from "../LilGuyInteractor/LilGuyInteractor";
import { HealthBar } from "../HealthBar/HealthBar";
import type { EmotionEvent } from "@/lib/emotionEventBus";
import { useHealth } from "@/context/HealthContext";
import PixelWindow from '../ui/PixelWindow';

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
  const [lilGuyStage, setLilGuyStage] = useState<LilGuyStage>(() => getLocalStorageItem('lilGuyStage', 'normal'));
  const [message, setMessage] = useState<string>("");
  const [lilGuyName, setLilGuyName] = useState<string>("");
  useEffect(() => {
    const storedName = getLocalStorageItem("lilGuyName", "LilGuy");
    setLilGuyName(storedName);
  }, []);
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

  // --- Listen for name changes in localStorage ---
  useEffect(() => {
    const handleStorage = () => {
      const storedName = getLocalStorageItem("lilGuyName", "LilGuy");
      setLilGuyName(storedName);
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('localStorageChanged', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('localStorageChanged', handleStorage);
    };
  }, []);

  // --- Listen for message changes in localStorage ---
  useEffect(() => {
    const handleStorage = () => {
      const storedMessage = getLocalStorageItem("lilGuyMessage", "");
      setMessage(storedMessage);
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('localStorageChanged', handleStorage);
    // Initialize message from localStorage on mount
    handleStorage();
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('localStorageChanged', handleStorage);
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
        ctx.fillText('Loading...', CANVAS_WIDTH / 2 - 30, CANVAS_HEIGHT / 2);
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
    setLocalStorageItem('lilGuyColor', lilGuyColor);
  }, [lilGuyColor]);
  useEffect(() => {
    setLocalStorageItem('lilGuyStage', lilGuyStage);
  }, [lilGuyStage]);

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

// --- Evolution and Simulation Logic ---
const getRandomColor = (): LilGuyColor => {
  const colors: LilGuyColor[] = ["green", "blue", "black"];
  return colors[Math.floor(Math.random() * colors.length)];
};

const getInitialLilGuyState = () => {
  // Color
  let color = getLocalStorageItem("lilGuyColor", null);
  if (!color) {
    color = getRandomColor();
    setLocalStorageItem("lilGuyColor", color);
    console.log("[LilGuy] Assigned random color:", color);
  } else {
    console.log("[LilGuy] Loaded color from localStorage:", color);
  }
  // Stage
  let stage = getLocalStorageItem("lilGuyStage", null);
  if (!stage) {
    stage = "egg";
    setLocalStorageItem("lilGuyStage", stage);
    console.log("[LilGuy] Set stage to egg (default)");
  } else {
    console.log("[LilGuy] Loaded stage from localStorage:", stage);
  }
  // First goal
  let firstGoalSet = getLocalStorageItem("lilGuyFirstGoalSet", false) === "true";
  console.log("[LilGuy] First goal set:", firstGoalSet);
  // Productivity
  let productivity = Number(getLocalStorageItem("lilGuyProductivity", 50));
  let hoursTracked = Number(getLocalStorageItem("lilGuyTrackedHours", 0));
  console.log("[LilGuy] Productivity:", productivity, "Hours tracked:", hoursTracked);
  return { color, stage, firstGoalSet, productivity, hoursTracked };
};

// --- Main LilGuy Component ---
function LilGuy(props: LilGuyProps) {
  const [lilGuyColor, setLilGuyColor] = useState<LilGuyColor>();
  const [lilGuyStage, setLilGuyStage] = useState<LilGuyStage>();
  const [firstGoalSet, setFirstGoalSet] = useState(false);
  const [productivity, setProductivity] = useState(50);
  const [hoursTracked, setHoursTracked] = useState(0);
  const [hatching, setHatching] = useState(false);
  const [simulateProductive, setSimulateProductive] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [lilGuyName, setLilGuyName] = useState<string>("");
  useEffect(() => {
    const storedName = getLocalStorageItem("lilGuyName", "LilGuy");
    setLilGuyName(storedName);
  }, []);

  // --- Listen for name changes in localStorage ---
  useEffect(() => {
    const handleStorage = () => {
      const storedName = getLocalStorageItem("lilGuyName", "LilGuy");
      setLilGuyName(storedName);
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('localStorageChanged', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('localStorageChanged', handleStorage);
    };
  }, []);

  // On mount, initialize state
  useEffect(() => {
    const { color, stage, firstGoalSet, productivity, hoursTracked } = getInitialLilGuyState();
    setLilGuyColor(color);
    setLilGuyStage(stage);
    setFirstGoalSet(firstGoalSet);
    setProductivity(productivity);
    setHoursTracked(hoursTracked);
    setSimulateProductive(false);
    console.log("[LilGuy] useEffect - initial state", { color, stage, firstGoalSet, productivity, hoursTracked });
  }, []);

  // --- Animation on Simulate: always play idle for new stage ---
  const setStageAndIdle = (stage: LilGuyStage) => {
    setLilGuyStage(stage);
    setLocalStorageItem("lilGuyStage", stage);
    setAnimation("idle");
    setLocalStorageItem("lilGuyAnimation", "idle");
  };

  // Simulate goal and productivity events for testing
  const simulateNoGoals = () => {
    setFirstGoalSet(false);
    setLocalStorageItem("lilGuyFirstGoalSet", "false");
    setStageAndIdle("egg");
    setSimulateProductive(false);
    setProductivity(50);
    setHoursTracked(0);
    setLocalStorageItem("lilGuyProductivity", 50);
    setLocalStorageItem("lilGuyTrackedHours", 0);
    setMessage("No goals set. LilGuy is an egg!");
    setLocalStorageItem("lilGuyMessage", "No goals set. LilGuy is an egg!");
    window.dispatchEvent(new CustomEvent('lilguySimulationMessage', { detail: { message: "No goals set. LilGuy is an egg!" } }));
    window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'lilGuyStage', value: 'egg' } }));
  };
  const simulateFirstGoal = () => {
    setFirstGoalSet(true);
    setLocalStorageItem("lilGuyFirstGoalSet", "true");
    setHatching(true);
    setStageAndIdle("egg");
    setSimulateProductive(false);
    setTimeout(() => {
      setHatching(false);
      setStageAndIdle("normal");
      setProductivity(50);
      setHoursTracked(0);
      setLocalStorageItem("lilGuyProductivity", 50);
      setLocalStorageItem("lilGuyTrackedHours", 0);
      setMessage("LilGuy hatched! Ready to work.");
      setLocalStorageItem("lilGuyMessage", "LilGuy hatched! Ready to work.");
      window.dispatchEvent(new CustomEvent('lilguySimulationMessage', { detail: { message: "LilGuy hatched! Ready to work." } }));
      window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'lilGuyStage', value: 'normal' } }));
    }, 1400); // 1.4s for hatch animation
    setMessage("First goal set! LilGuy is hatching...");
    setLocalStorageItem("lilGuyMessage", "First goal set! LilGuy is hatching...");
    window.dispatchEvent(new CustomEvent('lilguySimulationMessage', { detail: { message: "First goal set! LilGuy is hatching..." } }));
    window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'lilGuyStage', value: 'egg' } }));
  };
  const simulateLowProductivity = () => {
    setProductivity(20);
    setHoursTracked(4);
    setLocalStorageItem("lilGuyProductivity", 20);
    setLocalStorageItem("lilGuyTrackedHours", 4);
    setStageAndIdle("devil");
    setSimulateProductive(false);
    setMessage("Uh oh! Productivity is low. Devil form!");
    setLocalStorageItem("lilGuyMessage", "Uh oh! Productivity is low. Devil form!");
    window.dispatchEvent(new CustomEvent('lilguySimulationMessage', { detail: { message: "Uh oh! Productivity is low. Devil form!" } }));
    window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'lilGuyStage', value: 'devil' } }));
  };
  const simulateHighProductivity = () => {
    setProductivity(90);
    setHoursTracked(4);
    setLocalStorageItem("lilGuyProductivity", 90);
    setLocalStorageItem("lilGuyTrackedHours", 4);
    setStageAndIdle("angel");
    setSimulateProductive(false);
    setMessage("Amazing! Productivity is high. Angel form!");
    setLocalStorageItem("lilGuyMessage", "Amazing! Productivity is high. Angel form!");
    window.dispatchEvent(new CustomEvent('lilguySimulationMessage', { detail: { message: "Amazing! Productivity is high. Angel form!" } }));
    window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'lilGuyStage', value: 'angel' } }));
  };
  const simulateProductiveState = () => {
    setProductivity(60);
    setHoursTracked(4);
    setLocalStorageItem("lilGuyProductivity", 60);
    setLocalStorageItem("lilGuyTrackedHours", 4);
    setStageAndIdle("normal");
    setSimulateProductive(true);
    setMessage("Productive day! LilGuy is normal.");
    setLocalStorageItem("lilGuyMessage", "Productive day! LilGuy is normal.");
    window.dispatchEvent(new CustomEvent('lilguySimulationMessage', { detail: { message: "Productive day! LilGuy is normal." } }));
    window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'lilGuyStage', value: 'normal' } }));
  };

  // --- Patch: always use animation state from localStorage ---
  const [animation, setAnimation] = useState<LilGuyAnimation>("idle");
  useEffect(() => {
    const storedAnimation = getLocalStorageItem("lilGuyAnimation", "idle");
    setAnimation(storedAnimation as LilGuyAnimation);
  }, [lilGuyStage]);

  // --- Patch: ensure only egg animations available in egg state ---
  // (Handled in CharacterStyles, but ensure animation is only 'idle' or 'hatch' if egg)
  useEffect(() => {
    if (lilGuyStage === "egg" && animation !== "idle" && animation !== "hatch") {
      setAnimation("idle");
      setLocalStorageItem("lilGuyAnimation", "idle");
    }
  }, [lilGuyStage, animation]);

  // Watch productivity and hoursTracked for real evolution (if not simulating)
  useEffect(() => {
    console.log("[LilGuy] useEffect - evolution check", { productivity, hoursTracked, firstGoalSet, lilGuyStage });
    if (!firstGoalSet) return;
    if (hoursTracked >= 4) {
      if (productivity >= 80 && lilGuyStage !== "angel") {
        setLilGuyStage("angel");
        setLocalStorageItem("lilGuyStage", "angel");
        console.log("[LilGuy] Evolved to angel");
      } else if (productivity <= 30 && lilGuyStage !== "devil") {
        setLilGuyStage("devil");
        setLocalStorageItem("lilGuyStage", "devil");
        console.log("[LilGuy] Evolved to devil");
      } else if (productivity > 30 && productivity < 80 && lilGuyStage !== "normal") {
        setLilGuyStage("normal");
        setLocalStorageItem("lilGuyStage", "normal");
        console.log("[LilGuy] Evolved to normal");
      }
    }
  }, [productivity, hoursTracked, firstGoalSet]);

  // --- Listen for message changes in localStorage (for simulation and cross-component updates) ---
  useEffect(() => {
    const updateMessageFromStorage = () => {
      const msg = getLocalStorageItem("lilGuyMessage", "");
      setMessage(msg);
    };
    window.addEventListener("storage", updateMessageFromStorage);
    window.addEventListener("localStorageChanged", updateMessageFromStorage);
    updateMessageFromStorage();
    return () => {
      window.removeEventListener("storage", updateMessageFromStorage);
      window.removeEventListener("localStorageChanged", updateMessageFromStorage);
    };
  }, []);

  // Always show health bar in the canvas
  return (
    <div>
      <LilGuyCanvas
        {...props}
        showHealthBar={true}
        stage={hatching ? "egg" : lilGuyStage}
        animation={hatching ? "hatch" : animation}
      />

      {/* Message Container */}
      <div className="mt-2 max-w-xs mx-auto">
        <PixelWindow
          header={false}
          className="w-full"
          contentClassName="p-3 text-xs text-black text-center bg-white/95"
          showControls={false}
        >
          {message || `${lilGuyName || 'LilGuy'} is doing OK, but he knows you can do better.`}
        </PixelWindow>
      </div>

      {/* Actions (WALK and PET) */}
      <div className="flex flex-row gap-4 justify-center mt-2">
        <button
          className="pixel-button bg-blue-200 border-black border-2 px-8 py-2 text-lg font-pixel"
          onClick={() => {
            setAnimation('walk');
            setLocalStorageItem('lilGuyAnimation', 'walk');
            // Only set message if not in simulation
            if (!simulateProductive) {
              setMessage(`${lilGuyName || 'LilGuy'} is going for a walk!`);
            }
          }}
        >
          Walk
        </button>
        <button
          className="pixel-button green border-black border-2 px-8 py-2 text-lg font-pixel"
          onClick={() => {
            setAnimation('happy');
            setLocalStorageItem('lilGuyAnimation', 'happy');
            // Only set message if not in simulation
            if (!simulateProductive) {
              setMessage(`${lilGuyName || 'LilGuy'} loves pets!`);
            }
          }}
        >
          Pet
        </button>
      </div>
    </div>
  );
}

// LilGuy for web app
function LilGuyWebApp() {
  return (
    <div className="rounded">
      <LilGuy
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
