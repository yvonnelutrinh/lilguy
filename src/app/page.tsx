"use client";

import LilGuy from "@/components/LilGuy/LilGuy";
import TextBox from "@/components/TextBox/TextBox";
import { useState } from "react";
import Header from "@/components/Header/Header";

export default function Home() {
  const [health, setHealth] = useState(100);

  return (
    <>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-pixel-background to-white">
        <Header />
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
          <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
            <LilGuy health={health} />
            <TextBox health={health} setHealth={setHealth} />
          </main>
        </div>
      </div>
    </>
  );
}
