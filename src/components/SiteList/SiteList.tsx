import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/UI/Button/Button";
import { Input } from "@/components/UI/Input/Input";
import { Label } from "@/components/UI/Label/Label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/UI/Select/Select";
import { Trash } from "lucide-react";
import { SimpleContainer, SimpleItem } from '@/components/UI/SimpleContainer/SimpleContainer';
import { useHealth } from "@/context/HealthContext";

// PlusIcon component from Goals.tsx
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

interface Website {
  id: number;
  name: string;
  category: 'productive' | 'unproductive' | 'neutral';
  timeSpent: number;
}

// placeholder sites
const initialWebsites: Website[] = [
  { id: 1, name: 'github.com', category: 'productive', timeSpent: 125 },
  { id: 2, name: 'stackoverflow.com', category: 'productive', timeSpent: 94 },
  { id: 3, name: 'docs.google.com', category: 'productive', timeSpent: 67 },
  { id: 4, name: 'youtube.com', category: 'unproductive', timeSpent: 103 },
  { id: 5, name: 'netflix.com', category: 'unproductive', timeSpent: 45 },
  { id: 6, name: 'twitter.com', category: 'unproductive', timeSpent: 86 },
  { id: 7, name: 'localhost', category: 'productive', timeSpent: 0 },
];

const SiteList: React.FC = () => {
  const [websites, setWebsites] = useState<Website[]>(initialWebsites);
  const [newWebsite, setNewWebsite] = useState('');
  const [category, setCategory] = useState<'productive' | 'unproductive' | 'neutral'>('neutral');
  const [filter, setFilter] = useState<'all' | 'productive' | 'unproductive' | 'neutral'>('all');
  const [localhostSeconds, setLocalhostSeconds] = useState(() => parseInt(localStorage.getItem('localhost_seconds') || '0', 10));
  const { health, setHealth } = useHealth();

  // Add localhost to websites if not present
  useEffect(() => {
    setWebsites(ws => {
      const filtered = ws.filter((site, idx, arr) =>
        site.name !== 'localhost' || arr.findIndex(s => s.name === 'localhost') === idx
      );
      if (!filtered.some(site => site.name === 'localhost')) {
        return [
          ...filtered,
          { id: Math.max(0, ...filtered.map(w => w.id)) + 1, name: 'localhost', category: 'productive', timeSpent: 0 }
        ];
      }
      return filtered;
    });
  }, []); // Only run on mount

  // Timer for localhost
  useEffect(() => {
    if (window.location.hostname !== 'localhost') return;
    let seconds = localhostSeconds;
    let timer = setInterval(() => {
      seconds += 1;
      setLocalhostSeconds(seconds);
      localStorage.setItem('localhost_seconds', seconds.toString());
      setWebsites(ws => ws.map(site => site.name === 'localhost' ? { ...site, timeSpent: Math.floor(seconds / 60) } : site));
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

  const handleAddWebsite = () => {
    if (newWebsite.trim() === '') return;
    
    const websiteExists = websites.some(site => site.name === newWebsite.trim());
    if (websiteExists) return;
    
    const newSite: Website = {
      id: Math.max(0, ...websites.map(w => w.id)) + 1,
      name: newWebsite.trim(),
      category,
      timeSpent: 0
    };
    
    setWebsites([...websites, newSite]);
    setNewWebsite('');
  };
  
  const handleRemoveWebsite = (id: number) => {
    setWebsites(websites.filter(site => site.id !== id));
  };
  
  const handleCategoryChange = (id: number, newCategory: 'productive' | 'unproductive' | 'neutral') => {
    setWebsites(websites.map(site => 
      site.id === id ? { ...site, category: newCategory } : site
    ));
  };
  
  // Memoize filtered and sorted websites
  const filteredWebsites = useMemo(() => {
    if (filter === 'all') {
      return [...websites].sort((a, b) => {
        const catOrder = { productive: 0, neutral: 1, unproductive: 2 };
        return catOrder[a.category] - catOrder[b.category];
      });
    }
    return websites.filter(site => site.category === filter);
  }, [websites, filter]);
  
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <SimpleContainer 
      title="Website Tracker" 
      description="Categorize websites and track time spent on them"
      instructionText="Click on a category to change it or remove a website"
      renderInstructionAfterInput={true}
    >
      <div className="flex gap-2 mb-3">
        <div className="flex-1">
          <Input
            placeholder="Enter website URL (e.g., example.com)"
            value={newWebsite}
            onChange={(e) => setNewWebsite(e.target.value)}
            className="w-full"
          />
        </div>
        <Select 
          value={category} 
          onValueChange={(value) => setCategory(value as 'productive' | 'unproductive' | 'neutral')}
        >
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectGroup>
              <SelectLabel>Category</SelectLabel>
              <SelectItem value="productive">Productive</SelectItem>
              <SelectItem value="unproductive">Unproductive</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button onClick={handleAddWebsite} className="pixel-button">
          <PlusIcon />
          <span className="ml-1 text-pixel-sm">ADD</span>
        </Button>
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
        {filteredWebsites.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No websites in this category
          </div>
        ) : (
          filteredWebsites.map((website) => (
            <SimpleItem
              key={website.id}
              backgroundColor={
                website.category === 'productive' ? 'rgba(16, 185, 129, 0.1)' : 
                website.category === 'unproductive' ? 'rgba(239, 68, 68, 0.1)' : 
                'rgba(245, 158, 11, 0.1)'
              }
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium">{website.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Time spent: {formatTime(website.timeSpent)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select 
                    value={website.category} 
                    onValueChange={(value) => handleCategoryChange(
                      website.id, 
                      value as 'productive' | 'unproductive' | 'neutral'
                    )}
                  >
                    <SelectTrigger className="w-[140px] h-8 text-xs bg-white">
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
                    onClick={() => handleRemoveWebsite(website.id)}
                  >
                    <Trash className="h-4 w-4" />
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