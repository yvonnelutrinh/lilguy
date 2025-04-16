"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header/Header";
import ProductivityMetrics from "@/components/ProductivityMetrics/ProductivityMetrics";
import Goals from "@/components/Goals/Goals";
import SiteList from "@/components/SiteList/SiteList";
import ExtensionWidget from "@/components/ExtensionWidget/ExtensionWidget";
import { LilGuy } from "@/components/LilGuy/LilGuy";
import LilGuyInteractor from "@/components/LilGuyInteractor/LilGuyInteractor";
import TestWindow from "@/components/TestWindow/TestWindow";
import type { LilGuyColor } from "@/components/LilGuy/LilGuy";
import PixelWindow from "@/components/ui/PixelWindow";
import { HealthProvider } from "@/context/HealthContext";

export default function Home() {
  // State for current tab selection
  const [activeTab, setActiveTab] = useState<'dashboard' | 'websites' | 'goals' | 'widget'>('dashboard');
  // State for character color (from localStorage if available)
  const [characterColor, setCharacterColor] = useState<LilGuyColor>('black');

  // Initialize character color from localStorage on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedColor = localStorage.getItem('lilGuyColor');
      if (storedColor) {
        setCharacterColor(storedColor as LilGuyColor);
      }
    }
  }, []);

  // Change LilGuy color handler
  const changeLilGuyColor = (color: LilGuyColor) => {
    setCharacterColor(color);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lilGuyColor', color);
    }
  };

  return (
    <HealthProvider>
      <div className="min-h-screen flex flex-col bg-pixel-pattern">
        <Header />

        <main className="flex-1 container max-w-[100%] px-4 py-6">
          <div className="flex flex-col md:flex-row gap-6">
            
            {/* Left sidebar with LilGuy */}
            <div className="md:w-[40%] lg:sticky top-6 h-[min-content]">
              <PixelWindow
                title="LILGUY"
                className="mb-4"
              >
                <LilGuy />
              </PixelWindow>
              
              {/* LilGuy States Toggling - TEMP FOR TESTING ONLY */}
              <PixelWindow
                title="TEMP WINDOW"
                className="mb-4"
                contentClassName="p-2"
              >
                <TestWindow />
              </PixelWindow>
            </div>

            {/* Dashboard content */}
            <div className="flex-1">
              <PixelWindow
                title="DASHBOARD"
                className="mb-4"
                contentClassName="p-0"
              >
                <div className="pixel-tabs-list">
                  <button 
                    data-tab="dashboard"
                    className={`pixel-tab ${activeTab === 'dashboard' ? 'active' : ''}`} 
                    data-state={activeTab === 'dashboard' ? 'active' : ''}
                    onClick={() => setActiveTab('dashboard')}
                  >
                    Dashboard
                  </button>
                  <button 
                    data-tab="websites"
                    className={`pixel-tab ${activeTab === 'websites' ? 'active' : ''}`} 
                    data-state={activeTab === 'websites' ? 'active' : ''}
                    onClick={() => setActiveTab('websites')}
                  >
                    Websites
                  </button>
                  <button 
                    className={`pixel-tab ${activeTab === 'goals' ? 'active' : ''}`} 
                    data-state={activeTab === 'goals' ? 'active' : ''}
                    onClick={() => setActiveTab('goals')}
                  >
                    Goals
                  </button>
                  <button 
                    className={`pixel-tab ${activeTab === 'widget' ? 'active' : ''}`} 
                    data-state={activeTab === 'widget' ? 'active' : ''}
                    onClick={() => setActiveTab('widget')}
                  >
                    Widget
                  </button>
                </div>
                
                <div className="p-4">
                  {activeTab === 'dashboard' && <ProductivityMetrics />}
                  {activeTab === 'websites' && <SiteList />}
                  {activeTab === 'goals' && <Goals />}
                  {activeTab === 'widget' && (
                    <div className="flex justify-center py-6">
                      <ExtensionWidget activeTab={activeTab} />
                    </div>
                  )}
                </div>
              </PixelWindow>
            </div>
          </div>
        </main>
      </div>
    </HealthProvider>
  );
}
