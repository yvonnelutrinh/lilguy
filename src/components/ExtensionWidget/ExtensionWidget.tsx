import { Button } from '@/components/ui/Button/Button';
import { classNameMerge } from '@/lib/utils';
import { Bell, Clock, X, Settings } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { HealthBar } from '../HealthBar/HealthBar';
import { WidgetLilGuy } from '../LilGuy/LilGuy';
import PixelWindow from '../UI/PixelWindow';

// Icons with pixel art style
const SettingsIcon = () => (
  <div className="w-4 h-4 flex items-center justify-center">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="pixelated">
      <rect x="7" y="2" width="2" height="2" fill="currentColor" />
      <rect x="7" y="12" width="2" height="2" fill="currentColor" />
      <rect x="2" y="7" width="2" height="2" fill="currentColor" />
      <rect x="12" y="7" width="2" height="2" fill="currentColor" />
      <rect x="5" y="5" width="2" height="2" fill="currentColor" />
      <rect x="9" y="9" width="2" height="2" fill="currentColor" />
      <rect x="5" y="9" width="2" height="2" fill="currentColor" />
      <rect x="9" y="5" width="2" height="2" fill="currentColor" />
    </svg>
  </div>
);

const CloseIcon = () => (
  <div className="w-4 h-4 flex items-center justify-center">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="pixelated">
      <rect x="4" y="4" width="2" height="2" fill="currentColor" />
      <rect x="6" y="6" width="2" height="2" fill="currentColor" />
      <rect x="8" y="8" width="2" height="2" fill="currentColor" />
      <rect x="6" y="10" width="2" height="2" fill="currentColor" />
      <rect x="4" y="12" width="2" height="2" fill="currentColor" />
      <rect x="10" y="6" width="2" height="2" fill="currentColor" />
      <rect x="12" y="4" width="2" height="2" fill="currentColor" />
      <rect x="10" y="10" width="2" height="2" fill="currentColor" />
      <rect x="12" y="12" width="2" height="2" fill="currentColor" />
    </svg>
  </div>
);

const ClockIcon = () => (
  <div className="w-4 h-4 flex items-center justify-center">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="pixelated">
      <rect x="6" y="3" width="4" height="2" fill="currentColor" />
      <rect x="3" y="6" width="2" height="4" fill="currentColor" />
      <rect x="11" y="6" width="2" height="4" fill="currentColor" />
      <rect x="6" y="11" width="4" height="2" fill="currentColor" />
      <rect x="8" y="6" width="2" height="4" fill="currentColor" />
    </svg>
  </div>
);

const BellIcon = () => (
  <div className="w-4 h-4 flex items-center justify-center">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="pixelated">
      <rect x="6" y="3" width="4" height="2" fill="currentColor" />
      <rect x="4" y="5" width="2" height="6" fill="currentColor" />
      <rect x="10" y="5" width="2" height="6" fill="currentColor" />
      <rect x="6" y="11" width="4" height="2" fill="currentColor" />
      <rect x="7" y="13" width="2" height="2" fill="currentColor" />
    </svg>
  </div>
);

interface WidgetProps {
  onClose?: () => void;
  onExpand?: () => void;
  activeTab: string;
}

