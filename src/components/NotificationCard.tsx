
import React from "react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock notification data
const mockNotifications = [
  {
    id: 1,
    title: "New Booking Request",
    message: "John Doe has requested a portrait session on June 15th.",
    time: "10 minutes ago",
    read: false,
  },
  {
    id: 2,
    title: "Booking Confirmed",
    message: "Your session with Sarah Williams has been confirmed.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 3,
    title: "Review Received",
    message: "You received a 5-star review from Michael Brown.",
    time: "1 day ago",
    read: true,
  },
  {
    id: 4,
    title: "Payment Received",
    message: "Payment of $250 has been processed for wedding photos.",
    time: "3 days ago",
    read: true,
  },
  {
    id: 5,
    title: "System Update",
    message: "The platform has been updated with new features.",
    time: "1 week ago",
    read: true,
  }
];

const NotificationCard = () => {
  const unreadCount = mockNotifications.filter(n => !n.read).length;
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
          Notifications
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 flex items-center justify-center p-0 rounded-full text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">Notifications</h3>
          <Button variant="link" size="sm" className="h-auto p-0 text-sm text-blue-500">
            Mark all as read
          </Button>
        </div>
        <ScrollArea className="h-[300px] pr-3">
          <div className="space-y-2">
            {mockNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-3 rounded-md border ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-sm">{notification.title}</h4>
                  <span className="text-xs text-gray-500">{notification.time}</span>
                </div>
                <p className="text-sm mt-1 text-gray-600">{notification.message}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="mt-2 pt-2 border-t flex justify-center">
          <Button variant="link" className="text-sm text-blue-500 w-full">
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCard;
