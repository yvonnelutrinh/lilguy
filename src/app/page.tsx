"use client";

import Header from "@/components/Header/Header";
import { LilGuy } from "@/components/LilGuy/LilGuy";
import ProductivityMetrics from "@/components/ProductivityMetrics/ProductivityMetrics";
// import TextBox from "@/components/TextBox/TextBox"; // put in LilGuy instead
import AuthButton from "@/components/AuthButton/AuthButton";
import ExtensionWidget from "@/components/ExtensionWidget/ExtensionWidget";
import Goals from "@/components/Goals/Goals";
import SiteList from "@/components/SiteList/SiteList";
import { Card, CardContent } from "@/components/ui/Card/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs/Tabs";
import { useUser } from "@clerk/nextjs";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";

export const generateLocalTokenIdentifier = () => {
  if (typeof window === 'undefined') return 'local:unknown';
  const userAgent = window.navigator.userAgent;
  const screenInfo = `${window.screen.width}x${window.screen.height}`;
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return `local:${userAgent}-${screenInfo}-${timeZone}`;
};

export default function Home() {
  const [customColor, setCustomColor] = useState(() => {
    // Try to get color from localStorage first, fall back to default
    if (typeof window !== 'undefined') {
      return localStorage.getItem('customColor') || "#3B82F6";
    }
    return "#3B82F6";
  });

  const { isAuthenticated, isLoading } = useConvexAuth();
  const { user, isLoaded } = useUser();

  const convexUser = useQuery(
    api.users.getUser,
    user?.id
      ? { tokenIdentifier: `clerk:${user?.id}` }
      : { tokenIdentifier: generateLocalTokenIdentifier() }
  );

  // Update customColor when convexUser data is loaded
  useEffect(() => {
    if (convexUser?.customColor) {
      setCustomColor(convexUser.customColor);
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
          customColor: "#3B82F6",
        }).catch(err => console.error("Error creating user:", err));
      } else {
        // Create local user in Convex
        const localIdentifier = `local:${window.navigator.userAgent}-${window.screen.width}x${window.screen.height}-${Intl.DateTimeFormat().resolvedOptions().timeZone}`;
        createUser({
          tokenIdentifier: localIdentifier,
          name: "Local User",
          email: "",
          customColor: "#3B82F6",
        }).catch(err => console.error("Error creating local user:", err));
      }
    }
  }, [isLoaded, user, convexUser, createUser]);

  const updateCustomColor = useMutation(api.users.updateCustomColor);
  const handleColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomColor(newColor);

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
      {!isAuthenticated && (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Welcome to Lilguy</h2>
          <p className="mb-6 text-gray-600 max-w-lg mx-auto">
            Track your habits, and grow your thoughts! Sign in to get started.
          </p>
        </div>
      )}
      {/* always render LilGuy, but if isAuthenticated, we pull data from DB */}
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-pixel-background to-white">
        <Header />
        <main className="flex-1 container max-w-[100%] px-4 py-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left sidebar with LilGuy */}
            <Card className="pixel-container md:w-[40%] lg:sticky top-6 h-[min-content]">
              <CardContent className="p-4 gap-0">
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="relative mb-4">
                    {/* <div className="grid grid-rows-[1.25rem_1fr_1.25rem] items-center justify-items-center p-8 pb-20 font-[family-name:var(--font-geist-sans)]"> */}
                    <main className="flex flex-col gap-[2rem] row-start-2 items-center sm:items-start">
                      <h2 className="text-xl font-semibold mb-4" style={{ color: customColor }}>
                        Welcome, {user?.fullName || user?.firstName || "User"}
                      </h2>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Customize Your Color
                        </label>
                        <input
                          type="color"
                          value={customColor}
                          onChange={handleColorChange}
                          className="p-1 border rounded h-10 w-20 cursor-pointer"
                        />
                      </div>
                      <LilGuy user={user} />
                    </main>
                    {/* </div> */}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dashboard content */}
            <div className="flex-1">
              <Tabs defaultValue="dashboard" className="mb-6">
                <TabsList>
                  <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                  <TabsTrigger value="websites">Websites</TabsTrigger>
                  <TabsTrigger value="goals">Goals</TabsTrigger>
                  <TabsTrigger value="widget">Widget</TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard" className="mt-4">
                  <ProductivityMetrics />
                </TabsContent>

                <TabsContent value="websites" className="mt-4">
                  <SiteList user={user} />
                </TabsContent>

                <TabsContent value="goals" className="mt-4">
                  <Goals />
                </TabsContent>

                <TabsContent value="widget" className="mt-4">
                  {/* Widget Preview */}
                  <div className="mt-8">
                    <div className="flex justify-center">
                      <ExtensionWidget />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
