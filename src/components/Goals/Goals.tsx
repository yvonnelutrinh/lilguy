import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/UI/Button/Button";
import { Input } from "@/components/UI/Input/Input";
import { Slider } from "@/components/UI/Slider/Slider";
import { useEmitEmotion } from '@/lib/emotionContext';
import { SimpleContainer, SimpleItem } from '@/components/UI/SimpleContainer/SimpleContainer';
import { triggerFirstGoalSequence } from '@/lib/lilguyActions';
import type { Website } from '@/components/SiteList/SiteList';
import Tag from '@/components/UI/Tag';

// Helper function to safely access localStorage
const getLocalStorageItem = (key: string, defaultValue: unknown) => {
  if (typeof window !== 'undefined') {
    const item = localStorage.getItem(key);
    return item ? (typeof defaultValue === 'object' ? JSON.parse(item) : item) : defaultValue;
  }
  return defaultValue;
};

// Helper function to safely set localStorage item
const setLocalStorageItem = (key: string, value: unknown) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : value as string);
  }
};

// Helper: Get and set health from localStorage
const getHealth = () => {
  if (typeof window !== 'undefined') {
    const h = localStorage.getItem('health');
    return h ? parseInt(h, 10) : 100;
  }
  return 100;
};
const setHealth = (value: number) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('health', value.toString());
  }
};

// Mock data for goals
const initialGoals: Goal[] = [];

export interface Goal {
  id: number;
  title: string;
  completed: boolean;
  progress: number;
}

// Pixel art icon components
const CheckIcon = () => (
  <div className="w-5 h-5 flex items-center justify-center">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="pixelated">
      <rect x="4" y="4" width="12" height="12" fill="white" stroke="currentColor" strokeWidth="2"/>
      <rect x="6" y="8" width="2" height="2" fill="currentColor" />
      <rect x="8" y="10" width="2" height="2" fill="currentColor" />
      <rect x="10" y="8" width="2" height="2" fill="currentColor" />
      <rect x="12" y="6" width="2" height="2" fill="currentColor" />
    </svg>
  </div>
);

const EmptyCheckIcon = () => (
  <div className="w-5 h-5 flex items-center justify-center">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="pixelated">
      <rect x="4" y="4" width="12" height="12" fill="white" stroke="currentColor" strokeWidth="2"/>
    </svg>
  </div>
);

const EditIcon = () => (
  <div className="w-5 h-5 flex items-center justify-center">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="pixelated">
      <rect x="4" y="4" width="12" height="12" fill="currentColor" />
      <rect x="6" y="6" width="8" height="8" fill="white" />
      <rect x="8" y="8" width="2" height="2" fill="currentColor" />
      <rect x="10" y="6" width="2" height="2" fill="currentColor" />
      <rect x="12" y="8" width="2" height="2" fill="currentColor" />
      <rect x="10" y="10" width="2" height="2" fill="currentColor" />
      <rect x="8" y="12" width="2" height="2" fill="currentColor" />
      <rect x="6" y="10" width="2" height="2" fill="currentColor" />
    </svg>
  </div>
);

const TrashIcon = () => (
  <div className="w-5 h-5 flex items-center justify-center">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="pixelated">
      <rect x="6" y="4" width="8" height="2" fill="currentColor" />
      <rect x="4" y="6" width="2" height="10" fill="currentColor" />
      <rect x="6" y="14" width="8" height="2" fill="currentColor" />
      <rect x="14" y="6" width="2" height="10" fill="currentColor" />
      <rect x="6" y="8" width="2" height="2" fill="currentColor" />
      <rect x="10" y="8" width="2" height="2" fill="currentColor" />
    </svg>
  </div>
);

const PlusIcon = () => (
  <div className="w-5 h-5 flex items-center justify-center">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="pixelated">
      <rect x="8" y="5" width="4" height="2" fill="currentColor" />
      <rect x="8" y="13" width="4" height="2" fill="currentColor" />
      <rect x="5" y="8" width="2" height="4" fill="currentColor" />
      <rect x="13" y="8" width="2" height="4" fill="currentColor" />
    </svg>
  </div>
);

const SaveIcon = () => (
  <div className="w-5 h-5 flex items-center justify-center">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="pixelated">
      <rect x="4" y="4" width="12" height="12" fill="currentColor" />
      <rect x="6" y="6" width="8" height="8" fill="white" />
      <rect x="8" y="8" width="4" height="4" fill="currentColor" />
    </svg>
  </div>
);

