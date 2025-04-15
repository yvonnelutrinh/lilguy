"use client";

import React, { useEffect, useState } from "react";
import type { LilGuyColor, LilGuyStage } from "@/components/LilGuy/LilGuy";
import { useEmitEmotion } from "@/lib/emotionContext";
import { SimpleContainer } from "../ui/SimpleContainer/SimpleContainer";

export default function CharacterStyles() {
  const emitEmotion = useEmitEmotion();
  const [currentColor, setCurrentColor] = useState<LilGuyColor>("green");
  const [currentStage, setCurrentStage] = useState<LilGuyStage>("normal");
  const [buttonText, setButtonText] = useState("Walk");
  const [name, setName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [newName, setNewName] = useState("");

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
    const storedName = getLocalStorageItem("lilGuyName", "LilGuy");
    
    setCurrentColor(storedColor as LilGuyColor);
    setCurrentStage(storedStage as LilGuyStage);
    setName(storedName);
    setNewName(storedName);
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

  // function to save lilguy name
  const saveName = () => {
    if (newName.trim()) {
      setName(newName);
      setLocalStorageItem("lilGuyName", newName);
      setShowNameInput(false);
      // Trigger a happy animation when name is updated
      emitEmotion("happy", 100, "button");
    }
  };

  return (
    <SimpleContainer title="Testing Customization" description="Temp window to test customizing LilGuy's appearance and toggle animations">
      {/* Name customization */}
      <div className="mb-6">
        <h3 className="mb-2 text-lg font-semibold">Character Name</h3>
        {showNameInput ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 px-3 py-2 border-2 border-black"
              placeholder="Enter name"
              maxLength={15}
            />
            <button 
              onClick={saveName}
              className="pixel-button bg-pixel-accent text-pixel-sm whitespace-nowrap"
            >
              Save
            </button>
            <button 
              onClick={() => {
                setNewName(name);
                setShowNameInput(false);
              }}
              className="pixel-button text-pixel-sm whitespace-nowrap"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 border-2 border-black bg-gray-50">
              {name}
            </div>
            <button 
              onClick={() => setShowNameInput(true)}
              className="pixel-button text-pixel-sm whitespace-nowrap"
            >
              Edit
            </button>
          </div>
        )}
      </div>
      
      {/* animations section */}
      <div className="mb-6">
        <h3 className="mb-2 text-lg font-semibold">Animations</h3>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => emitEmotion("idle", 100, "button")}
            className="pixel-button beige text-pixel-sm whitespace-nowrap"
          >
            Idle
          </button>
          <button
            onClick={() => emitEmotion("walk", 100, "button")}
            className="pixel-button text-pixel-sm whitespace-nowrap"
          >
            Walk
          </button>
          <button
            onClick={() => emitEmotion("happy", 100, "button")}
            className="pixel-button green text-pixel-sm whitespace-nowrap"
          >
            Happy
          </button>
          <button
            onClick={() => emitEmotion("angry", 100, "button")}
            className="pixel-button contrast text-pixel-sm whitespace-nowrap"
          >
            Angry
          </button>
          <button
            onClick={() => emitEmotion("sad", 100, "button")}
            className="pixel-button pink text-pixel-sm whitespace-nowrap"
          >
            Sad
          </button>
          <button
            onClick={() => emitEmotion("shocked", 100, "button")}
            className="pixel-button contrast text-pixel-sm whitespace-nowrap"
          >
            Shocked
          </button>
        </div>
      </div>
      
      {/* LilGuy Color selection */}
      <div className="mb-6">
        <h3 className="mb-2 text-lg font-semibold">LilGuy Color</h3>
        <div className="flex flex-row gap-2 items-center mt-2">
          <span className="font-mono text-xs">LilGuy Color:</span>
          {["green", "blue", "black", "pink", "brown"].map((color) => (
            <button
              key={color}
              style={{
                background:
                  color === "green"
                    ? "#4CAF50"
                    : color === "blue"
                    ? "#2196F3"
                    : color === "black"
                    ? "#333"
                    : color === "pink"
                    ? "#EC6BAE"
                    : color === "brown"
                    ? "#8B5C2A"
                    : "#fff",
                border:
                  currentColor === color
                    ? "2px solid #FFD700"
                    : "2px solid #222",
                color: color === "black" || color === "brown" ? "#fff" : "#222",
                fontWeight: currentColor === color ? "bold" : "normal",
                fontFamily: 'inherit',
                padding: '0.3rem 0.7rem',
                borderRadius: 4,
                cursor: 'pointer',
                boxShadow:
                  currentColor === color
                    ? '0 0 0 2px #FFD700, 2px 2px 0 #000'
                    : '2px 2px 0 #000',
                outline: 'none',
                transition: 'all 0.1s',
                fontSize: 13,
              }}
              onClick={() => changeLilGuyColor(color as LilGuyColor)}
              aria-label={`Set LilGuy color to ${color}`}
            >
              {color.charAt(0).toUpperCase() + color.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Evolution Stage */}
      <div className="mb-4">
        <h3 className="mb-2 text-lg font-semibold">Evolution Stage</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => changeStage("egg")}
            className={`pixel-button beige text-pixel-sm whitespace-nowrap ${currentStage === "egg" ? "border-4 border-black" : ""}`}
          >
            Egg
          </button>
          <button
            onClick={() => changeStage("normal")}
            className={`pixel-button text-pixel-sm whitespace-nowrap ${currentStage === "normal" ? "border-4 border-black" : ""}`}
          >
            Normal
          </button>
          <button
            onClick={() => changeStage("angel")}
            className={`pixel-button green text-pixel-sm whitespace-nowrap ${currentStage === "angel" ? "border-4 border-black" : ""}`}
          >
            Angel
          </button>
          <button
            onClick={() => changeStage("devil")}
            className={`pixel-button contrast text-pixel-sm whitespace-nowrap ${currentStage === "devil" ? "border-4 border-black" : ""}`}
          >
            Devil
          </button>
        </div>
      </div>
    </SimpleContainer>
  );
}
