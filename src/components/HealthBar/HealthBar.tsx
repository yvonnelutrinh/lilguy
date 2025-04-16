"use client"
import { useEffect, useState } from "react";

// Health Bar Component
interface HealthBarProps {
    showLabel?: boolean;
    className?: string;
    health?: number | null;
}

function HealthBar({
    showLabel = true,
    className = "",
    health = 0,
}: HealthBarProps) {
    // Simple direct color based on health percentage
    const getBgColor = () => {
        const healthValue = health || 0;
        if (healthValue <= 30) return "bg-red-500"; // Danger
        if (healthValue <= 70) return "bg-yellow-500"; // Warning
        return "bg-green-500"; // Good
    };
    
    return (
        <div
            className={`w-full flex flex-col justify-center items-center ${className}`}
        >
            <div className="relative w-full h-6 bg-white border-2 border-black rounded-none mb-1 overflow-hidden">
                <div
                    className={`absolute top-0 left-0 h-full ${getBgColor()}`}
                    style={{ width: `${health || 0}%` }}
                ></div>
            </div>
            {showLabel && (
                <div className="text-xs font-bold text-black">
                    {Math.floor(health ?? 0)} / 100
                </div>
            )}
        </div>
    );
}

// health bar as separate component for widget
function WidgetHealth() {
    const [health, setHealth] = useState<number>(55);

    useEffect(() => {
        // Initial load
        const storedHealth = localStorage.getItem("modifiedHealth");
        if (storedHealth) {
            try {
                setHealth(parseInt(storedHealth, 10));
            } catch (e) {
                console.error("Error parsing health:", e);
            }
        }
        
        // Listen for changes
        const handleStorageEvent = (e: StorageEvent) => {
            if (e.key === "modifiedHealth" && e.newValue) {
                try {
                    setHealth(parseInt(e.newValue, 10));
                } catch (e) {
                    console.error("Error parsing health:", e);
                }
            }
        };
        
        window.addEventListener("storage", handleStorageEvent);
        
        // Custom event listener
        const handleCustomEvent = (e: any) => {
            if (e.detail?.key === "modifiedHealth") {
                const value = parseInt(e.detail.value, 10);
                if (!isNaN(value)) {
                    setHealth(value);
                }
            }
        };
        
        window.addEventListener("localStorageChanged", handleCustomEvent);
        
        return () => {
            window.removeEventListener("storage", handleStorageEvent);
            window.removeEventListener("localStorageChanged", handleCustomEvent);
        };
    }, []);

    return <HealthBar health={health} showLabel={false} className="mt-1" />;
}

export { HealthBar, WidgetHealth };
