"use client";
import { useEffect, useRef, useState } from "react";

interface LilGuyProps {
  health: number;
}

export default function LilGuy({ health }: LilGuyProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [playerState, setPlayerState] = useState("idle");
  // const [health, setHealth] = useState(100);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const CANVAS_WIDTH = (canvas.width = 400);
    const CANVAS_HEIGHT = (canvas.height = 250);
    const playerImage = new Image();
    playerImage.src = "/LilGuy_02.png";

    const spriteWidth = 100;
    const spriteHeight = 100;
    let gameFrame = 0;
    const staggerFrames = 5;

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

      ctx.drawImage(
        playerImage,
        frameX,
        frameY,
        spriteWidth,
        spriteHeight,
        150,
        80,
        spriteWidth,
        spriteHeight
      );

      gameFrame++;
      requestAnimationFrame(animate);
    };

    playerImage.onload = () => {
      animate();
    };
  }, [playerState]);

  return (
    <div className="relative flex items-center justify-center bg-gray-100">
      <canvas
        ref={canvasRef}
        id="canvas1"
        className="border border-black w-[100%] h-[auto]"
      />

      <div className="absolute bottom-5 w-full flex justify-center items-center mb-2">
        <div className="relative w-[80%] h-4 bg-gray-300 rounded-full">
          <div
            className={`absolute top-0 left-0 h-full rounded-full`}
            style={{
              width: `${health}%`,
              backgroundColor:
                health <= 30 ? "red" : health <= 70 ? "yellow" : "green",
            }}
          ></div>
        </div>
      </div>

      <div className="absolute bottom-1 text-xs text-black">{health}/100</div>

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
          onChange={(e) => setPlayerState(e.target.value)}
          className="text-xl p-1 rounded bg-white border border-gray-300 text-black"
        >
          <option value="idle">Idle</option>
          <option value="walk">Walk</option>
        </select>
      </div>
    </div>
  );
}
