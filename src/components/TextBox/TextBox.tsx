"use client";

import React, { useEffect, useRef, useState } from "react";

interface TextBoxProps {
  animation: "idle" | "walk" | "happy" | "angry" | "sad" | "shocked";
  setAnimation: React.Dispatch<
    React.SetStateAction<
      "idle" | "walk" | "happy" | "angry" | "sad" | "shocked"
    >
  >;
}

export default function TextBox({animation, setAnimation }: TextBoxProps) {
  const [text, setText] = useState("");
  const [buttonText, setButtonText] = useState("Walk");
  const [message, setMessage] = useState<string>("");
  const textRef = useRef("");

useEffect(() => {
  const storedModifiedHealth = localStorage.getItem("modifiedHealth");
  const modifiedHealth = storedModifiedHealth
    ? parseFloat(storedModifiedHealth)
    : undefined;

  const storedName = localStorage.getItem("lilGuyName") || "LilGuy";

  let newMessage = `${storedName} is happy to be alive. WORK WORK WORK!`;

  if (modifiedHealth !== undefined) {
    if (modifiedHealth < 30) {
      newMessage = `${storedName} looks depressed. He doesn't feel like you're meeting your potential.`;
    } else if (modifiedHealth >= 30 && modifiedHealth <= 60) {
      newMessage = `${storedName} is doing OK, but he knows you can do better.`;
    } else if (modifiedHealth >= 61 && modifiedHealth <= 80) {
      newMessage = `${storedName} is feeling positive! He knows you're working hard.`;
    } else if (modifiedHealth >= 81 && modifiedHealth <= 100) {
      newMessage = `${storedName} is over the moon! He's very proud of you.`;
    }
  }

  setMessage(newMessage);
}, []);

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
 }, [message]);

 useEffect(() => {
   if (animation === "idle" && buttonText === "Chill") {
     setButtonText("Walk");
   }
 }, [animation]);

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
