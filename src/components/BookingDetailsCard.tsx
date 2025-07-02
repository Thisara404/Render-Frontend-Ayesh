
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BookingDetailsCardProps {
  booking: {
    id: number;
    client: string;
    date: string;
    time: string;
    type: string;
    status: string;
    location?: string;
    notes?: string;
    contactInfo?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

const BookingDetailsCard = ({ booking, isOpen, onClose }: BookingDetailsCardProps) => {
  const getStatusBadgeColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'confirmed':
        return "bg-green-500";
      case 'pending':
        return "bg-yellow-500";
      case 'cancelled':
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleSendMessage = () => {
    // Simulate sending a message
    setTimeout(() => {
      onClose();
    }, 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
          <DialogDescription>
            Detailed information about this booking.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{booking.client}</h3>
            <Badge className={getStatusBadgeColor(booking.status)}>
              {booking.status}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Booking ID</h4>
              <p className="text-sm">{booking.id}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Session Type</h4>
              <p className="text-sm">{booking.type}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Date</h4>
              <p className="text-sm">{booking.date}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Time</h4>
              <p className="text-sm">{booking.time}</p>
            </div>
          </div>
          
          {booking.location && (
            <div>
              <h4 className="text-sm font-medium text-gray-500">Location</h4>
              <p className="text-sm">{booking.location}</p>
            </div>
          )}
          
          {booking.contactInfo && (
            <div>
              <h4 className="text-sm font-medium text-gray-500">Contact Information</h4>
              <p className="text-sm">{booking.contactInfo}</p>
            </div>
          )}
          
          {booking.notes && (
            <div>
              <h4 className="text-sm font-medium text-gray-500">Additional Notes</h4>
              <p className="text-sm">{booking.notes}</p>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          {booking.status === 'pending' && (
            <>
              <Button className="bg-green-600 hover:bg-green-700 sm:mr-2">
                Accept Booking
              </Button>
              <Button variant="outline" className="text-red-500 sm:mr-2">
                Decline
              </Button>
            </>
          )}
          <Button variant="outline" onClick={handleSendMessage}>
            Message Client
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDetailsCard;
