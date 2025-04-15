"use client";

import { useEmitEmotion } from "@/lib/emotionContext";
import React, { useEffect, useRef, useState } from "react";
import type { LilGuyColor } from "@/components/LilGuy/LilGuy";

// define types for lilguy states
type LilGuyStage = 'egg' | 'normal' | 'angel' | 'devil';

export default function LilGuyInteractor() {
  const emitEmotion = useEmitEmotion();

  const [text, setText] = useState("");
  const [message, setMessage] = useState<string>("");
  const textRef = useRef("");
  const [currentColor, setCurrentColor] = useState<LilGuyColor>("green");
  const [currentStage, setCurrentStage] = useState<LilGuyStage>("normal");
  const [buttonText, setButtonText] = useState("Walk");

  // helper function to safely set localStorage item
  const setLocalStorageItem = (key: string, value: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, typeof value === 'object' || typeof value === 'number' ? JSON.stringify(value) : value);
    }
  };

  useEffect(() => {
    const storedModifiedHealth = localStorage.getItem("modifiedHealth");
    const modifiedHealth = storedModifiedHealth
      ? parseFloat(storedModifiedHealth)
      : undefined;

    const storedName = localStorage.getItem("lilGuyName") || "LilGuy";
    const storedColor = localStorage.getItem("lilGuyColor");
    const storedStage = localStorage.getItem("lilGuyStage");
    
    if (storedColor) {
      setCurrentColor(storedColor as LilGuyColor);
    }
    
    if (storedStage) {
      setCurrentStage(storedStage as LilGuyStage);
    }

    let newMessage = `${storedName} is happy to be alive. WORK WORK WORK!`;

    if (modifiedHealth !== undefined) {
      if (modifiedHealth < 30) {
        newMessage = `${storedName} looks depressed. He doesn't feel like you're meeting your potential.`;
      } else if (modifiedHealth >= 30 && modifiedHealth <= 60) {
        newMessage = `${storedName} is doing OK, but he knows you can do better.`;
      } else if (modifiedHealth >= 61 && modifiedHealth <= 80) {
        newMessage = `${storedName} is feeling positive! He knows you're working hard.`;
      } else if (modifiedHealth >= 81 && modifiedHealth <= 100) {
        newMessage = `${storedName} is over the moon! He's very proud of you.`;
      }
    }

    setMessage(newMessage);
  }, []);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < message.length) {
        textRef.current += message[index];
        setText(textRef.current);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [message]);

  // function to change lilguy color
  const changeLilGuyColor = (color: LilGuyColor) => {
    setCurrentColor(color);
    setLocalStorageItem("lilGuyColor", color);
  };
  
  // function to change lilguy stage
  const changeStage = (stage: LilGuyStage) => {
    setCurrentStage(stage);
    setLocalStorageItem("lilGuyStage", stage);
    
    // trigger different animations based on stage changes
    switch(stage) {
      case 'egg':
        emitEmotion("idle", 100, "button");
        break;
      case 'angel':
        emitEmotion("happy", 100, "button");
        break;
      case 'devil':
        emitEmotion("angry", 100, "button");
        break;
      default:
        emitEmotion("idle", 100, "button");
    }
  };

  return (
    <div className="w-[100%] flex flex-col items-center">
      <div className="w-full min-h-[12.5rem] max-w-[25rem] mb-4">
        <div className="w-full bg-white p-[24px] min-h-[12.5rem] border border-black flex flex-col items-start justify-start">
          <p className="text-left text-xl text-black font-mono">
            {text}
            <span className="ml-1 text-xl cursor-blink">|</span>
          </p>
        </div>
      </div>

      <style jsx>{`
        .cursor-blink {
          animation: blink 0.9s step-end infinite;
        }

        @keyframes blink {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>

      {/* action buttons */}
      <div className="w-full mb-4">
        <h3 className="mb-2 text-pixel-lg font-semibold">Actions</h3>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (buttonText === "Walk") {
                emitEmotion("walk", 100, "button")
              } else {
                emitEmotion("idle", 100, "button")
              }
              setButtonText((prev) => (prev === "Walk" ? "Chill" : "Walk"));
            }}
            className="flex-1 px-3 py-2 bg-gray-100 text-black border border-black rounded transition-all hover:bg-gray-200 text-pixel-sm whitespace-nowrap"
          >
            {buttonText}
          </button>

          <button
            onClick={() => {
              emitEmotion("happy", 50, "button")
            }}
            className="flex-1 px-3 py-2 bg-gray-100 text-black border border-black rounded transition-all hover:bg-gray-200 text-pixel-sm whitespace-nowrap"
          >
            Pet
          </button>
        </div>
      </div>
    </div>
  );
}
