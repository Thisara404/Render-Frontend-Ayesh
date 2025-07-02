import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookingData } from "@/services/bookingService";
import { format } from "date-fns";

interface BookingViewProps {
  booking: BookingData;
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  onStatusChange?: (status: string) => Promise<void>;
}

const BookingViewCard: React.FC<BookingViewProps> = ({
  booking,
  isOpen,
  onClose,
  isAdmin = false,
  onStatusChange
}) => {
  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return "bg-green-500 text-white";
      case 'pending':
        return "bg-yellow-500 text-white";
      case 'cancelled':
        return "bg-red-500 text-white";
      case 'completed':
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const handleStatusChange = async (status: string) => {
    if (onStatusChange) {
      try {
        await onStatusChange(status);
        onClose();
      } catch (err) {
        console.error("Failed to update status:", err);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
          <DialogDescription>
            View detailed information about this booking.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex justify-between">
            <span className="font-medium">Booking ID:</span>
            <span>{booking._id?.substring(0, 8)}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Status:</span>
            <Badge className={getStatusBadgeColor(booking.status || '')}>
              {booking.status}
            </Badge>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Client:</span>
            <span>{booking.contactInfo?.name || 'Unknown'}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="font-medium">Date:</span>
            <span>
              {booking.date ? format(new Date(booking.date), 'MMMM d, yyyy') : 'Not set'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="font-medium">Time:</span>
            <span>{booking.timeSlot}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="font-medium">Package:</span>
            <span>{booking.package?.name || 'N/A'}</span>
          </div>
          
          {booking.location && (
            <div className="flex justify-between">
              <span className="font-medium">Location:</span>
              <span>{booking.location}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="font-medium">Price:</span>
            <span>${booking.totalPrice}</span>
          </div>
          
          {booking.contactInfo && (
            <div>
              <span className="font-medium block mb-1">Contact Info:</span>
              <div className="text-sm space-y-1">
                <p>{booking.contactInfo.name}</p>
                <p>{booking.contactInfo.email}</p>
                <p>{booking.contactInfo.phone}</p>
              </div>
            </div>
          )}
          
          {booking.notes && (
            <div>
              <span className="font-medium block mb-1">Notes:</span>
              <p className="text-sm bg-gray-50 p-2 rounded">{booking.notes}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-wrap gap-2">
          {booking.status === 'pending' && !isAdmin && onStatusChange && (
            <>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleStatusChange('confirmed')}
              >
                Accept Booking
              </Button>
              <Button 
                variant="outline" 
                className="text-red-500"
                onClick={() => handleStatusChange('cancelled')}
              >
                Decline
              </Button>
            </>
          )}
          
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingViewCard;
