"use client";

import Header from "@/components/Header/Header";
import { LilGuy } from "@/components/LilGuy/LilGuy";
import ProductivityMetrics from "@/components/ProductivityMetrics/ProductivityMetrics";
import TextBox from "@/components/TextBox/TextBox";
import { Card, CardContent } from "@/components/ui/Card/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs/Tabs";
import { useState } from "react";
import ExtensionWidget from "@/components/ExtensionWidget/ExtensionWidget";
import Goals from "@/components/Goals/Goals"

export default function Home() {
  const [health, setHealth] = useState(100);

  return (
    <>
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
                      <LilGuy health={health} />
                      <TextBox health={health} setHealth={setHealth} />
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
                  Website List
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
