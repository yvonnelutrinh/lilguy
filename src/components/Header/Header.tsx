import React from 'react';
import { DropdownMenu } from "radix-ui";
import AuthButton from '../AuthButton/AuthButton';
import { Button } from "../UI/Button/Button";

const notifications = [
    { id: 1, message: "You've been productive for 2 hours today!", isRead: false },
    { id: 2, message: "Your LilGuy is hungry! Feed them to boost mood.", isRead: false },
    { id: 3, message: "New trophy unlocked: Early Bird", isRead: true },
];

// Pixel art icon components
const BellIcon = () => (
  <div className="w-6 h-6 relative flex items-center justify-center p-1">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="pixelated">
      <rect x="7" y="2" width="6" height="2" fill="currentColor" />
      <rect x="5" y="4" width="2" height="2" fill="currentColor" />
      <rect x="13" y="4" width="2" height="2" fill="currentColor" />
      <rect x="5" y="6" width="2" height="8" fill="currentColor" />
      <rect x="13" y="6" width="2" height="8" fill="currentColor" />
      <rect x="7" y="14" width="6" height="2" fill="currentColor" />
      <rect x="3" y="12" width="2" height="2" fill="currentColor" />
      <rect x="15" y="12" width="2" height="2" fill="currentColor" />
      <rect x="7" y="16" width="2" height="2" fill="currentColor" />
      <rect x="11" y="16" width="2" height="2" fill="currentColor" />
      <rect x="9" y="18" width="2" height="2" fill="currentColor" />
    </svg>
  </div>
);

const SettingsIcon = () => (
  <div className="w-6 h-6 relative flex items-center justify-center p-1">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="pixelated">
      <rect x="8" y="2" width="4" height="2" fill="currentColor" />
      <rect x="8" y="16" width="4" height="2" fill="currentColor" />
      <rect x="16" y="8" width="2" height="4" fill="currentColor" />
      <rect x="2" y="8" width="2" height="4" fill="currentColor" />
      <rect x="5" y="3" width="2" height="2" fill="currentColor" />
      <rect x="13" y="3" width="2" height="2" fill="currentColor" />
      <rect x="13" y="15" width="2" height="2" fill="currentColor" />
      <rect x="5" y="15" width="2" height="2" fill="currentColor" />
      <rect x="6" y="6" width="8" height="8" fill="currentColor" />
      <rect x="8" y="8" width="4" height="4" fill="white" />
    </svg>
  </div>
);

const Header: React.FC = () => {
    return (
        <header className="bg-white border-pixel border-black px-4 py-2 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <img src="/assets/icons/lilguy-logo.svg" alt="LilGuy Logo" className="w-8 h-8 bg-white border-pixel border-black flex items-center justify-center" />
                <h1 className="text-base font-bold sm:block font-pixel">LilGuy</h1>
            </div>

            <div className="text-right">
                <AuthButton />
            </div>

            <div className="flex items-center gap-2">
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative p-1 bg-pixel-beige border-pixel border-black shadow-pixel-btn hover:translate-y-[-1px] hover:translate-x-[-1px] hover:shadow-pixel-btn-hover active:translate-y-[1px] active:translate-x-[1px] active:shadow-pixel-btn-active"
                        >
                            <BellIcon />
                            {notifications.some(n => !n.isRead) && (
                                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-black"></span>
                            )}
                        </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content align="end" className="pixel-window w-80 z-50">
                        <div className="pixel-window-header bg-pixel-pink">
                            <div className="font-pixel text-pixel-sm">A MESSAGE FOR YOU</div>
                            <div className="pixel-window-controls">
                                <div className="pixel-window-button"></div>
                                <div className="pixel-window-button"></div>
                                <div className="pixel-window-button"></div>
                            </div>
                        </div>
                        <div className="pixel-window-content">
                            {notifications.length === 0 ? (
                                <div className="py-2 px-4 text-sm font-pixel text-center">
                                    No notifications
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {notifications.map((notification) => (
                                        <DropdownMenu.Item
                                            key={notification.id}
                                            className="cursor-pointer border border-black py-2 px-3"
                                        >
                                            <div className="flex items-start gap-2">
                                                <div
                                                    className={`w-2 h-2 mt-1.5 border border-black flex-shrink-0 ${notification.isRead ? 'bg-transparent' : 'bg-red-500'}`}
                                                />
                                                <div className="font-pixel text-pixel-sm">{notification.message}</div>
                                            </div>
                                        </DropdownMenu.Item>
                                    ))}
                                </div>
                            )}
                            <div className="mt-3 flex justify-center">
                                <button className="bg-pixel-beige border-pixel border-black px-3 py-2 font-pixel text-pixel-sm shadow-pixel-btn hover:translate-y-[-1px] hover:translate-x-[-1px] hover:shadow-pixel-btn-hover active:translate-y-[1px] active:translate-x-[1px] active:shadow-pixel-btn-active">OK</button>
                            </div>
                        </div>
                    </DropdownMenu.Content>
                </DropdownMenu.Root>

                <Button variant="outline" size="sm" className="gap-1 p-1 bg-pixel-beige border-pixel border-black shadow-pixel-btn hover:translate-y-[-1px] hover:translate-x-[-1px] hover:shadow-pixel-btn-hover active:translate-y-[1px] active:translate-x-[1px] active:shadow-pixel-btn-active">
                    <SettingsIcon />
                    <span className="hidden sm:inline font-pixel text-pixel-sm">Settings</span>
                </Button>
            </div>
        </header>
    );
};

export default Header;
