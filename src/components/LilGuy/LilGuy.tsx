"use client";
import { useListenToEmotions } from "@/lib/emotionContext";
import { useEffect, useRef, useState } from "react";
import LilGuyInteractor from "../LilGuyInteractor/LilGuyInteractor";
import { HealthBar } from "../HealthBar/HealthBar";


export type LilGuyAnimation = "idle" | "walk" | "happy" | "angry" | "sad" | "shocked";
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
  const [health, setHealth] = useState<number>(() => {
    const storedHealth = localStorage.getItem("modifiedHealth");
    return storedHealth ? JSON.parse(storedHealth) : 55;
  });

  useEffect(() => {
    const storedModifiedHealth = localStorage.getItem("modifiedHealth");
    const storedWeeklyAverage = localStorage.getItem("weeklyAverage");

    if (storedModifiedHealth) {
      setHealth(parseFloat(storedModifiedHealth));
    } else if (storedWeeklyAverage) {
      setHealth(parseFloat(storedWeeklyAverage));
    }
  }, []);

  useEffect(() => {
    const recalculateHealth = () => {
      localStorage.setItem("modifiedHealth", health.toString());
    };

    recalculateHealth();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "weeklyAverage") {
        recalculateHealth();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [health]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [animation, setAnimation] = useState(initialAnimation);
  const [clickCount, setClickCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState<string>("LilGuy");

  useListenToEmotions((emotion) => {
    // TODO: use emotion.intensity to scale the health change!
    // TODO: use emotion.source to scale the health change!
    switch (emotion.type) {
      case "happy":
        if (emotion.intensity === 100) {
          setAnimation("happy");
          setTimeout(() => {
            setAnimation("idle");
          }, 2000);
          setHealth(health + 3)
        } else {
          setAnimation("happy");
          setTimeout(() => {
            setAnimation("idle");
          }, 600);
          setHealth(health + 1)
        }
        break;
      case "sad":
        setAnimation("sad");
        setTimeout(() => {
          setAnimation("idle");
        }, 600);
        setHealth(health - 3)
        break;
      case "angry":
        setAnimation("angry")
        setHealth(health - 2)
        break;
      case "shocked":
        setAnimation("shocked")
        break;
      case "walk":
        if (emotion.intensity === 100) {
          setAnimation("walk");
          setHealth(health + 2)
        } else {
          setAnimation("happy");
          setTimeout(() => {
            setAnimation("idle");
          }, 2000);
          setHealth(health + 2)
        }

        break;
      case "idle":
        setAnimation("idle")
        break;
      default:
        setAnimation("idle")
        break;
    }
  });

  useEffect(() => {
    const storedName = localStorage.getItem("lilGuyName");
    if (storedName) {
      setName(storedName);
    }
  }, []);
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };
  const handleNameBlur = () => {
    setIsEditing(false);
    localStorage.setItem("lilGuyName", name);
  };
  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleNameBlur();
    }
  };

  const handleClick = () => {
    setHealth(health - 3) // TODO: remove, just using to test health changes
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 3) {
      setAnimation("angry");
      setTimeout(() => {
        setAnimation("idle");
        setClickCount(0);
      }, 3000);
    }
  };

  useEffect(() => {
    if (health < 10) {
      setAnimation("sad");
    }
    if (health > 90) {
      setAnimation("happy");
    }
  }, [health]);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let CANVAS_WIDTH, CANVAS_HEIGHT;

    if (size === "widget") {
      CANVAS_WIDTH = canvas.width = 48;
      CANVAS_HEIGHT = canvas.height = 48;
    } else {
      CANVAS_WIDTH = canvas.width = 400;
      CANVAS_HEIGHT = canvas.height = 250;
    }

    const playerImage = new Image();
    playerImage.src = "/lilguy_3.png";

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
      { name: "sad", frames: 6 },
      { name: "shocked", frames: 6 },
    ];

    animationStates.forEach((state, index) => {
      const frames = { loc: [] as { x: number; y: number }[] };
      for (let j = 0; j < state.frames; j++) {
        const positionX = j * spriteWidth;
        const positionY = index * spriteHeight;
        frames.loc.push({ x: positionX, y: positionY });
      }
      spriteAnimations[state.name] = frames;
    });

    const animate = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      const position =
        Math.floor(gameFrame / staggerFrames) %
        spriteAnimations[animation].loc.length;
      const frameX = spriteWidth * position;
      const frameY = spriteAnimations[animation].loc[position].y;

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

      gameFrame++;
      requestAnimationFrame(animate);
    };

    playerImage.onload = () => {
      animate();
    };
  }, [animation, size]);

  const canvasClasses = `${size === "normal"
    ? "border border-black bg-gray-100 w-[100%] h-[auto] pb-4"
    : size === "widget"
      ? "w-full h-full"
      : "w-[100%] h-[auto]"
    } ${className}`;

  return (
    <>
      <div
        className={`relative flex items-center justify-center ${size === "widget" ? "w-full h-full" : ""
          }`}
      >
        <canvas
          ref={canvasRef}
          className={canvasClasses}
          onClick={handleClick}
        />

        {showHealthBar && (
          <div className="absolute bottom-5 w-full">
            <HealthBar health={health ?? 100} />
          </div>
        )}

        {showControls && (
          <div className="absolute top-6 z-10 text-lg">
            {/* <label
              htmlFor="animations"
              className="mr-2 text-xl font-semibold text-black"
            >
              Choose Animation:
            </label>
            <select
              id="animations"
              name="animations"
              value={animation}
              onChange={(e) =>
                setAnimation(
                  e.target.value as
                    | "idle"
                    | "walk"
                    | "happy"
                    | "angry"
                    | "sad"
                    | "shocked"
                )
              }
              className="text-xl p-1 rounded bg-white border border-gray-300 text-black"
            >
              <option value="idle">Idle</option>
              <option value="walk">Walk</option>
              <option value="happy">Happy</option>
              <option value="angry">Angry</option>
              <option value="sad">Sad</option>
              <option value="shocked">Shocked</option>
            </select> */}
          </div>
        )}
        {size === "normal" && (
          <div className="absolute top-6 w-full text-center">
            {isEditing ? (
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                onBlur={handleNameBlur}
                onKeyDown={handleNameKeyDown}
                className="text-2xl bg-transparent border-b-2 border-gray-500 focus:outline-none"
                autoFocus
              />
            ) : (
              <span
                onClick={() => setIsEditing(true)}
                className="text-2xl cursor-pointer"
              >
                {name}
              </span>
            )}
          </div>
        )}
      </div>
      {size === "normal" ?
        <LilGuyInteractor />
        : null
      }
    </>
  );
}

// LilGuy for web app
function LilGuy() {
  return (
    <LilGuyCanvas
      showControls={true}
      showHealthBar={true}
      size="normal"
    />
  );
}
// LilGuy for widget
function WidgetLilGuy() {
  return <LilGuyCanvas size="widget" />;
}

export { LilGuy, WidgetLilGuy };
