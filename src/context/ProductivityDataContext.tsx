import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

// Dummy data for simulation
const defaultData = {
  weekData: [
    { day: 'Mon', productive: 2, unproductive: 1 },
    { day: 'Tue', productive: 3, unproductive: 0.5 },
    { day: 'Wed', productive: 4, unproductive: 0 },
    { day: 'Thu', productive: 1, unproductive: 2 },
    { day: 'Fri', productive: 3, unproductive: 1 },
    { day: 'Sat', productive: 0, unproductive: 0 },
    { day: 'Sun', productive: 0, unproductive: 0 },
  ],
  today: { productive: 2, unproductive: 1 },
  streak: 3,
  weeklyAverage: 65, // percent
  health: 75,
  mood: 'neutral', // 'happy' | 'sad' | 'neutral' | 'ecstatic'
  goals: [
    { id: 1, title: 'Finish project', completed: false, progress: 30 },
    { id: 2, title: 'Read docs', completed: true, progress: 100 },
  ],
  websites: [
    { id: 1, name: 'github.com', category: 'productive', timeSpent: 125 },
    { id: 2, name: 'netflix.com', category: 'unproductive', timeSpent: 45 },
    { id: 3, name: 'localhost', category: 'productive', timeSpent: 0 },
  ],
};

export type ProductivityData = typeof defaultData;
export type Mood = 'happy' | 'sad' | 'neutral' | 'ecstatic';
export type Goal = { id: number; title: string; completed: boolean; progress: number };
export type Website = { id: number; name: string; category: 'productive' | 'unproductive' | 'neutral'; timeSpent: number; goalId?: number };

interface ProductivityContextType {
  data: ProductivityData;
  setData: (data: ProductivityData) => void;
  updateToday: (productive: number, unproductive: number) => void;
  updateHealth: (health: number) => void;
  updateMood: (mood: Mood) => void;
  setGoals: (goals: Goal[]) => void;
  setWebsites: (websites: Website[]) => void;
}

const ProductivityDataContext = createContext<ProductivityContextType | undefined>(undefined);

export const ProductivityDataProvider = ({ children }: { children: ReactNode }) => {
  const [data, setDataState] = useState<ProductivityData>(defaultData);

  // On mount: load from localStorage if present, but do NOT overwrite localStorage with defaults if already present
  useEffect(() => {
    const stored = localStorage.getItem("productivityData");
    if (stored) setDataState(JSON.parse(stored));
  }, []);

  // Listen for storage events (cross-tab sync)
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "productivityData" && e.newValue) {
        setDataState(JSON.parse(e.newValue));
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // Write to localStorage only if data changed and is not the default (prevents overwriting on reload)
  useEffect(() => {
    // Only write if data is not defaultData or if localStorage is empty
    const stored = localStorage.getItem("productivityData");
    const isDefault = JSON.stringify(data) === JSON.stringify(defaultData);
    if (!isDefault || !stored) {
      localStorage.setItem("productivityData", JSON.stringify(data));
    }
  }, [data]);

  const updateToday = (productive: number, unproductive: number) => {
    setDataState((prev) => ({ ...prev, today: { productive, unproductive } }));
  };
  const updateHealth = (health: number) => {
    setDataState((prev) => ({ ...prev, health }));
  };
  const updateMood = (mood: Mood) => {
    setDataState((prev) => ({ ...prev, mood }));
  };
  const setGoals = (goals: Goal[]) => {
    setDataState((prev) => ({ ...prev, goals }));
  };
  const setWebsites = (websites: Website[]) => {
    setDataState((prev) => ({ ...prev, websites }));
  };

  return (
    <ProductivityDataContext.Provider value={{ data, setData: setDataState, updateToday, updateHealth, updateMood, setGoals, setWebsites }}>
      {children}
    </ProductivityDataContext.Provider>
  );
};

export const useProductivityData = () => {
  const ctx = useContext(ProductivityDataContext);
  if (!ctx) throw new Error("Must use within ProductivityDataProvider");
  return ctx;
};
