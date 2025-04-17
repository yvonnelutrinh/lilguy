import React from 'react';
import { DropdownMenu } from "radix-ui";
import { Button } from '../ui/Button/Button';
import SignInButton from '../SignInButton/SignInButton';
import Image from 'next/image';

const notifications = [
    { id: 1, message: "You've been productive for 2 hours today!", isRead: false },
    { id: 2, message: "Your LilGuy is hungry! Feed them to boost mood.", isRead: false },
    { id: 3, message: "New trophy unlocked: Early Bird", isRead: true },
];

// Pixel art icon components
const BellIcon = () => (
  <div className="w-8 h-8 relative flex items-center justify-center p-1">
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

const Header: React.FC<{ userId: string | undefined }> = ({ userId }) => {
    const unreadMessages = useQuery(api.messages.getUnreadMessagesByUser, userId ? { userId } : "skip");
    const markAllMessagesAsRead = useMutation(api.messages.markAllMessagesAsRead);
    const markMessageAsRead = useMutation(api.messages.markMessageAsRead);

    const handleMarkAllAsRead = () => {
        if (userId) {
            markAllMessagesAsRead({ userId });
        }
    };

    const handleMarkMessageAsRead = (messageId: Id<"messages">) => {
        markMessageAsRead({ messageId });
    };

    return (
        <header className="bg-white border-b-2 border-black px-4 py-2 flex justify-between items-center">

            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white border-2 border-black flex items-center justify-center">
                    <Image src="/icons/lilguy-logo.svg" alt="LilGuy Logo" width={24} height={24} />
                </div>
                <h1 className="text-base font-bold sm:block text-pixel">LilGuy</h1>
            </div>

            <div className="text-right">
            </div>

            <div className="flex items-center gap-2">
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative pixel-button pixel-button-secondary p-1 flex items-center justify-center h-8 w-8"
                        >
                            <BellIcon />
                            {unreadMessages && unreadMessages.length > 0 && (
                                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-black"></span>
                            )}
                        </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content align="end" className="pixel-window w-80 z-50">
                        <div className="pixel-window-header bg-pixel-pink">
                            <div className="text-pixel-sm">Welcome to Lilguy</div>
                            <div className="pixel-window-controls">
                                <div className="pixel-window-button"></div>
                                <div className="pixel-window-button"></div>
                                <div className="pixel-window-button"></div>
                            </div>
                        </div>
                        <div className="pixel-window-content text-center py-8">
                            <p className="text-lg text-pixel-green mb-2" style={{ fontFamily: 'Menlo-Regular, Menlo, monospace' }}>
                                Track your habits, and grow your thoughts! Sign in to save your progress.
                            </p>
                        </div>
                    </DropdownMenu.Content>
                </DropdownMenu.Root>
                <SignInButton />
            </div>
        </header>
    );
};

export default Header;
