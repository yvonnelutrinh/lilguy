import React, { createContext, useContext, useState, useEffect } from 'react';

interface HealthContextType {
  health: number;
  setHealth: React.Dispatch<React.SetStateAction<number>>;
}

const HealthContext = createContext<HealthContextType>({
  health: 100,
  setHealth: () => {},
});

export const useHealth = () => useContext(HealthContext);

export const HealthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always start with 100 for SSR
  const [health, setHealth] = useState(100);
  const [hydrated, setHydrated] = useState(false);

  // On mount, sync with localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('health');
      if (stored !== null) setHealth(Number(stored));
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('health', String(health));
    }
  }, [health]);

  // Optionally, render nothing until hydrated to avoid mismatch
  if (!hydrated) return null;

  return (
    <HealthContext.Provider value={{ health, setHealth }}>
      {children}
    </HealthContext.Provider>
  );
};
