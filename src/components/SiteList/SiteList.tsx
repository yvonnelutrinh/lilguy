import { Input } from "@/components/UI/Input/Input";
import { Label } from "@/components/UI/Label/Label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/UI/Select/Select";
import { SimpleContainer, SimpleItem } from '@/components/UI/SimpleContainer/SimpleContainer';
import { useHealth } from "@/context/HealthContext";
import { useMutation, useQuery } from "convex/react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import React, { useEffect, useMemo, useState } from 'react';
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "../ui/Button/Button";

// PlusIcon component from Goals.tsx
const PlusIcon = (props: any) => <Plus color="currentColor" {...props} />;

interface Sitevisit {
  _id: Id<"sitevisits">;
  _creationTime: number;
  classification: string;
  hostname: string;
  sessions: number;
  totalDuration: number;
  userId: string;
  visits: number;
  goalId?: string;
  updatedAt?: number;
}
// placeholder sites for simulation
const initialWebsites: Sitevisit[] = [
  {
    _id: "j97d6vkyrtb7rrv5pspp9cy8tx7e0hkg" as Id<"sitevisits">,
    classification: "productive",
    hostname: "stackoverflow.com",
    sessions: 1,
    totalDuration: 60,
    userId: "clerk:user_2vhLHFwbblBU9J4M5qWkEKQKcFK", //fake user id
    visits: 1,
    _creationTime: 1744592598694.1118,
    goalId: undefined,
    updatedAt: 1744592598694.1118,
  },
  {
    _id: "j97d6vkyrtb7rrv5pspp9cy8tx7e0hkh" as Id<"sitevisits">,
    classification: "productive",
    hostname: "github.com",
    sessions: 1,
    totalDuration: 120,
    userId: "clerk:user_2vhLHFwbblBU9J4M5qWkEKQKcFK", //fake use
    visits: 1,
    _creationTime: 1744592598694.1118,
    goalId: undefined,
    updatedAt: 1744592598694.1118,
  },
  {
    _id: "j97d6vkyrtb7rrv5pspp9cy8tx7e0hki" as Id<"sitevisits">,
    classification: "productive",
    hostname: "docs.google.com",
    sessions: 1,
    totalDuration: 300,
    userId: "clerk:user_2vhLHFwbblBU9J4M5qWkEKQKcFK", //fake use
    visits: 1,
    _creationTime: 1744592598694.1118,
    goalId: undefined,
    updatedAt: 1744592598694.1118,
  },
  {
    _id: "j97d6vkyrtb7rrv5pspp9cy8tx7e0hkj" as Id<"sitevisits">,
    classification: "unproductive",
    hostname: "youtube.com",
    sessions: 1,
    totalDuration: 500,
    userId: "clerk:user_2vhLHFwbblBU9J4M5qWkEKQKcFK", //fake use
    visits: 1,
    _creationTime: 1744592598694.1118,
    goalId: undefined,
    updatedAt: 1744592598694.1118,
  },
];

interface Website {
  id: number;
  name: string;
  category: 'productive' | 'unproductive' | 'neutral';
  timeSpent: number;
  goalId?: string;
}

// placeholder sites for simulation (not for initial load)
export const normalWebsites: Website[] = [
  { id: 1, name: 'github.com', category: 'productive', timeSpent: 125 },
  { id: 2, name: 'stackoverflow.com', category: 'productive', timeSpent: 94 },
  { id: 3, name: 'docs.google.com', category: 'productive', timeSpent: 67 },
  { id: 4, name: 'youtube.com', category: 'unproductive', timeSpent: 103 },
  { id: 5, name: 'netflix.com', category: 'unproductive', timeSpent: 45 },
  { id: 6, name: 'twitter.com', category: 'unproductive', timeSpent: 86 },
  { id: 7, name: 'localhost', category: 'productive', timeSpent: 0 },
];

export const productiveWebsites: Website[] = [
  { id: 1, name: 'github.com', category: 'productive', timeSpent: 200 },
  { id: 2, name: 'stackoverflow.com', category: 'productive', timeSpent: 180 },
  { id: 3, name: 'docs.google.com', category: 'productive', timeSpent: 120 },
  { id: 4, name: 'youtube.com', category: 'unproductive', timeSpent: 30 },
  { id: 5, name: 'netflix.com', category: 'unproductive', timeSpent: 10 },
  { id: 6, name: 'twitter.com', category: 'unproductive', timeSpent: 14 },
  { id: 7, name: 'localhost', category: 'productive', timeSpent: 0 },
];