const Goals: React.FC= () => {
  const emitEmotion = useEmitEmotion();

  // Helper: Emit emotion and update health
  const emitEmotionWithHealth = (type: string, intensity: number, source: string, delta: number) => {
    const prevHealth = getHealth();
    let newHealth = prevHealth + delta;
    newHealth = Math.max(0, Math.min(100, newHealth));
    setHealth(newHealth);
    emitEmotion(type as unknown, intensity, source, newHealth);
  };

  const [goals, setGoals] = useState<Goal[]>(() => {
    const savedGoals = getLocalStorageItem("goals", initialGoals);
    return savedGoals;
  });
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [websites, setWebsites] = useState<Website[]>([]);

  // Sync websites from localStorage
  useEffect(() => {
    const syncWebsites = () => {
      const stored = localStorage.getItem('websites');
      if (stored) {
        try {
          setWebsites(JSON.parse(stored));
        } catch {
          setWebsites([]);
        }
      } else {
        setWebsites([]);
      }
    };
    syncWebsites();
    window.addEventListener('storage', syncWebsites);
    window.addEventListener('localStorageChanged', syncWebsites);
    return () => {
      window.removeEventListener('storage', syncWebsites);
      window.removeEventListener('localStorageChanged', syncWebsites);
    };
  }, []);

  const updateLocalStorage = (updatedGoals: Goal[]) => {
    setLocalStorageItem("goals", updatedGoals);
  };

  const lastProgressRef = useRef<{ [id: number]: number }>({});

  const handleAddGoal = () => {
    if (newGoalTitle.trim() === "") return;

    const newGoal: Goal = {
      id: Math.max(0, ...goals.map((g) => g.id)) + 1,
      title: newGoalTitle.trim(),
      completed: false,
      progress: 0,
    };

    const updatedGoals = [...goals, newGoal];
    setGoals(updatedGoals);
    updateLocalStorage(updatedGoals);
    setNewGoalTitle("");
    // Emit a happy emotion and increase health when adding a new goal
    emitEmotionWithHealth("happy", 50, "newGoal", 5);
    // If this is the first goal, trigger the full first-goal sequence
    if (goals.length === 0) {
      triggerFirstGoalSequence({
        emitEmotion,
        setAndSyncMessage: (msg: string) => {
          setLocalStorageItem('lilGuyMessage', msg);
          window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'lilGuyMessage', value: msg } }));
        }
      });
    }
  };

  const handleRemoveGoal = (id: number) => {
    const updatedGoals = goals.filter((goal) => goal.id !== id);
    setGoals(updatedGoals);
    updateLocalStorage(updatedGoals);
    // Emit a sad emotion and decrease health when removing a goal
    emitEmotionWithHealth("sad", 30, "removeGoal", -10);
  };

  const handleToggleComplete = (id: number) => {
    const updatedGoals = goals.map((goal) =>
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    );
    // Find the toggled goal
    const toggledGoal = updatedGoals.find(g => g.id === id);
    // Emit appropriate emotion and health change based on completion state
    if (toggledGoal?.completed) {
      emitEmotionWithHealth("happy", 80, "completeGoal", 10);
    } else {
      emitEmotionWithHealth("sad", 30, "uncompleteGoal", -5);
    }
    setGoals(updatedGoals);
    updateLocalStorage(updatedGoals);
  };

  const handleProgressChange = (id: number, progress: number) => {
    // Get previous progress or default to 0
    const prev = lastProgressRef.current[id] ?? goals.find(g => g.id === id)?.progress ?? 0;
    const updatedGoals = goals.map((goal) =>
      goal.id === id ? { ...goal, progress } : goal
    );
    setGoals(updatedGoals);
    updateLocalStorage(updatedGoals);
    // Calculate delta
    const delta = progress - prev;
    let healthDelta = 0;
    if (delta > 0) {
      // Always increase health when progress increases
      healthDelta = delta >= 50 ? 10 : delta >= 10 ? 3 : 1;
      emitEmotionWithHealth("happy", delta >= 50 ? 100 : 50, "progressUp", healthDelta);
    } else if (delta < 0) {
      // Decrease health when progress decreases
      healthDelta = delta <= -50 ? -10 : delta <= -10 ? -3 : -1;
      emitEmotionWithHealth("sad", delta <= -50 ? 100 : 50, "progressDown", healthDelta);
    }
    // Save latest progress
    lastProgressRef.current[id] = progress;
  };

  const startEditing = (goal: Goal) => {
    setEditingId(goal.id);
    setEditTitle(goal.title);
  };

  const saveEdit = () => {
    if (editTitle.trim() === "") return;

    const updatedGoals = goals.map((goal) =>
      goal.id === editingId ? { ...goal, title: editTitle.trim() } : goal
    );
    setGoals(updatedGoals);
    updateLocalStorage(updatedGoals);
    setEditingId(null);
    setEditTitle("");
  };

  return (
    <SimpleContainer 
      title="Productivity Goals" 
      description="Set productivity goals and track your progress"
      instructionText="Drag the slider to update progress, or click the buttons"
      renderInstructionAfterInput={true}
    >
      <div className="flex gap-2 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Enter a new goal..."
            value={newGoalTitle}
            onChange={(e) => setNewGoalTitle(e.target.value)}
            className="w-full"
          />
        </div>
        <Button onClick={handleAddGoal} className="pixel-button">
          <PlusIcon />
          <span className="ml-1 text-pixel-sm">ADD</span>
        </Button>
      </div>

      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm bg-gray-100 p-4 border border-gray-200">
            No goals yet. Add your first goal above!
          </div>
        ) : (
          goals.map((goal) => {
            // Find all productive websites attributed to this goal
            const attributedWebsites = websites.filter(
              (w) => w.goalId === goal.id && w.category === 'productive'
            );
            return (
              <SimpleItem
                key={goal.id}
                backgroundColor={goal.completed ? "var(--pixel-green-light)" : "white"}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-1 mr-2">
                    <button
                      onClick={() => handleToggleComplete(goal.id)}
                      className="flex-shrink-0"
                    >
                      {goal.completed ? (
                        <CheckIcon />
                      ) : (
                        <EmptyCheckIcon />
                      )}
                    </button>

                    {editingId === goal.id ? (
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full"
                      />
                    ) : (
                      <span
                        className={`text-sm ${
                          goal.completed ? "line-through text-gray-500" : ""
                        }`}
                      >
                        {goal.title}
                      </span>
                    )}
                  </div>

                  <div className="flex-shrink-0 flex items-center gap-1">
                    {editingId === goal.id ? (
                      <Button
                        onClick={saveEdit}
                        size="sm"
                        className="pixel-button pixel-button-success flex-shrink-0 whitespace-nowrap"
                      >
                        <SaveIcon />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => startEditing(goal)}
                        size="sm"
                        className="pixel-button pixel-button-secondary flex-shrink-0 whitespace-nowrap"
                      >
                        <EditIcon />
                      </Button>
                    )}
                    <Button
                      onClick={() => handleRemoveGoal(goal.id)}
                      size="sm"
                      className="pixel-button pixel-button-danger flex-shrink-0 whitespace-nowrap"
                    >
                      <TrashIcon />
                    </Button>
                  </div>
                </div>

                {/* Attributed websites as tags or prompt */}
                {attributedWebsites.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {attributedWebsites.map(site => (
                      <Tag
                        key={site.id}
                        label={site.name}
                        asButton
                        onClick={() => {
                          const el = document.getElementById(`website-${site.id}`);
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            el.classList.add('ring-4', 'ring-pixel-accent');
                            setTimeout(() => el.classList.remove('ring-4', 'ring-pixel-accent'), 1200);
                          }
                          const webTabBtn = document.querySelector('[data-tab="websites"]') as HTMLElement;
                          if (webTabBtn) webTabBtn.click();
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-pixel-warning bg-yellow-50 border border-yellow-200 rounded px-2 py-1 flex items-center gap-2 justify-between">
                    <span>No websites attributed yet. <b>Add productive websites and assign them to this goal!</b></span>
                    <button
                      className="pixel-button text-xs px-2 py-1 bg-pixel-accent border-black border-2 ml-2"
                      onClick={() => {
                        const webTabBtn = document.querySelector('[data-tab="websites"]') as HTMLElement;
                        if (webTabBtn) webTabBtn.click();
                      }}
                      type="button"
                    >
                      Go to Site List
                    </button>
                  </div>
                )}

                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-sm">Progress: {goal.progress}%</span>
                  </div>
                  <div className="h-4 w-full bg-gray-200 border-2 border-black overflow-hidden">
                    <div
                      className="h-full"
                      style={{
                        width: `${goal.progress}%`,
                        backgroundColor: 
                          goal.progress > 75 ? 'var(--pixel-green)' : 
                          goal.progress > 25 ? 'var(--pixel-blue)' : 
                          'var(--pixel-pink)'
                      }}
                    />
                  </div>
                  <Slider
                    value={[goal.progress]}
                    min={0}
                    max={100}
                    step={5}
                    className="mt-2"
                    onValueChange={(values) =>
                      handleProgressChange(goal.id, values[0])
                    }
                    disabled={goal.completed}
                  />
                </div>
              </SimpleItem>
            );
          })
        )}
      </div>
    </SimpleContainer>
  );
};

export default Goals;
