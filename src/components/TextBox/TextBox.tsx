"use client";

import React, { useEffect, useRef, useState } from "react";

interface TextBoxProps {
  health: number | null;
  setHealth: React.Dispatch<React.SetStateAction<number | null>>;
  animation: "idle" | "walk" | "happy" | "angry" | "sad" | "shocked";
  setAnimation: React.Dispatch<
    React.SetStateAction<"idle" | "walk" | "happy" | "angry" | "sad" | "shocked">
  >;
}

export default function TextBox({ health, setHealth, animation, setAnimation }: TextBoxProps) {
  const [text, setText] = useState("");
    const [buttonText, setButtonText] = useState("Walk");
  const textRef = useRef("");
  const message = "LilGuy is happy to be alive. WORK WORK WORK!";

  useEffect(() => {
    let index = 0;

    const interval = setInterval(() => {
      if (index < message.length) {
        textRef.current += message[index];
        setText(textRef.current);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

    useEffect(() => {
      if (health !== null) {
        localStorage.setItem("weeklyAverage", health.toString());
      }
    }, [health]);

  return (
    <div className="w-[100%] flex flex-col items-center">
      <div className="w-full bg-white p-[24px] min-h-[12.5rem] max-w-[25rem] border border-black flex flex-col items-start justify-start mb-4">
        <p className="text-left text-xl text-black font-mono">
          {text}
          <span className="ml-1 text-xl cursor-blink">|</span>
        </p>
      </div>

      <style jsx>{`
        .cursor-blink {
          animation: blink 0.9s step-end infinite;
        }

        @keyframes blink {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>

      <div className="flex gap-4 w-full">
        {/* was work button */}
        <button
          onClick={() => {
            // if (health !== null) {
            //   setHealth(Math.min(health + 5, 100));
            // }
           setAnimation((prev) => (prev === "walk" ? "idle" : "walk"));
              setButtonText ((prev) => (prev === "Walk" ? "Chill" : "Walk"));
          }}
          className="flex-1 px-4 py-2 bg-green-200 text-black border border-black rounded transition-all transform hover:bg-green-300"
        >
          {buttonText}
        </button>

        {/* was laze button */}
        <button
          onClick={() => {
            // if (health !== null) {
            //   setHealth(Math.max(health - 5, 0));
            // }
          setAnimation("happy");
          setTimeout(() => {
            setAnimation("idle");
          }, 2000);
          }}
          className="flex-1 px-4 py-2 bg-red-200 text-black border border-black rounded transition-all transform hover:bg-red-300"
        >
          Pet
        </button>
      </div>
    </div>
  );
}
