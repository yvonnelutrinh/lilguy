"use client";

import React, { useEffect, useState } from "react";
import type { LilGuyColor, LilGuyStage } from "@/components/LilGuy/LilGuy";
import { useEmitEmotion } from "@/lib/emotionContext";
import { SimpleContainer } from "../UI/SimpleContainer/SimpleContainer";
import { triggerFirstGoalSequence } from '@/lib/lilguyActions';
import { normalWebsites, productiveWebsites, unproductiveWebsites } from '../SiteList/SiteList';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { generateLocalTokenIdentifier } from "@/app/page";
import { useQuery } from "convex/react";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
// --- Test Section Components ---
function TestSimulationControls({ handleSimulateNormal, simulateUnproductive, simulateProductive, handleLilGuyReset }: any) {
  return (
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
  );
}

function TestNameEditor({ showNameInput, setShowNameInput, newName, setNewName, saveName, name }: any) {
  return (
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
  );
}

function TestAnimations({ currentStage, emitEmotion }: any) {
  return (
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
              onClick={() => emitEmotion("walk", 100, "button")}
              className="pixel-button blue text-pixel-sm whitespace-nowrap"
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
              className="pixel-button red text-pixel-sm whitespace-nowrap"
            >
              Angry
            </button>
            <button
              onClick={() => emitEmotion("sad", 100, "button")}
              className="pixel-button gray text-pixel-sm whitespace-nowrap"
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
  );
}

function TestLilGuyColor({ currentColor, changeLilGuyColor }: any) {

  // const updateCustomColor = useMutation(api.users.updateCustomColor);

  // const newColor = e.target.value;
  // setCharacterColor(newColor as LilGuyColor);

  // if (user) {
  //   updateCustomColor({
  //     tokenIdentifier: `clerk:${user.id}`,
  //     customColor: newColor,
  //   }).catch(err => console.error("Error updating color:", err));
  // } else {
  //   // Save color preference to localStorage when no user is logged in
  //   localStorage.setItem('customColor', newColor);
  // }


  return (
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
            }}
            className="pixel-button text-pixel-sm px-6"
            onClick={() => changeLilGuyColor(color)}
          >
            {color.charAt(0).toUpperCase() + color.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}

