"use client";
import { useEffect, useRef, useState } from "react";
import TextBox from "../TextBox/TextBox";

interface LilGuyProps {
  showControls?: boolean;
  showHealthBar?: boolean;
  size?: "normal" | "widget";
  className?: string;
  initialAnimation?: "idle" | "walk" | "happy" | "angry" | "sad" | "shocked";
  health?: number;
  setHealth?: React.Dispatch<React.SetStateAction<number | undefined>>;
}

function LilGuyCanvas({
  showControls = false,
  showHealthBar = false,
  size = "normal",
  className = "",
  initialAnimation = "idle",
  health,
  setHealth,
}: LilGuyProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [playerState, setPlayerState] = useState(initialAnimation);
  const [clickCount, setClickCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState<string>("LilGuy"); 
  const [previousHealth, setPreviousHealth] = useState<number | undefined>(
    health
  );

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
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount >= 3) {
      setPlayerState("angry");
      setTimeout(() => {
        setPlayerState("idle");
        setClickCount(0);
      }, 3000);
    }
  };

  useEffect(() => {
    const currentHealth = health ?? 100;

      if (currentHealth < 30) {
        setPlayerState("sad");
        setPreviousHealth(currentHealth);
        return;
      }

      if (previousHealth === null) {
        setPreviousHealth(currentHealth);
      }
    if (currentHealth !== previousHealth) {
      const healthChange = currentHealth - (previousHealth ?? 100);

  
      if (healthChange === 3 || healthChange === -3) {
        setPlayerState("shocked");
        setTimeout(() => {
          setPlayerState("idle");
        }, 600);
      } else {
        setPlayerState("idle");
      }

      setPreviousHealth(currentHealth);
    }
  }, [health, previousHealth]);

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
      let frames = { loc: [] as { x: number; y: number }[] };
      for (let j = 0; j < state.frames; j++) {
        let positionX = j * spriteWidth;
        let positionY = index * spriteHeight;
        frames.loc.push({ x: positionX, y: positionY });
      }
      spriteAnimations[state.name] = frames;
    });

    const animate = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      let position =
        Math.floor(gameFrame / staggerFrames) %
        spriteAnimations[playerState].loc.length;
      let frameX = spriteWidth * position;
      let frameY = spriteAnimations[playerState].loc[position].y;

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
  }, [playerState, size]);

  const canvasClasses = `${
    size === "normal"
      ? "border border-black bg-gray-100 w-[100%] h-[auto] pb-4"
      : size === "widget"
      ? "w-full h-full"
      : "w-[100%] h-[auto]"
  } ${className}`;

  return (
    <>
      <div
        className={`relative flex items-center justify-center ${
          size === "widget" ? "w-full h-full" : ""
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
              value={playerState}
              onChange={(e) =>
                setPlayerState(
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
      </div>
      {size === "normal" ? <TextBox animation={playerState} setAnimation={setPlayerState} /> : null}
    </>
  );
}

// Health Bar Component
interface HealthBarProps {
  showLabel?: boolean;
  className?: string;
  health?: number | null;
}

function HealthBar({
  showLabel = true,
  className = "",
  health,
}: HealthBarProps) {
  return (
    <div
      className={`w-full flex flex-col justify-center items-center ${className}`}
    >
      <div className="relative w-[90%] h-4 bg-gray-300 rounded-full mb-2">
        <div
          className="absolute top-0 left-0 h-full rounded-full"
          style={{
            width: `${health}%`,
            backgroundColor:
              (health ?? 100) <= 30
                ? "red"
                : (health ?? 100) <= 70
                ? "yellow"
                : "green",
          }}
        ></div>
      </div>
      {showLabel && (
        <div className="text-xs text-black">
          {Math.floor(health ?? 100)} / 100
        </div>
      )}
    </div>
  );
}

// LilGuy for web app
function LilGuy({
  health = 100,
  setHealth,
}: {
  health?: number;
  setHealth?: React.Dispatch<React.SetStateAction<number | undefined>>;
}) {
  return (
    <LilGuyCanvas
      health={health}
      setHealth={setHealth}
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

// health bar as separate component for widget
function WidgetHealth({ health = 100 }: { health?: number }) {
  const [widgetHealth, setWidgetHealth] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("weeklyAverage");
    if (stored) {
      setWidgetHealth(parseFloat(stored));
    } else {
      setWidgetHealth(health);
    }
  }, []);

  return <HealthBar health={widgetHealth ?? 100} className="mb-2" />;
}

export { LilGuy, WidgetLilGuy, WidgetHealth };
