import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const NotificationsManagement = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, type: "new_photographer", message: "New photographer registration: Alex Chen", date: "2023-06-15 14:30", read: false },
    { id: 2, type: "new_booking", message: "New booking: Wedding session by Maria Garcia", date: "2023-06-16 10:45", read: true },
    { id: 3, type: "new_user", message: "New user registration: John Doe", date: "2023-06-17 09:15", read: false },
    { id: 4, type: "booking_cancelled", message: "Booking cancelled: Portrait session with Lisa Taylor", date: "2023-06-18 16:20", read: false },
  ]);

  const getNotificationTypeColor = (type: string) => {
    switch(type) {
      case 'new_photographer':
        return "bg-blue-500";
      case 'new_booking':
        return "bg-green-500";
      case 'new_user':
        return "bg-purple-500";
      case 'booking_cancelled':
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const markAsRead = (notificationId: number) => {
    setNotifications(notifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, read: true } 
        : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };

  const getNotificationType = (type: string) => {
    switch(type) {
      case 'new_photographer':
        return "New Photographer";
      case 'new_booking':
        return "New Booking";
      case 'new_user':
        return "New User";
      case 'booking_cancelled':
        return "Booking Cancelled";
      default:
        return type;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Manage system notifications
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={markAllAsRead}
          disabled={!notifications.some(n => !n.read)}
        >
          Mark All as Read
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                  No notifications found
                </TableCell>
              </TableRow>
            ) : (
              notifications.map(notification => (
                <TableRow key={notification.id} className={notification.read ? "" : "bg-gray-50"}>
                  <TableCell>
                    <Badge className={getNotificationTypeColor(notification.type)}>
                      {getNotificationType(notification.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>{notification.message}</TableCell>
                  <TableCell>{notification.date}</TableCell>
                  <TableCell>
                    {notification.read ? (
                      <Badge variant="outline">Read</Badge>
                    ) : (
                      <Badge className="bg-blue-500">Unread</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {!notification.read && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark as Read
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default NotificationsManagement;