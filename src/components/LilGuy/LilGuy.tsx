"use client";
import { useHealth } from "@/context/HealthContext";
import { useListenToEmotions } from "@/lib/emotionContext";
import { EmotionEvent } from "@/lib/emotionEventBus";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { HealthBar } from "../HealthBar/HealthBar";
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
  if (typeof window !==
    'undefined') {
    localStorage.setItem(key, typeof value === 'object' || typeof value === 'number' ? JSON.stringify(value) : value);
  }
};

export type LilGuyColor = "green" | "blue" | "black";
export type LilGuyAnimation = "idle" | "walk" | "happy" | "angry" | "sad" | "shocked" | "shake" | "hatch" | "roll";
export type LilGuyStage = "normal" | "egg" | "angel" | "devil" | "hatchling";

interface LilGuyProps {
  userId?: Id<"users">;
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
  userId,
  showHealthBar = false,
  size = "normal",
  className = "",
  initialAnimation = "idle",
  animation: controlledAnimation,
}: LilGuyProps & { stage?: LilGuyStage; animation?: LilGuyAnimation; color?: LilGuyColor }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);
  const [animation, setAnimation] = useState<LilGuyAnimation>(controlledAnimation || initialAnimation);

  // Fetch LilGuy data from Convex if userId is provided
  const lilguy = useQuery(api.lilguys.get, userId ? { userId } : "skip");

  // State from Convex or fallback to localStorage
  const [lilGuyColor, setLilGuyColor] = useState<LilGuyColor | null>(() =>
    lilguy?.color || getLocalStorageItem('lilGuyColor', null)
  );
  const [lilGuyStage, setLilGuyStage] = useState<LilGuyStage>(() =>
    lilguy?.stage || getLocalStorageItem('lilGuyStage', 'normal')
  );
  const [lilGuyName, setLilGuyName] = useState<string>(() =>
    lilguy?.name || getLocalStorageItem("lilGuyName", "LilGuy")
  );

  // Update local state when Convex data changes
  useEffect(() => {
    if (lilguy) {
      setLilGuyColor(lilguy.color as LilGuyColor);
      setLilGuyStage(lilguy.stage as LilGuyStage);
      setLilGuyName(lilguy.name);
      setAnimation(lilguy.lastAnimation as LilGuyAnimation);
      setHealth(lilguy.health);
    }
  }, [lilguy]);


  const { health, setHealth } = useHealth();

  // --- Sprite image ref ---
  const spriteImageRef = useRef<HTMLImageElement | null>(null);
  const lastSpriteSheetRef = useRef<string>("");

  // --- Sprite loading effect: runs when stage or color changes ---
  useEffect(() => {
    if (lilGuyColor) {
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
    }
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
    const scale = size === "widget" ? 0.25 * 0.4 : 0.25;
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
      const frameX = spriteAnimations[animation]?.loc[position]?.x || 0;
      const frameY = spriteAnimations[animation]?.loc[position]?.y || 0;
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

  // Listen for emotion updates and update health bar if needed // TODO: remove this?
  useListenToEmotions((emotionEvent: EmotionEvent) => {
    // setAnimation(emotionEvent.type);
    if (emotionEvent.health !== undefined) {
      setHealth(emotionEvent.health);
    }
  });

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
            <CharacterNameEditor name={lilGuyName} setName={setLilGuyName} userId={userId} />
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
    </div>
  );
}

