
import React, { useState, useEffect } from 'react';
import { Bell, Clock, Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import { classNameMerge } from '@/lib/utils';
import { WidgetHealth, WidgetLilGuy } from '../LilGuy/LilGuy';

interface WidgetProps {
    onClose?: () => void;
    onExpand?: () => void;
}

const ExtensionWidget: React.FC<WidgetProps> = ({ onClose, onExpand }) => {
    // consider: update mood based on health/productivity?
    // const [mood, setMood] = useState<'happy' | 'sad' | 'neutral'>('happy');
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
      <div className="w-72 shadow-lg border-2 border-black">
        {/* Header */}
        <div className="bg-pixel-primary px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">{name}</span>
            <span className="bg-white text-pixel-primary rounded-full px-2 py-0.5 text-xs">
              LVL 2
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 hover:text-white hover:bg-pixel-dark"
              onClick={onExpand}
            >
              <Settings className="h-3 w-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 hover:text-white hover:bg-pixel-dark"
              onClick={onClose}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
        {/* Buttons */}
        <div className="bg-white p-2 flex justify-between border-t border-gray-200">
          <Button size="sm" variant="outline" className="text-xs h-7 px-2">
            Placeholder
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-7 px-2">
            Buttons
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-7 px-2">
            We may use?
          </Button>
        </div>

        {/* LilGuy section */}
        <div className="bg-white p-3 flex items-center gap-3 border-b border-dashed border-gray-300">
          <div
            className={classNameMerge(
              "w-12 h-12 flex items-center justify-center rounded-lg pixelated pixel-borders",
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
            <div className="bg-white p-2 border-1 border-black">
              <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-1">
                <Clock className="w-3 h-3" />
                <span>Productive</span>
              </div>
              <div className="text-sm font-bold text-pixel-accent">
                {productiveTime}
              </div>
            </div>
            <div className="bg-white p-2 border-1 border-black">
              <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-1">
                <Clock className="w-3 h-3" />
                <span>Unproductive</span>
              </div>
              <div className="text-sm font-bold text-pixel-danger">
                {unproductiveTime}
              </div>
            </div>
          </div>

          {/* Current site */}
          <div className="bg-white p-2 border-1 border-black mb-2">
            <div className="text-[10px] text-gray-500 mb-1">Currently on:</div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">github.com</span>
              <span className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                Productive
              </span>
            </div>
          </div>

          {/* Reminder */}
          <div className="bg-pixel-primary bg-opacity-10 p-2 border-1 border-black flex items-center gap-2">
            <Bell className="w-4 h-4 text-pixel-primary" />
            <div className="flex-1">
              <div className="text-[10px] text-gray-500">Upcoming Break</div>
              <div className="text-xs font-medium">In 25 minutes</div>
            </div>
          </div>
        </div>
      </div>
    );
};

export default ExtensionWidget;