export const unproductiveWebsites: Website[] = [
  { id: 1, name: 'github.com', category: 'productive', timeSpent: 10 },
  { id: 2, name: 'stackoverflow.com', category: 'productive', timeSpent: 5 },
  { id: 3, name: 'docs.google.com', category: 'productive', timeSpent: 3 },
  { id: 4, name: 'youtube.com', category: 'unproductive', timeSpent: 150 },
  { id: 5, name: 'netflix.com', category: 'unproductive', timeSpent: 120 },
  { id: 6, name: 'twitter.com', category: 'unproductive', timeSpent: 100 },
  { id: 7, name: 'localhost', category: 'productive', timeSpent: 0 },
];


export type { Website };

interface SiteListProps {
  userId?: Id<"users">;
}


const SiteList: React.FC<SiteListProps> = ({ userId }) => {
  const [websites, setWebsites] = useState<Sitevisit[]>(initialWebsites);
  const [newWebsite, setNewWebsite] = useState('');
  const [category, setCategory] = useState<'productive' | 'unproductive' | 'neutral'>('neutral');
  const [filter, setFilter] = useState<'all' | 'productive' | 'unproductive' | 'neutral'>('all');
  const [localhostSeconds, setLocalhostSeconds] = useState(() => parseInt(localStorage.getItem('localhost_seconds') || '0', 10));
  const [inputError, setInputError] = useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const selectRef = React.useRef<HTMLButtonElement>(null);
  const addBtnRef = React.useRef<HTMLButtonElement>(null);
  const { health, setHealth } = useHealth();

  // Regex for simple domain validation: must contain a dot and at least 2 chars after it
  const websiteRegex = /^.+\.[a-zA-Z]{2,}$/;

  const updateClassification = useMutation(api.sitevisits.updateClassification);
  const addSitevisit = useMutation(api.sitevisits.addSiteVisit);
  const removeSiteVisit = useMutation(api.sitevisits.removeSiteVisit);
  const getSiteVisits = useQuery(api.sitevisits.getSiteVisits, userId ? { userId: userId } : "skip");
  const updateGoalId = useMutation(api.sitevisits.updateGoalId);

  useEffect(() => {
    if (getSiteVisits !== undefined) {
      setWebsites(getSiteVisits);
    }
  }, [getSiteVisits]);

  // Add support for attributing websites to a goal
  const [goals, setGoals] = useState<{ id: number; title: string }[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        //TODO: get goals from convex backend
        const raw = localStorage.getItem('goals');
        if (raw) {
          return JSON.parse(raw).map((g: any) => ({ id: g.id, title: g.title }));
        }
      } catch { }
    }
    return [];
  });

  // Helper to get goals from localStorage
  function getGoalsFromStorage(): { id: number; title: string }[] {
    if (typeof window !== 'undefined') {
      try {
        //TODO: get goals from convex backend
        const raw = localStorage.getItem('goals');
        if (raw) {
          return JSON.parse(raw).map((g: any) => ({ id: g.id, title: g.title }));
        }
      } catch { }
    }
    return [];
  }

  // Keep goals in sync with localStorage
  useEffect(() => {
    const syncGoals = () => setGoals(getGoalsFromStorage());
    window.addEventListener('storage', syncGoals);
    window.addEventListener('localStorageChanged', syncGoals);
    return () => {
      window.removeEventListener('storage', syncGoals);
      window.removeEventListener('localStorageChanged', syncGoals);
    };
  }, []);

  // Attribution handler
  const handleGoalAttribution = async (websiteId: Id<"sitevisits">, goalId: string | null) => {
    try {
      await updateGoalId({
        sitevisitId: websiteId,
        goalId: goalId || undefined
      });
      // The websites state will be updated automatically when getSiteVisits refetches
    } catch (err) {
      console.error('Error updating goal attribution:', err);
    }
  };

  // --- Ensure all modifications to websites are persisted ---
  const persistWebsites = (updated: Website[]) => {
    // TODO sync in backend
    // setWebsites(updated);
    localStorage.setItem('websites', JSON.stringify(updated));
  };

  // Patch: When adding or removing websites, persist to localStorage
  const handleAddWebsite = async () => {
    if (newWebsite.trim() === '') return;
    if (!websiteRegex.test(newWebsite.trim())) {
      setInputError('Please enter a valid website (e.g., example.com)');
      return;
    }
    setInputError(null);
    const websiteExists = websites.some(site => site.hostname === newWebsite.trim());
    if (websiteExists) return;

    try {
      await addSitevisit({
        userId,
        hostname: newWebsite.trim(),
        classification: category
      });
      setNewWebsite('');
    } catch (err) {
      console.error("Error adding website:", err);
    }
    setNewWebsite('');
  };

  const handleRemoveWebsite = async (id: Id<"sitevisits">) => {
    try {
      await removeSiteVisit({ sitevisitId: id });
      // the websites state will be updated automatically when getSiteVisits refetches
    } catch (err) {
      console.error('Error deleting website:', err);
    }
  };

  const handleCategoryChange = async (id: Id<"sitevisits">, newClassification: 'productive' | 'unproductive' | 'neutral') => {
    try {
      await updateClassification({ sitevisitId: id, classification: newClassification });
      setWebsites(websites.map(site =>
        site._id === id ? { ...site, classification: newClassification } : site
      ));
    } catch (err) {
      console.error('Error updating classification:', err);
    }
  };

  // FOR DEV TESTING - Add localhost to websites if not present
  // useEffect(() => {
  //   setWebsites(ws => {
  //     const filtered = ws.filter((site, idx, arr) =>
  //       site.hostname !== 'localhost' || arr.findIndex(s => s.hostname === 'localhost') === idx
  //     );
  //     if (!filtered.some(site => site.hostname === 'localhost')) {
  //       return [
  //         ...filtered,
  //         { category: 'productive', hostname: 'localhost', timeSpent: 0, _id: 0, _creationTime: 0, classification: 'productive', sessions: 0, totalDuration: 0, userId: 'localhost', visits: 0 }
  //       ];
  //     }
  //     return filtered;
  //   });
  // }, []); // Only run on mount

  // Sync websites state with localStorage 'websites' key
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
        setWebsites(initialWebsites);
      }
    };
    // Listen for changes
    window.addEventListener('storage', syncWebsites);
    window.addEventListener('localStorageChanged', syncWebsites);
    // Initial load
    syncWebsites();
    return () => {
      window.removeEventListener('storage', syncWebsites);
      window.removeEventListener('localStorageChanged', syncWebsites);
    };
  }, []);

  // Timer for localhost
  useEffect(() => {
    if (window.location.hostname !== 'localhost') return;
    let seconds = localhostSeconds;
    const timer = setInterval(() => {
      seconds += 1;
      setLocalhostSeconds(seconds);
      localStorage.setItem('localhost_seconds', seconds.toString());
      setWebsites(ws => ws.map(site => site.hostname === 'localhost' ? { ...site, timeSpent: Math.floor(seconds / 60) } : site));
      if (seconds % 30 === 0) {
        // Increment health and log
        setHealth((h: number) => {
          const newHealth = Math.min(100, (typeof h === 'number' ? h : 100) + 1);
          console.log('[WebsiteTracker] +1 health for 30s on localhost. Action: productive. New health:', newHealth);
          return newHealth;
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [localhostSeconds, setHealth]);

  // --- Listen for LilGuy reset and clear websites ---
  useEffect(() => {
    const handler = (e: Event) => {
      // Clear websites if reset event or localStorageChanged with cleared websites
      if (
        (e instanceof CustomEvent && e.detail && e.detail.key === 'lilguyReset') ||
        (e instanceof Event && localStorage.getItem('websites') === null)
      ) {
        setWebsites([]);
      }
    };
    window.addEventListener('localStorageChanged', handler as EventListener);
    window.addEventListener('lilguyReset', handler as EventListener);
    return () => {
      window.removeEventListener('localStorageChanged', handler as EventListener);
      window.removeEventListener('lilguyReset', handler as EventListener);
    };
  }, []);

  // Memoize filtered and sorted websites
  const filteredWebsites = useMemo(() => {
    if (filter === 'all') {
      return [...websites].sort((a, b) => {
        const catOrder = { productive: 0, neutral: 1, unproductive: 2 };
        return catOrder[a.classification as keyof typeof catOrder] - catOrder[b.classification as keyof typeof catOrder];
      });
    }
    return websites.filter(site => site.classification === filter);
  }, [websites, filter]);

  // Keyboard functionality for input
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddWebsite();
      addBtnRef.current?.focus(); // Move focus to Add button after submit
    } else if (e.key === 'Tab') {
      if (!e.shiftKey) {
        setTimeout(() => {
          selectRef.current?.focus();
        }, 0);
      }
    }
  };

  const handleSelectKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      setTimeout(() => {
        addBtnRef.current?.focus();
      }, 0);
    }
  };

  // Focus Add button when dropdown is closed via selection
  const handleSelectValueChange = (value: string) => {
    setCategory(value as 'productive' | 'unproductive' | 'neutral');
    setTimeout(() => {
      addBtnRef.current?.focus();
    }, 0);
  };

  function formatTime(seconds: number) {
    const totalMinutes = Math.ceil(seconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const parts = [];
    // doesnt't show hours/minutes if 0
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours === 0) parts.push(`${minutes}m`);

    return parts.join(" ");
  }

  return (
    <SimpleContainer
      title="Website Tracker"
      description="Categorize websites and track time spent on them"
      instructionText="Click on a category to change it or remove a website"
      renderInstructionAfterInput={true}
    >
      <div className="flex flex-col md:flex-row gap-2 mb-3">
        <div className="w-full">
          <Input
            ref={inputRef}
            placeholder="Enter website URL (e.g., example.com)"
            value={newWebsite}
            onChange={(e) => { setNewWebsite(e.target.value); setInputError(null); }}
            onKeyDown={handleInputKeyDown}
            className="w-full site-input"
            aria-label="Website URL"
          />
          {inputError && (
            <div className="text-red-600 text-xs mt-1 px-1">{inputError}</div>
          )}
        </div>
        <div className="flex gap-2 mt-2 md:mt-0">
          <Select
            value={category}
            onValueChange={handleSelectValueChange}
          >
            <SelectTrigger
              ref={selectRef}
              tabIndex={0}
              onKeyDown={handleSelectKeyDown}
              aria-label="Website category"
              className="site-category-select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="productive">Productive</SelectItem>
                <SelectItem value="unproductive">Unproductive</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button
            ref={addBtnRef}
            onClick={handleAddWebsite}
            tabIndex={0}
            aria-label="Add website"
            className="pixel-button"
          >
            <Plus color="currentColor" />
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <Label>Filter:</Label>
        <div className="flex gap-2 mt-1">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={filter === 'productive' ? 'default' : 'outline'}
            onClick={() => setFilter('productive')}
            size="sm"
            className="bg-pixel-accent border-black"
          >
            Productive
          </Button>
          <Button
            variant={filter === 'unproductive' ? 'default' : 'outline'}
            onClick={() => setFilter('unproductive')}
            size="sm"
            className="bg-pixel-danger border-black"
          >
            Unproductive
          </Button>
          <Button
            variant={filter === 'neutral' ? 'default' : 'outline'}
            onClick={() => setFilter('neutral')}
            size="sm"
            className="bg-pixel-warning border-black"
          >
            Neutral
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {/* Show yellow box if no goals, but always show website list below */}
        {goals.length === 0 && (
          <div className="text-center py-4 text-pixel-warning bg-yellow-50 border border-yellow-200 rounded mb-2">
            You have no goals. <b>Add a goal above to attribute productive websites!</b>
            <br />
            <button
              className="pixel-button mt-2 text-xs px-3 py-1 bg-pixel-accent border-black border-2"
              onClick={() => {
                const goalTabBtn = document.querySelector('[data-state][onClick*="setActiveTab(\'dashboard\')"]') as HTMLElement;
                if (goalTabBtn) goalTabBtn.click();
                else window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Go to Goals
            </button>
          </div>
        )}
        {filteredWebsites.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No websites in this category
          </div>
        ) : (
          filteredWebsites.map((website) => (
            <SimpleItem
              key={website._id}
              id={`website-${website._id}`}
              backgroundColor={
                website.classification === 'productive' ? 'rgba(16, 185, 129, 0.1)' :
                  website.classification === 'unproductive' ? 'rgba(239, 68, 68, 0.1)' :
                    'rgba(245, 158, 11, 0.1)'
              }
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex-1">
                  <div className="font-medium">{website.hostname}</div>
                  <div className="text-xs text-muted-foreground">
                    Time spent: {formatTime(website.totalDuration)}
                  </div>
                  {/* Only allow goal attribution for productive sites */}
                  {website.classification === 'productive' && goals.length > 0 && (
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs font-bold mr-1">Goal:</span>
                      <Select
                        value={website.goalId ? String(website.goalId) : undefined}
                        onValueChange={value => handleGoalAttribution(website._id, value === 'none' ? null : String(value))}
                        disabled={goals.length === 0}
                      >
                        <SelectTrigger className="w-[140px] h-8 text-xs bg-white site-goal-select">
                          <SelectValue placeholder="Assign to goal" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="none">Unassigned</SelectItem>
                          {goals.map(goal => (
                            <SelectItem key={goal.id} value={String(goal.id)}>{goal.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                  <Select
                    value={website.classification}
                    onValueChange={(value) => handleCategoryChange(
                      website._id,
                      value as 'productive' | 'unproductive' | 'neutral'
                    )}
                  >
                    <SelectTrigger className="w-[140px] h-8 text-xs bg-white site-category-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="productive">Productive</SelectItem>
                      <SelectItem value="unproductive">Unproductive</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8 pixel-button pixel-button-danger"
                    onClick={() => handleRemoveWebsite(website._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </SimpleItem>
          ))
        )}
      </div>
    </SimpleContainer>
  );
};

export default SiteList;
