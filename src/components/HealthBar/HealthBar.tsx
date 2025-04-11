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
    health,
}: HealthBarProps) {
    return (
        <div
            className={`w-full flex flex-col justify-center items-center ${className}`}
        >
            <div className="relative w-[90%] h-4 bg-gray-300 rounded-full mb-2">
                <div
                    className="absolute top-0 left-0 h-full rounded-full"
                    style={{
                        width: `${health}%`,
                        backgroundColor:
                            (health ?? 100) <= 30
                                ? "red"
                                : (health ?? 100) <= 70
                                    ? "yellow"
                                    : "green",
                    }}
                ></div>
            </div>
            {showLabel && (
                <div className="text-xs text-black">
                    {Math.floor(health ?? 100)} / 100
                </div>
            )}
        </div>
    );
}

// health bar as separate component for widget
function WidgetHealth() {
    const [health, setHealth] = useState<number>(() => {
        const storedHealth = localStorage.getItem("modifiedHealth");
        return storedHealth ? JSON.parse(storedHealth) : 55;
    });

    useEffect(() => {
        // TODO: it only changes when we're on other pages
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "modifiedHealth") {
                const newValue = e.newValue ? JSON.parse(e.newValue) : null;
                setHealth(newValue);
            }
        };
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    return <HealthBar health={health} className="mb-2" />;
}

export { HealthBar, WidgetHealth };
