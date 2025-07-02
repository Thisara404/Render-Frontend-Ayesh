import React, { useState } from "react";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import BookingViewCard from "@/components/BookingViewCard";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { BookingData } from "@/services/bookingService";

interface PhotographerBookingsProps {
  bookings: BookingData[];
  onStatusUpdate: (bookingId: string, newStatus: string) => Promise<void>;
  loading?: boolean;
}

const PhotographerBookings: React.FC<PhotographerBookingsProps> = ({ 
  bookings, 
  onStatusUpdate,
  loading = false
}) => {
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const { toast } = useToast();

  const getStatusBadgeColor = (status: string) => {
    switch(status?.toLowerCase()) {
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

  const handleAcceptBooking = async (bookingId: string) => {
    try {
      await onStatusUpdate(bookingId, "confirmed");
      toast({
        title: "Success",
        description: "Booking has been confirmed"
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive"
      });
    }
  };

  const handleDeclineBooking = async (bookingId: string) => {
    try {
      await onStatusUpdate(bookingId, "cancelled");
      toast({
        title: "Success",
        description: "Booking has been declined"
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive"
      });
    }
  };

  const getSelectedBookingDetails = () => {
    return bookings.find(booking => booking._id === selectedBooking);
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Your Bookings</CardTitle>
          <CardDescription>
            Manage your upcoming photography sessions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="w-10 h-10 border-t-4 border-primary border-solid rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading your bookings...</p>
            </div>
          ) : bookings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map(booking => (
                  <TableRow key={booking._id}>
                    <TableCell>{booking._id?.substring(0, 8)}</TableCell>
                    <TableCell>{booking.contactInfo?.name || 'Unknown'}</TableCell>
                    <TableCell>{format(new Date(booking.date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{booking.timeSlot}</TableCell>
                    <TableCell>{booking.package?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedBooking(booking._id)}
                        >
                          Details
                        </Button>
                        {booking.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleAcceptBooking(booking._id!)}
                            >
                              Accept
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-500"
                              onClick={() => handleDeclineBooking(booking._id!)}
                            >
                              Decline
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No bookings found.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {selectedBooking && getSelectedBookingDetails() && (
        <BookingViewCard 
          booking={getSelectedBookingDetails()!}
          isOpen={selectedBooking !== null} 
          onClose={() => setSelectedBooking(null)}
          onStatusChange={async (status) => {
            if (selectedBooking) {
              await onStatusUpdate(selectedBooking, status);
              setSelectedBooking(null);
            }
          }}
        />
      )}
    </>
  );
};

export default PhotographerBookings;