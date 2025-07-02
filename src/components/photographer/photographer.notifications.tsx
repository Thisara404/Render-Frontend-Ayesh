//show booked confirmations,pending or rejected bookings and upcoming bookings ans also payment notifications

import React from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationType {
  id: number;
  type: string;
  message: string;
  date: string;
  read: boolean;
}

interface NotificationCardProps {
  notifications?: NotificationType[];
  unreadCount?: number;
  onViewAll?: () => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ 
  notifications = [],
  unreadCount = 0,
  onViewAll = () => {}
}) => {
  return (
    <div className="relative">
      <Button variant="outline" className="relative" onClick={onViewAll}>
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {unreadCount}
          </span>
        )}
      </Button>
    </div>
  );
};

export default NotificationCard;