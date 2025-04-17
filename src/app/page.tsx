"use client";

import ExtensionWidget from "@/components/ExtensionWidget/ExtensionWidget";
import Goals from "@/components/Goals/Goals";
import Header from "@/components/Header/Header";
import type { LilGuyColor } from "@/components/LilGuy/LilGuy";
import { LilGuy } from "@/components/LilGuy/LilGuy";
import ProductivityMetrics from "@/components/ProductivityMetrics/ProductivityMetrics";
import SiteList from "@/components/SiteList/SiteList";
import TestWindow from "@/components/TestWindow/TestWindow";
import PixelWindow from "@/components/ui/PixelWindow";
import { HealthProvider } from "@/context/HealthContext";
import { useUser } from "@clerk/nextjs";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";

export const generateLocalTokenIdentifier = () => {
  if (typeof window === 'undefined') return 'local:unknown';
  const userAgent = window.navigator.userAgent;
  // const acceptLanguage = window.navigator.language; // different for front/backend
  const identifierParts = [
    userAgent,
    // acceptLanguage,
  ].filter(Boolean);
  return `local:${identifierParts.join('-')}`;
};


export default function Home() {
  // State for current tab selection
  const [activeTab, setActiveTab] = useState<'dashboard' | 'websites' | 'goals' | 'widget'>('dashboard');
  // State for character color (from localStorage if available)
  const [characterColor, setCharacterColor] = useState<LilGuyColor>(() => {
    // Try to get color from localStorage first, fall back to default
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lilGuyColor') as LilGuyColor || "black" as LilGuyColor;
    }
    return "black" as LilGuyColor;
  });

  const { isAuthenticated, isLoading } = useConvexAuth();
  const { user, isLoaded } = useUser();

  const localIdentifier = generateLocalTokenIdentifier();
  const convexUser = useQuery(
    api.users.getUser,
    user?.id
      ? { tokenIdentifier: `clerk:${user?.id}` }
      : { localIdentifier: localIdentifier }
  );

  // Update customColor when convexUser data is loaded
  useEffect(() => {
    if (convexUser?.customColor) {
      setCharacterColor(convexUser.customColor as LilGuyColor);
    }
  }, [convexUser]);

  const createUser = useMutation(api.users.createUser);
  useEffect(() => {
    if (isLoaded && !convexUser) {
      if (user) {
        // Create authenticated user in Convex
        createUser({
          tokenIdentifier: `clerk:${user.id}`,
          name: user.fullName || "",
          email: user.primaryEmailAddress?.emailAddress || "",
          customColor: "black",
          localIdentifier: localIdentifier,
        }).catch(err => console.log("Error creating user:", err));
      } else {
        // Create local user in Convex
        createUser({
          tokenIdentifier: localIdentifier,
          name: "Local User",
          email: "",
          customColor: "black",
          localIdentifier: localIdentifier,
        }).catch(err => console.log("Error creating local user:", err));
      }
    }
  }, [isLoaded, user, convexUser, createUser, localIdentifier]);

  const updateCustomColor = useMutation(api.users.updateCustomColor);
  const handleColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCharacterColor(newColor as LilGuyColor);

    if (user) {
      updateCustomColor({
        tokenIdentifier: `clerk:${user.id}`,
        customColor: newColor,
      }).catch(err => console.error("Error updating color:", err));
    } else {
      // Save color preference to localStorage when no user is logged in
      localStorage.setItem('customColor', newColor);
    }
  }, [user, updateCustomColor]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      {/*
      // TODO remove this ugly poo
      <div className="text-center py-16 bg-gray-50 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Welcome to Lilguy</h2>
        <p className="mb-6 text-gray-600 max-w-lg mx-auto">
          Track your habits, and grow your thoughts! Sign in to get started.
        </p>
      </div>
      */}
      {isAuthenticated ? (
        <>
          <h2 className="text-xl font-semibold mb-4" style={{ color: characterColor }}>
            Welcome, {user?.fullName || user?.firstName || convexUser?.name || "User"}
          </h2>
          {/*
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customize Your Color
          </label>
          <input
            type="color"
            value={characterColor}
            onChange={handleColorChange}
            className="p-1 border rounded h-10 w-20 cursor-pointer"
          />
          */}
          <div className="text-center py-8">
            <p className="text-lg text-pixel-green font-bold">
              Stay productive and help LilGuy reach their next evolution!
            </p>
          </div>
        </>
      ) : null}
      <HealthProvider>
        <div className="min-h-screen flex flex-col bg-pixel-pattern">
          <Header />
          <main className="flex-1 container max-w-[100%] px-4 py-6">
            <div className="flex flex-col lg:flex-row gap-6">

              {/* Left sidebar with LilGuy */}
              <div className="lg:w-[40%] lg:sticky top-6 h-[min-content]">
                <PixelWindow
                  title="LILGUY"
                  className="mb-4"
                >
                  <LilGuy />
                </PixelWindow>

                {/* LilGuy States Toggling - TEMP FOR TESTING ONLY */}
                {/* <PixelWindow
                  title="TEMP WINDOW"
                  className="mb-4"
                  contentClassName="p-2"
                >
                  <TestWindow />
                </PixelWindow> */}
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
                    {activeTab === 'dashboard' && <ProductivityMetrics userId={convexUser?._id} />}
                    {activeTab === 'websites' && <SiteList userId={convexUser?._id} />}
                    {activeTab === 'goals' && <Goals />}
                    {activeTab === 'widget' && (
                      <div className="widget-container" style={{ maxWidth: "300px", width: "100%", margin: "0 auto" }}>
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
    </>
  );
}
