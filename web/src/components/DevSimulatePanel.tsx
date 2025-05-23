"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
 
import React, { useRef } from "react";
import simulationData from "../data/simulationData.json";
import { useProductivityData } from "../context/ProductivityDataContext";

/**
 * Dev-only panel for simulating LilGuy states and restoring user data.
 * Only rendered in development environment.
 */
const DevSimulatePanel: React.FC = () => {
  const { data, setData } = useProductivityData();
  // Backup ref persists across renders but does not trigger rerender
  const backupRef = useRef<any | null>(null);
  const lilGuyBackupRef = useRef<any | null>(null);

  // Helper: set LilGuy-related localStorage keys
  function setLilGuyLocalStorage(sim: any) {
    // Always set a valid color for egg stage, never random/null
    let color = sim.lilGuyColor;
    if (sim.lilGuyStage === "egg" || color === "random" || !color) {
      const colors = ["green", "blue", "black"];
      color = colors[Math.floor(Math.random() * colors.length)];
    }
    localStorage.setItem("lilGuyColor", color);

    // Set stage after color
    const prevStage = localStorage.getItem("lilGuyStage");
    if (prevStage === sim.lilGuyStage) {
      localStorage.setItem("lilGuyStage", "");
    }
    localStorage.setItem("lilGuyStage", sim.lilGuyStage);

    // Set animation after stage
    const prevAnim = localStorage.getItem("lilGuyAnimation");
    if (prevAnim === sim.lilGuyAnimation) {
      localStorage.setItem("lilGuyAnimation", "");
    }
    localStorage.setItem("lilGuyAnimation", sim.lilGuyAnimation);

    // Set animation speed if present
    if (sim.lilGuyAnimationSpeed !== undefined) {
      localStorage.setItem("lilGuyAnimationSpeed", String(sim.lilGuyAnimationSpeed));
    }

    if (sim.lilGuyFirstGoalSet !== undefined) localStorage.setItem("lilGuyFirstGoalSet", String(sim.lilGuyFirstGoalSet));
    if (sim.lilGuyTrackedHours !== undefined) localStorage.setItem("lilGuyTrackedHours", String(sim.lilGuyTrackedHours));
    if (sim.lilGuyMessage) localStorage.setItem("lilGuyMessage", sim.lilGuyMessage);
    if (sim.lilGuyProductivity !== undefined) localStorage.setItem("lilGuyProductivity", String(sim.lilGuyProductivity));
    if (sim.health !== undefined) localStorage.setItem("lilGuyHealth", String(sim.health));
    if (sim.showHealth !== undefined) localStorage.setItem("lilGuyShowHealth", String(sim.showHealth));
    // Add more keys as needed

    // Trigger custom and storage events for all keys
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'lilGuyStage', value: sim.lilGuyStage } }));
    window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'lilGuyAnimation', value: sim.lilGuyAnimation } }));
    window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'lilGuyColor', value: color } }));
  }

  // Helper: backup user data if not already backed up
  const backupIfNeeded = () => {
    if (!backupRef.current) {
      backupRef.current = data;
    }
    if (!lilGuyBackupRef.current) {
      // Backup all relevant LilGuy keys
      lilGuyBackupRef.current = {
        lilGuyStage: localStorage.getItem("lilGuyStage"),
        lilGuyAnimation: localStorage.getItem("lilGuyAnimation"),
        lilGuyColor: localStorage.getItem("lilGuyColor"),
        lilGuyFirstGoalSet: localStorage.getItem("lilGuyFirstGoalSet"),
        lilGuyTrackedHours: localStorage.getItem("lilGuyTrackedHours"),
        lilGuyMessage: localStorage.getItem("lilGuyMessage"),
        lilGuyProductivity: localStorage.getItem("lilGuyProductivity"),
        lilGuyHealth: localStorage.getItem("lilGuyHealth"),
        lilGuyShowHealth: localStorage.getItem("lilGuyShowHealth"),
      };
    }
  };

  const handleSimulate = (key: keyof typeof simulationData) => {
    backupIfNeeded();
    const sim = simulationData[key];
    setLilGuyLocalStorage(sim);
    if (sim.productivityData) {
      setData(sim.productivityData);
    } else {
      setData(sim as any);
    }
  };

  const handleRestore = () => {
    if (backupRef.current) {
      setData(backupRef.current);
      backupRef.current = null;
    } else {
      const stored = localStorage.getItem("productivityData");
      if (stored) {
        setData(JSON.parse(stored));
      }
    }
    // if (lilGuyBackupRef.current) {
    //   Object.entries(lilGuyBackupRef.current).forEach(([k, v]) => {
    //     if (v !== null) localStorage.setItem(k, v);
    //     else localStorage.removeItem(k);
    //   });
    //   window.dispatchEvent(new Event('storage'));
    //   lilGuyBackupRef.current = null;
    // }
  };

  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div style={{
      position: "fixed", bottom: 16, right: 16, zIndex: 9999,
      background: "#222", color: "#fff", padding: 12, borderRadius: 8, fontFamily: 'monospace',
      boxShadow: "0 2px 8px #0008"
    }}>
      <div style={{ marginBottom: 8, fontWeight: 'bold', display: 'flex', gap: 8 }}>Dev Simulation Panel</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={{ border: '1px solid #7fffd4', background: 'none', color: '#7fffd4', borderRadius: 4, padding: '4px 10px', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', outline: 'none', boxShadow: 'none', transition: 'background 0.1s' }} onClick={() => handleSimulate("Reset")}>Reset</button>
        <button style={{ border: '1px solid #7fffd4', background: 'none', color: '#7fffd4', borderRadius: 4, padding: '4px 10px', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', outline: 'none', boxShadow: 'none', transition: 'background 0.1s' }} onClick={() => handleSimulate("Normal")}>Normal</button>
        <button style={{ border: '1px solid #7fffd4', background: 'none', color: '#7fffd4', borderRadius: 4, padding: '4px 10px', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', outline: 'none', boxShadow: 'none', transition: 'background 0.1s' }} onClick={() => handleSimulate("Unproductive")}>Unproductive</button>
        <button style={{ border: '1px solid #7fffd4', background: 'none', color: '#7fffd4', borderRadius: 4, padding: '4px 10px', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', outline: 'none', boxShadow: 'none', transition: 'background 0.1s' }} onClick={() => handleSimulate("Productive")}>Productive</button>
        <button style={{ border: '1px solid #fff', background: 'none', color: '#fff', borderRadius: 4, padding: '4px 10px', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', outline: 'none', boxShadow: 'none', transition: 'background 0.1s' }} onClick={handleRestore}>Restore</button>
      </div>
    </div>
  );
};

export default DevSimulatePanel;
