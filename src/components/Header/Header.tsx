
import { Bell, Settings } from 'lucide-react';
import { DropdownMenu } from "radix-ui";
import { Button } from '@/components/ui/Button/Button';

const notifications = [
    { id: 1, message: "You've been productive for 2 hours today!", isRead: false },
    { id: 2, message: "Your LilGuy is hungry! Feed them to boost mood.", isRead: false },
    { id: 3, message: "New trophy unlocked: Early Bird", isRead: true },
];

const Header: React.FC = () => {
    return (
        <header className="bg-white border-b-2 border-black px-4 py-2 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <h1 className="text-base font-bold sm:block">LilGuy</h1>
            </div>

            <div className="flex items-center gap-2">
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative"
                        >
                            <Bell className="h-5 w-5" />
                            {notifications.some(n => !n.isRead) && (
                                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                            )}
                        </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content align="end" className="rounded-lg border w-80 bg-white z-50">
                        <DropdownMenu.Label className="py-2 px-4">Notifications</DropdownMenu.Label>
                        <DropdownMenu.Separator />
                        {notifications.length === 0 ? (
                            <div className="py-2 px-4 text-sm text-gray-500 text-center">
                                No notifications
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <DropdownMenu.Item
                                    key={notification.id}
                                    className="py-2 px-4 cursor-pointer"
                                >
                                    <div className="flex items-start gap-2">
                                        <div
                                            className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${notification.isRead ? 'bg-transparent' : 'bg-red-500'
                                                }`}
                                        />
                                        <div className="text-sm">{notification.message}</div>
                                    </div>
                                </DropdownMenu.Item>
                            ))
                        )}
                        <DropdownMenu.Separator />
                        <DropdownMenu.Item className="text-center text-sm text-muted-foreground cursor-pointer">
                            Mark all as read
                        </DropdownMenu.Item>
                    </DropdownMenu.Content>
                </DropdownMenu.Root>

                <Button variant="outline" size="sm" className="gap-1">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Settings</span>
                </Button>
            </div>
        </header>
    );
};

export default Header;