function TestEvolutionStage({ currentStage, changeStage }: any) {
  return (
    <div className="mb-6">
      <h3 className="mb-2 text-lg font-semibold">Evolution Stage</h3>
      <div className="flex flex-row gap-2 items-center mt-2">
        <span className="font-mono text-xs">Current Stage: {currentStage}</span>
        {['egg', 'hatchling', 'normal', 'angel', 'devil'].map((stage) => (
          <button
            key={stage}
            className="pixel-button text-pixel-sm px-6"
            onClick={() => changeStage(stage)}
          >
            {stage.charAt(0).toUpperCase() + stage.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function TestWindow({ userId }: { userId: string | undefined }) {
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
    switch (stage) {
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
    convex.mutation(api.messages.createMessage, {
      userId: userId || "",
      body: `LilGuy loves productivity! You visited nextjs.org for 99 seconds`,
      type: "sitevisit",
      source: "nextjs.org/",
      durationSeconds: 99,
    })

    // TODO remove?
    // setLocalStorageItem("lilGuyProductivity", 20);
    // setLocalStorageItem("lilGuyTrackedHours", 4);
    // setLocalStorageItem("lilGuyStage", "devil");
    // emitEmotion("angry", 100, "button");
    // setAndSyncMessage("Uh oh! Productivity is low. Devil form!");
    // window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'lilGuyStage', value: 'devil' } }));
    // localStorage.setItem('websites', JSON.stringify(unproductiveWebsites));
  };

  // --- Simulate Productive ---
  const simulateProductive = () => {
    convex.mutation(api.messages.createMessage, {
      userId: userId || "",
      body: `LilGuy hates slackers! You visited fb.com for 66 seconds`,
      type: "sitevisit",
      source: "fb.com",
      durationSeconds: 66,
    })

    // TODO remove?
    // setLocalStorageItem("lilGuyProductivity", 90);
    // setLocalStorageItem("lilGuyTrackedHours", 4);
    // setLocalStorageItem("lilGuyStage", "angel");
    // emitEmotion("happy", 100, "button");
    // setAndSyncMessage("Amazing! Productivity is high. Angel form!");
    // window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'lilGuyStage', value: 'angel' } }));
    // localStorage.setItem('websites', JSON.stringify(productiveWebsites));
  };

  // --- Simulate Normal State with Sample Goals and Websites ---
  const handleSimulateNormal = () => {
    // Sample goals (not completed, progress < 100)
    const sampleGoals = [
      { id: 1, title: 'Study documentation for 2 hours', completed: false, progress: 45 },
      { id: 2, title: 'Complete 3 coding challenges', completed: false, progress: 50 },
      { id: 3, title: 'Limit social media to 30 minutes', completed: false, progress: 60 },
    ];
    // Use normalWebsites for simulation
    const sampleWebsites = normalWebsites;
    localStorage.setItem('goals', JSON.stringify(sampleGoals));
    localStorage.setItem('websites', JSON.stringify(sampleWebsites));
    localStorage.setItem('lilGuyStage', 'normal');
    localStorage.setItem('lilGuyFirstGoalSet', 'true');
    localStorage.setItem('lilGuyProductivity', '60');
    localStorage.setItem('lilGuyTrackedHours', '3');
    localStorage.setItem('productive_seconds', (125 * 60 + 94 * 60 + 67 * 60).toString());
    localStorage.setItem('unproductive_seconds', (103 * 60 + 45 * 60 + 86 * 60).toString());
    localStorage.setItem('total_seconds', (125 * 60 + 94 * 60 + 67 * 60 + 103 * 60 + 45 * 60 + 86 * 60).toString());
    localStorage.setItem('weeklyAverage', '60');
    localStorage.setItem('streak', '1');
    // Also reset health and name for consistency
    localStorage.setItem('health', '100');
    localStorage.setItem('lilGuyName', 'LilGuy');
    // Fire events for key state changes
    window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'lilGuyStage', value: 'normal' } }));
    window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'goals', value: JSON.stringify(sampleGoals) } }));
    window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'websites', value: JSON.stringify(sampleWebsites) } }));
    window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'productive_seconds', value: (125 * 60 + 94 * 60 + 67 * 60).toString() } }));
    window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'unproductive_seconds', value: (103 * 60 + 45 * 60 + 86 * 60).toString() } }));
    window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'total_seconds', value: (125 * 60 + 94 * 60 + 67 * 60 + 103 * 60 + 45 * 60 + 86 * 60).toString() } }));
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

  // const { user, isLoaded } = useUser();

  // const localIdentifier = generateLocalTokenIdentifier();
  // const convexUser = useQuery(
  //   api.users.getUser,
  //   user?.id
  //     ? { tokenIdentifier: `clerk:${user?.id}` }
  //     : { localIdentifier: localIdentifier }
  // );

  return (
    <SimpleContainer title="Testing Customization">
      {/* --- Simulation Controls (for dev/testing only) --- */}
      <TestSimulationControls
        handleSimulateNormal={handleSimulateNormal}
        simulateUnproductive={simulateUnproductive}
        simulateProductive={simulateProductive}
        handleLilGuyReset={handleLilGuyReset}
      />

      {/* Name customization */}
      {/* <TestNameEditor
        showNameInput={showNameInput}
        setShowNameInput={setShowNameInput}
        newName={newName}
        setNewName={setNewName}
        saveName={saveName}
        name={name}
      /> */}

      {/* Animations */}
      {/* <TestAnimations currentStage={currentStage} emitEmotion={emitEmotion} /> */}

      {/* LilGuy Color */}
      {/* <TestLilGuyColor currentColor={currentColor} changeLilGuyColor={changeLilGuyColor} /> */}

      {/* Evolution Stage */}
      {/* <TestEvolutionStage currentStage={currentStage} changeStage={changeStage} /> */}

    </SimpleContainer>
  );
}

export { triggerFirstGoalSequence };
