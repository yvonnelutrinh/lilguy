import React, { useEffect, useState } from 'react';
import './widget.css';

// Pixel-style SVG icons (inline for portability)
const SettingsIcon = () => (
  <div className="w-4 h-4 flex items-center justify-center">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="pixelated">
      <rect x="7" y="2" width="2" height="2" fill="black" />
      <rect x="7" y="12" width="2" height="2" fill="black" />
      <rect x="2" y="7" width="2" height="2" fill="black" />
      <rect x="12" y="7" width="2" height="2" fill="black" />
      <rect x="5" y="5" width="2" height="2" fill="black" />
      <rect x="9" y="9" width="2" height="2" fill="black" />
      <rect x="5" y="9" width="2" height="2" fill="black" />
      <rect x="9" y="5" width="2" height="2" fill="black" />
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

// Pixel window container
function PixelWindow({ title, children, onClose }) {
  return (
    <div className="pixel-window">
      <div className="pixel-window-header bg-pixel-teal">
        <div className="text-pixel-sm">{title}</div>
        <div className="pixel-window-controls">
          <div className="pixel-window-button" onClick={onClose} style={{ cursor: onClose ? 'pointer' : undefined }} />
          <div className="pixel-window-button" />
          <div className="pixel-window-button" />
        </div>
      </div>
      <div className="pixel-window-content">{children}</div>
    </div>
  );
}

// Health bar (chunky pixel style)
function HealthBar({ health = 0, showLabel = false }) {
  const getBgColor = () => {
    if (health <= 30) return 'bg-pixel-danger';
    if (health <= 70) return 'bg-pixel-warning';
    return 'bg-pixel-green';
  };
  return (
    <div className="w-full flex flex-col justify-center items-center">
      <div className="relative w-full h-6 bg-white border-2 border-black rounded-none mb-1 overflow-hidden">
        <div className={`absolute top-0 left-0 h-full ${getBgColor()}`}
          style={{ width: `${health}%` }}
        />
      </div>
      {showLabel && (
        <div className="text-xs font-bold text-black">
          {Math.floor(health)} / 100
        </div>
      )}
    </div>
  );
}

// WidgetLilGuy: minimal pixel pet using a sprite image
function WidgetLilGuy({ health = 100, stage = 'normal', animation = 'idle' }) {
  // For demo: always use green normal sprite
  // In real extension: swap src based on stage/color/animation
  const spriteSrc = '/assets/sprites/sheets/green/lilguy_main_green.png';
  return (
    <div style={{ width: 48, height: 48, imageRendering: 'pixelated' }}>
      <img
        src={spriteSrc}
        alt="LilGuy"
        width={48}
        height={48}
        style={{ display: 'block', imageRendering: 'pixelated' }}
      />
    </div>
  );
}

// Main widget popup
const Widget = () => {
  const [mood, setMood] = useState('neutral');
  const [widgetHealth, setWidgetHealth] = useState(76);
  const [widgetStage] = useState('normal');
  const [widgetAnimation, setWidgetAnimation] = useState('idle');
  const name = 'LilGuy';
  const productiveTime = '3h 25m';
  const unproductiveTime = '1h 05m';
  const [isChilling, setIsChilling] = useState(false);

  // Mood logic (demo only)
  useEffect(() => {
    if (widgetHealth > 81) setMood('ecstatic');
    else if (widgetHealth > 61) setMood('happy');
    else if (widgetHealth < 30) setMood('sad');
    else setMood('neutral');
  }, [widgetHealth]);

  // Button handlers
  const handlePet = () => {
    setWidgetHealth((h) => Math.min(100, h + 1));
    setWidgetAnimation('happy');
  };
  const handleWalkOrChill = () => {
    setIsChilling((c) => !c);
    setWidgetAnimation(isChilling ? 'idle' : 'walk');
  };

  // Website tracker (demo)
  const websiteTrackers = [
    { url: 'localhost', label: 'Localhost', type: 'productive', seconds: 0 },
    { url: 'github.com', label: 'GitHub', type: 'productive', seconds: 0 },
    { url: 'netflix.com', label: 'Netflix', type: 'unproductive', seconds: 0 },
  ];

  return (
    <PixelWindow title={name} onClose={() => window.close && window.close()}>
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
        <button className="pixel-button pink pixel-button-sm px-1 py-1 border-2 border-black">
          <SettingsIcon />
        </button>
      </div>
      {/* LilGuy section */}
      <div className="bg-white p-3 flex items-center gap-3 border-b border-dashed border-gray-300">
        <div className={`w-12 h-12 flex items-center justify-center rounded-lg pixelated border-black ${
          mood === 'happy'
            ? 'bg-pixel-primary animate-bounce-slight'
            : mood === 'sad'
            ? 'bg-pixel-danger'
            : 'bg-pixel-warning'
        }`}>
          <WidgetLilGuy health={widgetHealth} stage={widgetStage} animation={widgetAnimation} />
        </div>
        <div className="flex-1">
          <div className="text-xs font-bold">{name} is {mood}.</div>
          <div className="text-[10px] text-gray-500 mb-1">
            {mood === 'happy'
              ? "You're doing great today!"
              : mood === 'sad'
              ? "Let's do some productive work!"
              : mood === 'ecstatic'
              ? "You're on fire!"
              : 'Ready when you are!'}
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
            <div className="text-sm font-bold text-pixel-accent">{productiveTime}</div>
          </div>
          <div className="bg-white p-2 border-2 border-black">
            <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-1">
              <ClockIcon />
              <span>Unproductive</span>
            </div>
            <div className="text-sm font-bold text-pixel-danger">{unproductiveTime}</div>
          </div>
        </div>
        {/* Current site (demo) */}
        <div className="bg-white p-2 border-2 border-black mb-2">
          <div className="text-[10px] text-gray-500 mb-1">Currently on:</div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">github.com</span>
            <span className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded border border-green-800">
              Productive
            </span>
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
      </div>
    </PixelWindow>
  );
};

export default Widget;
