"use client";
import { useEffect, useRef, useState } from "react";

interface LilGuyProps {
  health?: number;
  showControls?: boolean;
  showHealthBar?: boolean;
  size?: 'normal' | 'widget';
  className?: string;
  initialAnimation?: "idle" | "walk";
}

function LilGuyCanvas({
  health = 100,
  showControls = false,
  showHealthBar = false,
  size = 'normal',
  className = "",
  initialAnimation = "idle"
}: LilGuyProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [playerState, setPlayerState] = useState(initialAnimation);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    
    let CANVAS_WIDTH, CANVAS_HEIGHT;

    if (size === 'widget') {
      // smaller canvas for widget
      CANVAS_WIDTH = (canvas.width = 48);
      CANVAS_HEIGHT = (canvas.height = 48);
    } else {
      // web app canvas size
      CANVAS_WIDTH = (canvas.width = 400);
      CANVAS_HEIGHT = (canvas.height = 250);
    }

    const playerImage = new Image();
    playerImage.src = "/lilguy_update.png";

    const spriteWidth = 100;
    const spriteHeight = 100;
    let gameFrame = 0;
    const staggerFrames = 5;

    const scale = 0.25;
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

      // position and scale based on widget/web app
      let xPosition, yPosition, scaledWidth, scaledHeight;

      if (size === 'widget') {
        xPosition = 0;
        yPosition = 0;
        scaledWidth = spriteWidth * 0.5;
        scaledHeight = spriteHeight* 0.5;
      } else {
        // normal size
        xPosition = centerX;
        yPosition = centerY;
        scaledWidth = displayWidth;
        scaledHeight = displayHeight;
      }

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

  // Combine user-provided className with conditional classes
  const canvasClasses = `${size === 'normal' ? 'border border-black bg-gray-100 w-[100%] h-[auto] pb-4' :
      size === 'widget' ? 'w-full h-full' : 'w-[100%] h-[auto]'
    } ${className}`;

  return (
    <div className={`relative flex items-center justify-center ${size === 'widget' ? 'w-full h-full' : ''}`}>
      <canvas
        ref={canvasRef}
        className={canvasClasses}
      />

      {showHealthBar && (
        <div className="absolute bottom-5 w-full">
          <HealthBar health={health} />
        </div>
      )}

      {showControls && (
        <div className="absolute top-6 z-10 text-lg">
          <label
            htmlFor="animations"
            className="mr-2 text-xl font-semibold text-black"
          >
            Choose Animation:
          </label>
          <select
            id="animations"
            name="animations"
            value={playerState}
            onChange={(e) => setPlayerState(e.target.value as "idle" | "walk")}
            className="text-xl p-1 rounded bg-white border border-gray-300 text-black"
          >
            <option value="idle">Idle</option>
            <option value="walk">Walk</option>
          </select>
        </div>
      )}
    </div>
  );
}

// Health Bar Component
interface HealthBarProps {
  health: number;
  showLabel?: boolean;
  className?: string;
}

function HealthBar({ health, showLabel = true, className = "" }: HealthBarProps) {
  return (
    <div className={`w-full flex flex-col justify-center items-center ${className}`}>
      <div className="relative w-[100%] h-4 bg-gray-300 rounded-full mb-2">
        <div
          className="absolute top-0 left-0 h-full rounded-full"
          style={{
            width: `${health}%`,
            backgroundColor:
              health <= 30 ? "red" : health <= 70 ? "yellow" : "green",
          }}
        ></div>
      </div>
      {showLabel && (
        <div className="text-xs text-black">{health}/100</div>
      )}
    </div>
  );
}

// LilGuy for web app
function LilGuy({ health = 100 }: { health?: number }) {
  return (
    <LilGuyCanvas
      health={health}
      showControls={true}
      showHealthBar={true}
      size="normal"
    />
  );
}

// LilGuy for widget
function WidgetLilGuy() {
  return (
    <LilGuyCanvas
      size="widget"
    />
  );
}

// health bar as separate component for widget
function WidgetHealth({ health = 100 }: { health?: number }) {
  return <HealthBar health={health} className="mb-2" />;
}

export { LilGuy, WidgetLilGuy, WidgetHealth };