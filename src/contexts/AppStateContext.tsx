"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { eventBus } from "../lib/eventBus";
import { convexApi } from "../lib/convexApi";

// Allow lilGuyColor to be string or undefined for proper typing
interface AppState {
  health: number;
  mood: string;
  goals: any[];
  today: { productive: number; unproductive: number };
  lilGuyStage: string;
  lilGuyColor?: string;
  productivity: number;
  trackedHours: number;
  lilGuyFirstGoalSet: boolean;
}

const defaultState: AppState = {
  health: 100,
  mood: "neutral",
  goals: [],
  today: { productive: 0, unproductive: 0 },
  lilGuyStage: "egg",
  lilGuyColor: undefined,
  productivity: 0,
  trackedHours: 0,
  lilGuyFirstGoalSet: false,
};

const AppStateContext = createContext<
  AppState & {
    setState: (partial: Partial<AppState>) => void;
    syncWithConvex: () => void;
  }
>({
  ...defaultState,
  setState: () => {},
  syncWithConvex: () => {},
});

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
};

export const AppStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setStateInternal] = useState<AppState>(defaultState);

  // Hydrate from Convex on mount
  useEffect(() => {
    (async () => {
      const convexState = await convexApi.getAppState();
      setStateInternal((prev) => ({ ...prev, ...convexState }));
    })();
  }, []);

  // Listen for eventBus events and update state/Convex/localStorage
  useEffect(() => {
    const handleHpChange = ({ health }: { health: number }) => {
      setStateInternal((prev) => ({ ...prev, health }));
      convexApi.updateHealth(health);
      localStorage.setItem("widgetState", JSON.stringify({ ...state, health }));
    };
    const handleMoodChange = ({ mood }: { mood: string }) => {
      setStateInternal((prev) => ({ ...prev, mood }));
      convexApi.updateMood(mood);
      localStorage.setItem("widgetState", JSON.stringify({ ...state, mood }));
    };
    const handleStageChange = ({ stage }: { stage: string }) => {
      setStateInternal((prev) => ({ ...prev, lilGuyStage: stage }));
      convexApi.updateStage(stage);
      localStorage.setItem("widgetState", JSON.stringify({ ...state, lilGuyStage: stage }));
    };
    const handleProductivityChange = ({ productivity }: { productivity: number }) => {
      setStateInternal((prev) => ({ ...prev, productivity }));
      localStorage.setItem("widgetState", JSON.stringify({ ...state, productivity }));
    };
    const handleTrackedHoursChange = ({ hours }: { hours: number }) => {
      setStateInternal((prev) => ({ ...prev, trackedHours: hours }));
      localStorage.setItem("widgetState", JSON.stringify({ ...state, trackedHours: hours }));
    };
    const handleLilGuyColorRandomize = () => {
      // Only randomize if not already set
      if (!state.lilGuyColor) {
        // Placeholder: random color logic
        const colors = ["green", "blue", "black"];
        const color = colors[Math.floor(Math.random() * colors.length)];
        setStateInternal((prev) => ({ ...prev, lilGuyColor: color }));
        localStorage.setItem("widgetState", JSON.stringify({ ...state, lilGuyColor: color }));
      }
    };
    const handleFirstGoalSet = () => {
      setStateInternal((prev) => ({ ...prev, lilGuyFirstGoalSet: true }));
      localStorage.setItem("widgetState", JSON.stringify({ ...state, lilGuyFirstGoalSet: true }));
    };
    eventBus.on("hpChange", handleHpChange);
    eventBus.on("moodChange", handleMoodChange);
    eventBus.on("stageChange", handleStageChange);
    eventBus.on("productivityChange", handleProductivityChange);
    eventBus.on("trackedHoursChange", handleTrackedHoursChange);
    eventBus.on("lilGuyColor:randomize", handleLilGuyColorRandomize);
    eventBus.on("firstGoalSet", handleFirstGoalSet);
    return () => {
      eventBus.off("hpChange", handleHpChange);
      eventBus.off("moodChange", handleMoodChange);
      eventBus.off("stageChange", handleStageChange);
      eventBus.off("productivityChange", handleProductivityChange);
      eventBus.off("trackedHoursChange", handleTrackedHoursChange);
      eventBus.off("lilGuyColor:randomize", handleLilGuyColorRandomize);
      eventBus.off("firstGoalSet", handleFirstGoalSet);
    };
  }, [state]);

  // Hydrate widget preview from localStorage if needed
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "widgetState" && e.newValue) {
        // Optionally update state or notify widget
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <AppStateContext.Provider
      value={{
        ...state,
        setState: (partial: Partial<AppState>) => setStateInternal((prev) => ({ ...prev, ...partial })),
        syncWithConvex: () => convexApi.sync(state),
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};
