import { Button } from '@/components/ui/Button/Button';
import { classNameMerge } from '@/lib/utils';
import { Bell, Clock, X, Settings } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { WidgetHealth } from '../HealthBar/HealthBar';
import { WidgetLilGuy } from '../LilGuy/LilGuy';
import PixelWindow from '../ui/PixelWindow';

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
}

const ExtensionWidget: React.FC<WidgetProps> = ({ onClose, onExpand }) => {
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
          <button className="pixel-button green flex-1 text-xs py-1 whitespace-nowrap">
            Pet
          </button>
          <button className="pixel-button contrast flex-1 text-xs py-1 whitespace-nowrap">
            Focus
          </button>
        </div>
        <button
          className="pixel-button pixel-button-sm px-1 py-1 bg-pixel-teal"
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
          <WidgetLilGuy />
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
          <WidgetHealth />
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
    </PixelWindow>
  );
};

export default ExtensionWidget;