// --- Character Name Editor for LilGuy ---
function CharacterNameEditor({ userId, name, setName }: { userId?: Id<"users">, name: string, setName: (name: string) => void }) {
  const [showInput, setShowInput] = useState(false);
  const [newName, setNewName] = useState(name);
  const updateLilguy = useMutation(api.lilguys.update);

  useEffect(() => {
    setNewName(name);
  }, [name]);

  const saveName = () => {
    if (newName.trim()) {
      setName(newName);
      setLocalStorageItem("lilGuyName", newName);

      // Update name in Convex if userId is available
      if (userId) {
        try {
          updateLilguy({ userId, name: newName });
        } catch (error) {
          console.error("Failed to update LilGuy name in Convex:", error);
        }
      }

      setShowInput(false);
    }
  };

  if (!showInput) {
    return (
      <div className="flex items-center justify-center gap-2 w-full">
        <div className="flex-1 text-center font-bold">{name}</div>
        <button
          className="pixel-button text-pixel-sm px-2 py-1"
          onClick={() => setShowInput(true)}
        >
          Edit
        </button>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center gap-2 w-full">
      <input
        type="text"
        value={newName}
        onChange={e => setNewName(e.target.value)}
        className="flex-1 px-2 py-1 border-2 border-black text-center"
        maxLength={15}
      />
      <button
        className="pixel-button bg-pixel-accent text-pixel-sm px-2 py-1"
        onClick={saveName}
      >
        Save
      </button>
      <button
        className="pixel-button pink text-pixel-sm px-2 py-1"
        onClick={() => {
          setNewName(name);
          setShowInput(false);
        }}
      >
        Cancel
      </button>
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
  const firstGoalSet = getLocalStorageItem("lilGuyFirstGoalSet", false) === "true";
  console.log("[LilGuy] First goal set:", firstGoalSet);
  // Productivity
  const productivity = Number(getLocalStorageItem("lilGuyProductivity", 50));
  const hoursTracked = Number(getLocalStorageItem("lilGuyTrackedHours", 0));
  console.log("[LilGuy] Productivity:", productivity, "Hours tracked:", hoursTracked);
  return { color, stage, firstGoalSet, productivity, hoursTracked };
};

// --- Main LilGuy Component ---
function LilGuy({ size = "normal", className = "", initialAnimation = "idle", userId }: LilGuyProps) {
  const lilguy = useQuery(api.lilguys.get, userId ? { userId } : "skip");

  // Convex mutations
  const updateLilguy = useMutation(api.lilguys.update);
  const updateLilguyStage = useMutation(api.lilguys.updateStage);
  const updateLilguyAnimation = useMutation(api.lilguys.updateAnimation);
  const createLilguy = useMutation(api.lilguys.create);
  const markMessageAsRead = useMutation(api.messages.markMessageAsRead);

  // Query for unread messages
  const unreadMessages = useQuery(api.messages.getUnreadMessagesByUser, userId ? { userId } : "skip");
  const lastUnreadMessage = useQuery(api.messages.getLastUnreadMessageByUser, userId ? { userId } : "skip");

  // State from Convex or fallback to localStorage
  const [lilGuyStage, setLilGuyStage] = useState<LilGuyStage>(() =>
    lilguy?.stage || getLocalStorageItem('lilGuyStage', 'egg')
  );
  const [lilGuyColor, setLilGuyColor] = useState<LilGuyColor | null>(() =>
    lilguy?.color || getLocalStorageItem('lilGuyColor', null)
  );
  const [animation, setAnimation] = useState<LilGuyAnimation>(initialAnimation);
  const [firstGoalSet, setFirstGoalSet] = useState(() => getLocalStorageItem('lilGuyFirstGoalSet', false) === 'true');
  const [hatching, setHatching] = useState(false);
  const [evolution, setEvolution] = useState<'angel' | 'devil' | null>(null);
  const [lilGuyName, setLilGuyName] = useState<string>(() =>
    lilguy?.name || getLocalStorageItem("lilGuyName", "LilGuy")
  );
  const [lilGuyMessage, setLilGuyMessage] = useState<string>("");

  // Create a new LilGuy in Convex if one doesn't exist
  useEffect(() => {
    if (userId && !lilguy) {
      console.log("[LilGuy] Creating new LilGuy in Convex");
      const color = getRandomColor();
      const name = "LilGuy";

      try {
        createLilguy({
          userId,
          color,
          name,
        });
        console.log("[LilGuy] Created new LilGuy in Convex");
      } catch (error) {
        console.error("Failed to create LilGuy in Convex:", error);
      }
    }
  }, [userId, lilguy, createLilguy]);

  // Update local state when Convex data changes
  useEffect(() => {
    if (lilguy) {
      setLilGuyColor(lilguy.color as LilGuyColor);
      setLilGuyStage(lilguy.stage as LilGuyStage);
      setLilGuyName(lilguy.name);
    }
  }, [lilguy]);

  // Listen for lilGuyMessage changes in localStorage (fallback)
  useEffect(() => {
    const syncMessage = () => {
      const msg = typeof window !== 'undefined' ? localStorage.getItem('lilGuyMessage') || '' : '';
      setLilGuyMessage(msg);
    };
    syncMessage();
    window.addEventListener('storage', syncMessage);
    window.addEventListener('localStorageChanged', (e: any) => {
      if (e.detail && e.detail.key === 'lilGuyMessage') {
        setLilGuyMessage(e.detail.value);
      }
    });
    return () => {
      window.removeEventListener('storage', syncMessage);
    };
  }, []);

  // Check for new unread messages every second
  useEffect(() => {
    if (!userId) return;
    const intervalId = setInterval(() => {
      if (lastUnreadMessage) {
        if (lastUnreadMessage.body.includes("LilGuy loves productivity!")) {
          setAnimation('happy');
        } else if (lastUnreadMessage.body.includes("LilGuy hates slackers!")) {
            setAnimation('angry');
        }
        setLilGuyMessage(lastUnreadMessage.body);

        // Mark the message as read after displaying it
        markMessageAsRead({ messageId: lastUnreadMessage._id });
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [userId, lastUnreadMessage, markMessageAsRead]);

  // Listen for lilGuyColor changes in localStorage (fallback)
  useEffect(() => {
    const handleColorChange = (e: any) => {
      if (e.detail && e.detail.key === 'lilGuyColor') {
        setLilGuyColor(e.detail.value);
      }
    };
    window.addEventListener('localStorageChanged', handleColorChange);
    return () => {
      window.removeEventListener('localStorageChanged', handleColorChange);
    };
  }, []);

  // On mount, initialize state // TODO: remove this?
  useEffect(() => {
    if (!lilguy) {
      const { color, stage, firstGoalSet, productivity, hoursTracked } = getInitialLilGuyState();
      setLilGuyColor(color);
      setLilGuyStage(stage);
      setFirstGoalSet(firstGoalSet);
      console.log("[LilGuy] useEffect - initial state", { color, stage, firstGoalSet, productivity, hoursTracked });
    }
  }, [lilguy]);

  // Helper: Play animation once then callback
  function playAnimationOnce(setAnimation: any, animation: string, onEnd: () => void, durationMs: number) {
    setAnimation(animation);
    setTimeout(() => {
      onEnd();
    }, durationMs);
  }



  // --- Effect: No Goals Egg State ---
  useEffect(() => {
    if (!firstGoalSet) {
      setLilGuyStage('egg');
      setAnimation('shake');

      // Update stage in Convex if userId is available // TODO: remove this?
      if (userId) {
        try {
          updateLilguyStage({ userId, stage: 'egg' });
        } catch (error) {
          console.error("Failed to update LilGuy stage in Convex:", error);
        }
      }
    }
  }, [firstGoalSet, userId]);

  // --- Effect: First Goal Set (Hatch Sequence) ---
  useEffect(() => {
    if (firstGoalSet && lilGuyStage === 'egg' && !hatching) {
      // Assign random color if not set
      let color = lilguy?.color || getLocalStorageItem('lilGuyColor', null); // TODO: remove this?
      if (!color) {
        color = getRandomColor();
        setLocalStorageItem('lilGuyColor', color);
        setLilGuyColor(color);

        // Update color in Convex if userId is available
        if (userId) {
          try {
            updateLilguy({ userId, color });
          } catch (error) {
            console.error("Failed to update LilGuy color in Convex:", error);
          }
        }
      }
      setHatching(true);
      playAnimationOnce(setAnimation, 'hatch', () => {
        setHatching(false);
        setLilGuyStage('normal');
        setAnimation('idle');

        setLocalStorageItem('lilGuyStage', 'normal');
        setLocalStorageItem('lilGuyAnimation', 'idle');

        // Update stage and animation in Convex if userId is available
        if (userId) {
          try {
            updateLilguyStage({ userId, stage: 'normal' });
            updateLilguyAnimation({ userId, animation: 'idle' });
          } catch (error) {
            console.error("Failed to update LilGuy stage/animation in Convex:", error);
          }
        }
      }, 2000); // 2s hatch
    }
  }, [firstGoalSet, lilGuyStage, hatching, userId, lilguy]);

  // --- Effect: Productivity Evolution ---
  useEffect(() => {
    const prod = Number(getLocalStorageItem('lilGuyProductivity', 50));
    const hours = Number(getLocalStorageItem('lilGuyTrackedHours', 0));
    if (lilGuyStage === 'normal') {
      if (prod >= 80 && hours >= 2 && evolution !== 'angel') {
        setEvolution('angel');
        playAnimationOnce(setAnimation, 'happy', () => {
          setLilGuyStage('angel');
          setAnimation('idle');

          setLocalStorageItem('lilGuyStage', 'angel');
          setLocalStorageItem('lilGuyAnimation', 'idle');

          // Update stage and animation in Convex if userId is available
          if (userId) {
            try {
              updateLilguyStage({ userId, stage: 'angel' });
              updateLilguyAnimation({ userId, animation: 'idle' });
            } catch (error) {
              console.error("Failed to update LilGuy stage/animation in Convex:", error);
            }
          }
        }, 1200);
      } else if (prod < 30 && hours >= 2 && evolution !== 'devil') {
        setEvolution('devil');
        playAnimationOnce(setAnimation, 'angry', () => {
          setLilGuyStage('devil');
          setAnimation('idle');

          setLocalStorageItem('lilGuyStage', 'devil');
          setLocalStorageItem('lilGuyAnimation', 'idle');

          // Update stage and animation in Convex if userId is available
          if (userId) {
            try {
              updateLilguyStage({ userId, stage: 'devil' });
              updateLilguyAnimation({ userId, animation: 'idle' });
            } catch (error) {
              console.error("Failed to update LilGuy stage/animation in Convex:", error);
            }
          }
        }, 1200);
      }
    }
  }, [lilGuyStage, evolution, userId]);

  // --- Hide Controls in Egg State ---
  const controlsVisible = lilGuyStage !== 'egg';

  // Always show health bar in the canvas
  if (!lilGuyColor) {
    return (
      <div className="flex items-center justify-center h-48">
        <span className="text-pixel-sm text-gray-500">Loading LilGuy...</span>
      </div>
    );
  }

  return (
    <div>
      <LilGuyCanvas
        userId={userId}
        {...{ showHealthBar: true, size, className, initialAnimation }}
        stage={hatching ? "egg" : lilGuyStage}
        animation={hatching ? "hatch" : animation}
        color={lilGuyColor}
      />

      {/* Message Container */}
      <div className="mt-2 max-w-xs mx-auto">
        <PixelWindow
          header={false}
          className="w-full"
          contentClassName="p-3 text-xs text-black text-center bg-white/95"
          showControls={false}
        >
          {lilGuyMessage
            ? lilGuyMessage
            : `${lilGuyName || 'LilGuy'} is doing OK, but he knows you can do better.`}
        </PixelWindow>
      </div>

      {/* Actions (WALK and PET) */}
      {controlsVisible && (
        <div className="flex flex-row gap-4 justify-center mt-2">
          <button
            className="pixel-button bg-blue-200 border-black border-2 px-8 py-2 text-lg font-pixel"
            onClick={() => {
              setAnimation('walk');
              setLocalStorageItem('lilGuyAnimation', 'walk');
              setLocalStorageItem('lilGuyMessage', 'LilGuy is going for a walk!');
              window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'lilGuyMessage', value: 'LilGuy is going for a walk!' } }));
            }}
          >
            Walk
          </button>
          <button
            className="pixel-button green border-black border-2 px-8 py-2 text-lg font-pixel"
            onClick={() => {
              setAnimation('happy');
              setLocalStorageItem('lilGuyAnimation', 'happy');
              setLocalStorageItem('lilGuyMessage', 'LilGuy loves pets!');
              window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'lilGuyMessage', value: 'LilGuy loves pets!' } }));
            }}
          >
            Pet
          </button>
        </div>
      )}
    </div>
  );
}

// LilGuy for widget
function WidgetLilGuy(props: { health?: number; stage?: LilGuyStage; animation?: LilGuyAnimation }) {
  // Always hide health bar in the canvas for widget
  return <LilGuyCanvas size="widget" showHealthBar={false} {...props} />;
}

export { getRandomColor, LilGuy, WidgetLilGuy };

