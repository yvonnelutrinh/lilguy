"use client";

import React, { useEffect, useState } from "react";
import type { LilGuyColor, LilGuyStage } from "@/components/LilGuy/LilGuy";
import { useEmitEmotion } from "@/lib/emotionContext";

export default function CharacterStyles() {
  const emitEmotion = useEmitEmotion();
  const [currentColor, setCurrentColor] = useState<LilGuyColor>("green");
  const [currentStage, setCurrentStage] = useState<LilGuyStage>("normal");
  const [buttonText, setButtonText] = useState("Walk");

  // helper function to safely set localStorage item
  const setLocalStorageItem = (key: string, value: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, typeof value === 'object' || typeof value === 'number' ? JSON.stringify(value) : value);
      
      // Dispatch a custom event to notify other components of the change
      const event = new CustomEvent('localStorageChanged', { 
        detail: { key, value }
      });
      window.dispatchEvent(event);
    }
  };

  // helper function to safely get localStorage item
  const getLocalStorageItem = (key: string, defaultValue: any) => {
    if (typeof window !== 'undefined') {
      const item = localStorage.getItem(key);
      return item ? item : defaultValue;
    }
    return defaultValue;
  };

  useEffect(() => {
    const storedColor = getLocalStorageItem("lilGuyColor", "green");
    const storedStage = getLocalStorageItem("lilGuyStage", "normal");
    
    setCurrentColor(storedColor as LilGuyColor);
    setCurrentStage(storedStage as LilGuyStage);
  }, []);

  // function to change lilguy color
  const changeLilGuyColor = (color: LilGuyColor) => {
    setCurrentColor(color);
    setLocalStorageItem("lilGuyColor", color);
    // Trigger an idle animation to refresh the character
    emitEmotion("idle", 100, "button");
  };
  
  // function to change lilguy stage
  const changeStage = (stage: LilGuyStage) => {
    setCurrentStage(stage);
    setLocalStorageItem("lilGuyStage", stage);
    
    // Trigger different animations based on stage changes
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
    <div className="w-full">
      {/* animations section */}
      <div className="mb-4">
        <h3 className="mb-2 text-pixel-lg font-semibold">Animations</h3>
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            onClick={() => emitEmotion("idle", 100, "button")}
            className="w-full px-3 py-2 bg-gray-100 text-black border border-black rounded transition-all hover:bg-gray-200 text-pixel-sm whitespace-nowrap"
          >
            Idle
          </button>
          <button
            onClick={() => emitEmotion("walk", 100, "button")}
            className="w-full px-3 py-2 bg-gray-100 text-black border border-black rounded transition-all hover:bg-gray-200 text-pixel-sm whitespace-nowrap"
          >
            Walk
          </button>
          <button
            onClick={() => emitEmotion("happy", 100, "button")}
            className="w-full px-3 py-2 bg-gray-100 text-black border border-black rounded transition-all hover:bg-gray-200 text-pixel-sm whitespace-nowrap"
          >
            Happy
          </button>
          <button
            onClick={() => emitEmotion("angry", 100, "button")}
            className="w-full px-3 py-2 bg-gray-100 text-black border border-black rounded transition-all hover:bg-gray-200 text-pixel-sm whitespace-nowrap"
          >
            Angry
          </button>
          <button
            onClick={() => emitEmotion("sad", 100, "button")}
            className="w-full px-3 py-2 bg-gray-100 text-black border border-black rounded transition-all hover:bg-gray-200 text-pixel-sm whitespace-nowrap"
          >
            Sad
          </button>
          <button
            onClick={() => emitEmotion("shocked", 100, "button")}
            className="w-full px-3 py-2 bg-gray-100 text-black border border-black rounded transition-all hover:bg-gray-200 text-pixel-sm whitespace-nowrap"
          >
            Shocked
          </button>
        </div>
      </div>
      
      {/* character states */}
      <div className="mb-4">
        <h3 className="mb-2 text-pixel-lg font-semibold">States</h3>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={() => changeStage("normal")}
            className={`w-full px-3 py-2 border border-black rounded transition-all text-pixel-sm whitespace-nowrap ${currentStage === 'normal' ? 'bg-pixel-green text-black font-bold' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            Normal
          </button>
          <button
            onClick={() => changeStage("egg")}
            className={`w-full px-3 py-2 border border-black rounded transition-all text-pixel-sm whitespace-nowrap ${currentStage === 'egg' ? 'bg-pixel-green text-black font-bold' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            Egg
          </button>
          <button
            onClick={() => changeStage("angel")}
            className={`w-full px-3 py-2 border border-black rounded transition-all text-pixel-sm whitespace-nowrap ${currentStage === 'angel' ? 'bg-pixel-green text-black font-bold' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            Angel
          </button>
          <button
            onClick={() => changeStage("devil")}
            className={`w-full px-3 py-2 border border-black rounded transition-all text-pixel-sm whitespace-nowrap ${currentStage === 'devil' ? 'bg-pixel-green text-black font-bold' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            Devil
          </button>
        </div>
      </div>

      {/* colors section */}
      <div className="mb-4">
        <h3 className="mb-2 text-pixel-lg font-semibold">Colors</h3>
        <div className="flex gap-2 mb-4">
          <button 
            className={`w-12 h-12 border-2 ${currentColor === 'green' ? 'outline outline-2 outline-black' : 'border-black'}`}
            style={{ backgroundColor: 'var(--pixel-green)' }}
            onClick={() => changeLilGuyColor('green')}
            aria-label="Green color"
          />
          <button 
            className={`w-12 h-12 border-2 ${currentColor === 'blue' ? 'outline outline-2 outline-black' : 'border-black'}`}
            style={{ backgroundColor: 'var(--pixel-blue)' }}
            onClick={() => changeLilGuyColor('blue')}
            aria-label="Blue color"
          />
          <button 
            className={`w-12 h-12 border-2 ${currentColor === 'black' ? 'outline outline-2 outline-black' : 'border-black'}`}
            style={{ backgroundColor: 'black' }}
            onClick={() => changeLilGuyColor('black')}
            aria-label="Black color"
          />
        </div>
      </div>
    </div>
  );
}