const ExtensionWidget: React.FC<WidgetProps> = ({ onClose, onExpand, activeTab }) => {
  // TODO: update mood based on health/productivity?
  const [mood, setMood] = useState<
    "happy" | "sad" | "neutral" | "ecstatic"
  >("neutral");

  // placeholder for preview
  const productiveTime = '3h 25m';
  const unproductiveTime = '1h 05m';
  const totalTime = '4h 30m';
  const productivityPercent = 76; // (3h 25m / 4h 30m) * 100

  const name = localStorage.getItem("lilGuyName") || "LilGuy";

  // example of changing moods with health value
  useEffect(() => {
    const healthValue = parseInt(
      localStorage.getItem("modifiedHealth") || "0",
      10
    );
    if (healthValue > 81) {
      setMood("ecstatic");
    } else if (healthValue > 61) {
      setMood("happy");
    } else if (healthValue < 30) {
      setMood("sad");
    } else {
      setMood("neutral");
    }
  }, []);

  const [localhostSeconds, setLocalhostSeconds] = useState(0);
  useEffect(() => {
    // Only track if on localhost
    const isLocalhost = window.location.hostname === 'localhost';
    if (!isLocalhost) return;

    // Track seconds spent on site in localStorage
    let timer: NodeJS.Timeout;
    let seconds = parseInt(localStorage.getItem('productive_seconds') || '0', 10);
    setLocalhostSeconds(seconds);

    function saveSeconds(val: number) {
      localStorage.setItem('productive_seconds', val.toString());
      setLocalhostSeconds(val);
    }

    function incrementHealth() {
      const health = parseInt(localStorage.getItem('health') || '100', 10);
      const newHealth = Math.min(100, health + 1); // +1 for every 30s
      localStorage.setItem('health', newHealth.toString());
      window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'health', value: newHealth } }));
      console.log('[WebsiteTracker] +1 health for 30s on localhost. New health:', newHealth);
    }

    timer = setInterval(() => {
      seconds += 1;
      saveSeconds(seconds);
      if (seconds % 30 === 0) { // 30 seconds for demo
        incrementHealth();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // --- Widget LilGuy State ---
  const getWidgetState = () => ({
    health: parseInt(localStorage.getItem('health') || '100', 10),
    stage: localStorage.getItem('lilGuyStage') || 'normal',
    animation: localStorage.getItem('lilGuyAnimation') || 'idle',
  });
  const [widgetHealth, setWidgetHealth] = useState(() => getWidgetState().health);
  const [widgetStage, setWidgetStage] = useState(() => getWidgetState().stage);
  const [widgetAnimation, setWidgetAnimation] = useState(() => getWidgetState().animation);

  // On mount (widget open), always pull latest state
  useEffect(() => {
    const { health, stage, animation } = getWidgetState();
    setWidgetHealth(health);
    setWidgetStage(stage);
    setWidgetAnimation(animation);
  }, [activeTab]);

  // Listen for health/stage/animation changes from anywhere
  useEffect(() => {
    function updateFromStorage() {
      const { health, stage, animation } = getWidgetState();
      setWidgetHealth(health);
      setWidgetStage(stage);
      setWidgetAnimation(animation);
    }
    window.addEventListener('storage', updateFromStorage);
    window.addEventListener('localStorageChanged', updateFromStorage as any);
    return () => {
      window.removeEventListener('storage', updateFromStorage);
      window.removeEventListener('localStorageChanged', updateFromStorage as any);
    };
  }, []);

  // --- Pet/Walk/Chill Button Handlers ---
  const [isChilling, setIsChilling] = useState(false);
  const handlePet = () => {
    const health = parseInt(localStorage.getItem('health') || '100', 10);
    const newHealth = Math.min(100, health + 1);
    localStorage.setItem('health', newHealth.toString());
    setWidgetHealth(newHealth);
    setWidgetAnimation('happy');
    window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'health', value: newHealth } }));
    console.log('[Widget] Pet action: +1 health. New health:', newHealth);
  };
  const handleWalkOrChill = () => {
    if (!isChilling) {
      setIsChilling(true);
      setWidgetAnimation('walk');
    } else {
      setIsChilling(false);
      setWidgetAnimation('idle');
    }
  };

  const websiteTrackers = [
    {
      url: 'localhost',
      label: 'Localhost',
      type: 'productive',
      seconds: localhostSeconds,
    },
    // Example static items:
    { url: 'github.com', label: 'GitHub', type: 'productive', seconds: 0 },
    { url: 'netflix.com', label: 'Netflix', type: 'unproductive', seconds: 0 },
  ];

  // --- Productivity/Unproductivity Tracking for LilGuy Evolution ---
  // On mount and when productive/unproductive time changes, update localStorage for lilGuyProductivity and lilGuyTrackedHours
  useEffect(() => {
    // Parse productive/unproductive time in seconds
    const prodSeconds = parseTimeStringToSeconds(productiveTime);
    const unprodSeconds = parseTimeStringToSeconds(unproductiveTime);
    // Convert to hours
    const prodHours = prodSeconds / 3600;
    const unprodHours = unprodSeconds / 3600;
    // Set productivity as a percent (for evolution logic)
    const productivityPercent = prodHours >= 2 ? 90 : (unprodHours >= 2 ? 20 : 50);
    localStorage.setItem('lilGuyProductivity', productivityPercent.toString());
    localStorage.setItem('lilGuyTrackedHours', (prodHours + unprodHours).toString());
    window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'lilGuyProductivity', value: productivityPercent } }));
    window.dispatchEvent(new CustomEvent('localStorageChanged', { detail: { key: 'lilGuyTrackedHours', value: (prodHours + unprodHours) } }));
  }, [productiveTime, unproductiveTime]);

  // Helper to parse time string like '3h 25m' to seconds
  function parseTimeStringToSeconds(time: string): number {
    const hMatch = time.match(/(\d+)h/);
    const mMatch = time.match(/(\d+)m/);
    const hours = hMatch ? parseInt(hMatch[1]) : 0;
    const mins = mMatch ? parseInt(mMatch[1]) : 0;
    return hours * 3600 + mins * 60;
  }

  return (
    <PixelWindow
      title={`${name} - LVL 2`}
      className="w-72"
      showControls={true}
      onClose={onClose}
    >
      {/* Buttons */}
      <div className="bg-white p-2 flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <button className="pixel-button blue flex-1 text-xs py-1 whitespace-nowrap" onClick={handleWalkOrChill}>
            {isChilling ? 'Chill' : 'Walk'}
          </button>
          <button className="pixel-button green flex-1 text-xs py-1 whitespace-nowrap" onClick={handlePet}>
            Pet
          </button>
        </div>
        <button
          className="pixel-button contrast pixel-button-sm px-1 py-1 bg-pixel-teal"
          onClick={onExpand}
        >
          <SettingsIcon />
        </button>
      </div>

      {/* LilGuy section */}
      <div className="bg-white p-3 flex items-center gap-3 border-b border-dashed border-gray-300">
        <div
          className={classNameMerge(
            "w-12 h-12 flex items-center justify-center rounded-lg pixelated border-2 border-black",
            mood === "happy"
              ? "bg-pixel-primary animate-bounce-slight"
              : mood === "sad"
                ? "bg-pixel-danger"
                : "bg-pixel-warning"
          )}
        >
          <WidgetLilGuy 
            health={widgetHealth} 
            stage={widgetStage as any} 
            animation={widgetAnimation as any} 
          />
        </div>
        <div className="flex-1">
          <div className="text-xs font-bold">
            {name} is {mood}.
          </div>
          <div className="text-[10px] text-gray-500 mb-1">
            {mood === "happy"
              ? "You're doing great today!"
              : mood === "sad"
                ? "Let's do some productive work!"
                : mood === "ecstatic"
                  ? "You're on fire!"
                  : "Ready when you are!"}
          </div>
          <div className="mt-2">
            <HealthBar health={widgetHealth} showLabel={false} />
          </div>
        </div>
      </div>

      {/* Stats section */}
      <div className="bg-gray-50 p-3">
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="bg-white p-2 border-2 border-black">
            <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-1">
              <ClockIcon />
              <span>Productive</span>
            </div>
            <div className="text-sm font-bold text-pixel-accent">
              {productiveTime}
            </div>
          </div>
          <div className="bg-white p-2 border-2 border-black">
            <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-1">
              <ClockIcon />
              <span>Unproductive</span>
            </div>
            <div className="text-sm font-bold text-pixel-danger">
              {unproductiveTime}
            </div>
          </div>
        </div>

        {/* Current site */}
        <div className="bg-white p-2 border-2 border-black mb-2">
          <div className="text-[10px] text-gray-500 mb-1">Currently on:</div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">github.com</span>
            <span className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded border border-green-800">
              Productive
            </span>
          </div>
        </div>

        {/* Reminder */}
        <div className="bg-pixel-primary bg-opacity-10 p-2 border-2 border-black flex items-center gap-2">
          <BellIcon />
          <div className="flex-1">
            <div className="text-[10px] text-gray-500">Upcoming Break</div>
            <div className="text-xs font-medium">In 25 minutes</div>
          </div>
        </div>
      </div>

      {/* Website Tracker UI */}
      <div className="bg-white p-3 border-t border-dashed border-gray-300">
        <div className="text-xs font-bold mb-2">Website Tracker</div>
        <div className="flex flex-col gap-2">
          {websiteTrackers.map((site) => (
            <div key={site.url} className={`flex items-center gap-2 text-xs ${site.type === 'productive' ? 'text-green-700' : site.type === 'unproductive' ? 'text-red-700' : 'text-gray-700'}`}>
              <span className="font-mono w-24 truncate">{site.url}</span>
              <span className="flex-1">{site.label}</span>
              <span>{Math.floor(site.seconds / 60)}:{(site.seconds % 60).toString().padStart(2, '0')}</span>
            </div>
          ))}
        </div>
      </div>
    </PixelWindow>
  );
};

export default ExtensionWidget;
