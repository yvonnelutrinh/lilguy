"use client";

import React, { useEffect, useState } from "react";
import type { LilGuyColor, LilGuyStage } from "@/components/LilGuy/LilGuy";
import { useEmitEmotion } from "@/lib/emotionContext";
import { SimpleContainer } from "../UI/SimpleContainer/SimpleContainer";
import { triggerFirstGoalSequence } from '@/lib/lilguyActions';

export default function TestWindow() {
  const emitEmotion = useEmitEmotion();
  const [currentColor, setCurrentColor] = useState<LilGuyColor>("green");
  const [currentStage, setCurrentStage] = useState<LilGuyStage>("normal");
  const [buttonText, setButtonText] = useState("Walk");
  const [name, setName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [newName, setNewName] = useState("");
  const [message, setMessage] = useState("");
  const [isChilling, setIsChilling] = useState(false);

  // helper: safely set localStorage item
  const setLocalStorageItem = (key: string, value: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, typeof value === 'object' || typeof value === 'number' ? JSON.stringify(value) : value);
      // let other components know localStorage changed
      const event = new CustomEvent('localStorageChanged', { 
        detail: { key, value }
      });
      window.dispatchEvent(event);
    }
  };

  // helper: safely get localStorage item
  const getLocalStorageItem = (key: string, defaultValue: any) => {
    if (typeof window !== 'undefined') {
      const item = localStorage.getItem(key);
      return item ? item : defaultValue;
    }
    return defaultValue;
  };

  const setAndSyncMessage = (msg: string) => {
    setMessage(msg);
    setLocalStorageItem('lilGuyMessage', msg);
  };

  useEffect(() => {
    const storedColor = getLocalStorageItem("lilGuyColor", "green");
    const storedStage = getLocalStorageItem("lilGuyStage", "normal");
    const storedName = getLocalStorageItem("lilGuyName", "LilGuy");
    const storedMessage = getLocalStorageItem("lilGuyMessage", "");
    
    setCurrentColor(storedColor as LilGuyColor);
    setCurrentStage(storedStage as LilGuyStage);
    setName(storedName);
    setNewName(storedName);
    setMessage(storedMessage);
  }, []);

  // change lilguy color and trigger idle animation
  const changeLilGuyColor = (color: LilGuyColor) => {
    setCurrentColor(color);
    setLocalStorageItem("lilGuyColor", color);
    emitEmotion("idle", 100, "button");
  };
  
  // change lilguy stage and save to localStorage
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

  // save lilguy name
  const saveName = () => {
    if (newName.trim()) {
      setName(newName);
      setLocalStorageItem("lilGuyName", newName);
      setShowNameInput(false);
      // trigger happy animation when name is updated
      emitEmotion("happy", 100, "button");
    }
  };

  // --- Simulate Unproductive ---
  const simulateUnproductive = () => {
    setLocalStorageItem("lilGuyProductivity", 20);
    setLocalStorageItem("lilGuyTrackedHours", 4);
    setLocalStorageItem("lilGuyStage", "devil");
    emitEmotion("angry", 100, "button");
    setAndSyncMessage("Uh oh! Productivity is low. Devil form!");
    window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'lilGuyStage', value: 'devil' } }));
  };

  // --- Simulate Productive ---
  const simulateProductive = () => {
    setLocalStorageItem("lilGuyProductivity", 90);
    setLocalStorageItem("lilGuyTrackedHours", 4);
    setLocalStorageItem("lilGuyStage", "angel");
    emitEmotion("happy", 100, "button");
    setAndSyncMessage("Amazing! Productivity is high. Angel form!");
    window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'lilGuyStage', value: 'angel' } }));
  };

  // --- Simulate Normal State with Sample Goals and Websites ---
  const handleSimulateNormal = () => {
    // Sample goals (not completed, progress < 100)
    const sampleGoals = [
      { id: 1, title: 'Study documentation for 2 hours', completed: false, progress: 45 },
      { id: 2, title: 'Complete 3 coding challenges', completed: false, progress: 50 },
      { id: 3, title: 'Limit social media to 30 minutes', completed: false, progress: 60 },
    ];
    // Sample websites (productive/unproductive, < 4h each)
    const sampleWebsites = [
      { id: 1, name: 'github.com', category: 'productive', timeSpent: 125 }, // 2h 5m
      { id: 2, name: 'stackoverflow.com', category: 'productive', timeSpent: 94 }, // 1h 34m
      { id: 3, name: 'docs.google.com', category: 'productive', timeSpent: 67 }, // 1h 7m
      { id: 4, name: 'youtube.com', category: 'unproductive', timeSpent: 103 }, // 1h 43m
      { id: 5, name: 'netflix.com', category: 'unproductive', timeSpent: 45 }, // 45m
      { id: 6, name: 'twitter.com', category: 'unproductive', timeSpent: 86 }, // 1h 26m
      { id: 7, name: 'localhost', category: 'productive', timeSpent: 0 },
    ];
    localStorage.setItem('goals', JSON.stringify(sampleGoals));
    localStorage.setItem('websites', JSON.stringify(sampleWebsites));
    localStorage.setItem('lilGuyStage', 'normal');
    localStorage.setItem('lilGuyFirstGoalSet', 'true');
    localStorage.setItem('lilGuyProductivity', '60');
    localStorage.setItem('lilGuyTrackedHours', '3');
    localStorage.setItem('productive_seconds', (125*60+94*60+67*60).toString());
    localStorage.setItem('unproductive_seconds', (103*60+45*60+86*60).toString());
    localStorage.setItem('total_seconds', (125*60+94*60+67*60+103*60+45*60+86*60).toString());
    localStorage.setItem('weeklyAverage', '60');
    localStorage.setItem('streak', '1');
    // Also reset health and name for consistency
    localStorage.setItem('health', '100');
    localStorage.setItem('lilGuyName', 'LilGuy');
    // Fire events for key state changes
    window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'lilGuyStage', value: 'normal' } }));
    window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'goals', value: JSON.stringify(sampleGoals) } }));
    window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'websites', value: JSON.stringify(sampleWebsites) } }));
    window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'productive_seconds', value: (125*60+94*60+67*60).toString() } }));
    window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'unproductive_seconds', value: (103*60+45*60+86*60).toString() } }));
    window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'total_seconds', value: (125*60+94*60+67*60+103*60+45*60+86*60).toString() } }));
    window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'weeklyAverage', value: '60' } }));
    window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'streak', value: '1' } }));
    window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'lilGuyProductivity', value: '60' } }));
    window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'lilGuyTrackedHours', value: '3' } }));
    // Full reload for clean state
    window.location.reload();
  };

  // --- LilGuy Reset Button for Simulation ---
  const handleLilGuyReset = () => {
    // Remove all relevant LilGuy and productivity state keys
    [
      'lilGuyColor',
      'lilGuyStage',
      'lilGuyFirstGoalSet',
      'lilGuyProductivity',
      'lilGuyTrackedHours',
      'lilGuyAnimation',
      'lilGuyMessage',
      'health',
      'goals',
      'lilGuyName',
      'productive_seconds',
      'unproductive_seconds',
      'total_seconds',
      'weeklyAverage',
      'streak',
      'localhost_seconds',
      'github_seconds',
      'netflix_seconds',
      'websiteTracker',
      'websites',
    ].forEach(key => localStorage.removeItem(key));
    // Set all time and streak values to 0
    localStorage.setItem('productive_seconds', '0');
    localStorage.setItem('unproductive_seconds', '0');
    localStorage.setItem('total_seconds', '0');
    localStorage.setItem('weeklyAverage', '0');
    localStorage.setItem('streak', '0');
    localStorage.setItem('localhost_seconds', '0');
    localStorage.setItem('github_seconds', '0');
    localStorage.setItem('netflix_seconds', '0');
    // Set empty goals and websites
    localStorage.setItem('goals', '[]');
    localStorage.setItem('websites', '[]');
    // Set all dashboard metrics to zero for egg state
    localStorage.setItem('lilGuyProductivity', '0');
    localStorage.setItem('lilGuyTrackedHours', '0');
    // Set lilGuyFirstGoalSet to false
    localStorage.setItem('lilGuyFirstGoalSet', 'false');
    localStorage.setItem('lilGuyStage', 'egg');
    // Fire events for key state changes
    window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'lilGuyStage', value: 'egg' } }));
    window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'goals', value: '[]' } }));
    window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'websites', value: '[]' } }));
    window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'productive_seconds', value: '0' } }));
    window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'unproductive_seconds', value: '0' } }));
    window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'total_seconds', value: '0' } }));
    window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'weeklyAverage', value: '0' } }));
    window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'streak', value: '0' } }));
    window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'lilGuyProductivity', value: '0' } }));
    window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'lilGuyTrackedHours', value: '0' } }));
    // Full reload for clean state
    window.location.reload();
    setAndSyncMessage("LilGuy is an egg. Add your first goal to get started!");
  };

  // Dynamically update animation buttons based on current stage
  useEffect(() => {
    const handleStorage = () => {
      const stage = getLocalStorageItem("lilGuyStage", "normal");
      setCurrentStage(stage as LilGuyStage);
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('localStorageChanged', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('localStorageChanged', handleStorage);
    };
  }, []);

  return (
    <SimpleContainer title="Testing Customization" description="Temp window to test customizing LilGuy's appearance and toggle animations">
      {/* --- Simulation Controls (for dev/testing only) --- */}
      <div className="flex flex-wrap gap-2 mt-4">
        <button className="pixel-button blue" onClick={handleSimulateNormal}>
          Simulate Normal State
        </button>
        <button className="pixel-button green" onClick={simulateUnproductive}>
          Simulate Unproductive
        </button>
        <button className="pixel-button pink" onClick={simulateProductive}>
          Simulate Productive
        </button>
        <button className="pixel-button contrast border-black border-2 px-3 py-1 text-xs" onClick={handleLilGuyReset}>
          Reset LilGuy
        </button>
      </div>

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
      
      {/* Animations */}
      <div className="mb-6">
        <h3 className="mb-2 text-lg font-semibold">Animations</h3>
        <div className="grid grid-cols-3 gap-2">
          {currentStage === 'egg' ? (
            <>
              <button
                onClick={() => emitEmotion("shake", 100, "button")}
                className="pixel-button beige text-pixel-sm whitespace-nowrap"
              >
                Shake
              </button>
              <button
                onClick={() => emitEmotion("hatch", 100, "button")}
                className="pixel-button green text-pixel-sm whitespace-nowrap"
              >
                Hatch
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => emitEmotion("idle", 100, "button")}
                className="pixel-button beige text-pixel-sm whitespace-nowrap"
              >
                Idle
              </button>
              <button
                onClick={() => {
                  if (!isChilling) {
                    setIsChilling(true);
                    emitEmotion('walk', 100, 'button');
                  } else {
                    setIsChilling(false);
                    emitEmotion('idle', 100, 'button');
                  }
                }}
                className="pixel-button text-pixel-sm whitespace-nowrap"
              >
                {isChilling ? 'Chill' : 'Walk'}
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
            </>
          )}
        </div>
      </div>
      
      {/* LilGuy Color */}
      <div className="mb-6">
        <h3 className="mb-2 text-lg font-semibold">LilGuy Color</h3>
        <div className="flex flex-row gap-2 items-center mt-2">
          <span className="font-mono text-xs">LilGuy Color:</span>
          {['green', 'blue', 'black'].map((color) => (
            <button
              key={color}
              style={{
                background:
                  color === 'green'
                    ? '#4CAF50'
                    : color === 'blue'
                    ? '#2196F3'
                    : color === 'black'
                    ? '#333'
                    : '#fff',
                border:
                  currentColor === color
                    ? '2px solid #FFD700'
                    : '2px solid #222',
                color: color === 'black' ? '#fff' : '#222',
                fontWeight: currentColor === color ? 'bold' : 'normal',
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

export { triggerFirstGoalSequence };
