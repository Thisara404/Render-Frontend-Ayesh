import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import BookingViewCard from '@/components/BookingViewCard';
import bookingService, { BookingData } from '@/services/bookingService';

interface BookingsManagementProps {
  searchTerm: string;
}

const BookingsManagement: React.FC<BookingsManagementProps> = ({ searchTerm }) => {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookingToView, setSelectedBookingToView] = useState<string | null>(null);
  
  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const data = await bookingService.getAllBookings();
        setBookings(data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast({
          title: "Failed to Load Bookings",
          description: "There was an issue loading the bookings data.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, []);
  
  // Filter bookings based on search term
  const filteredBookings = bookings.filter(booking => 
    (booking.contactInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     booking.photographer?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     booking.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     booking.package?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const getStatusBadgeColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'confirmed':
        return "bg-green-500";
      case 'pending':
        return "bg-yellow-500";
      case 'cancelled':
        return "bg-red-500";
      case 'completed':
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };
  
  // Get booking data for view card
  const getBookingToView = () => {
    return bookings.find(booking => booking._id === selectedBookingToView);
  };
  
  // Handle booking status update
  const handleUpdateStatus = async (bookingId: string, status: string) => {
    try {
      await bookingService.updateBookingStatus(bookingId, status);
      
      // Update booking in state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking._id === bookingId ? { ...booking, status } : booking
        )
      );
      
      toast({
        title: "Status Updated",
        description: `Booking status has been updated to ${status}.`,
      });
    } catch (error: any) {
      console.error('Error updating booking status:', error);
      toast({
        title: "Update Failed",
        description: error.message || "There was an issue updating the booking status.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>
            View and manage all photography session bookings across the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="w-10 h-10 border-t-4 border-primary border-solid rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading bookings data...</p>
            </div>
          ) : filteredBookings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Photographer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map(booking => (
                  <TableRow key={booking._id}>
                    <TableCell>{booking._id?.substring(0, 8)}</TableCell>
                    <TableCell>{booking.contactInfo?.name || 'Unknown'}</TableCell>
                    <TableCell>{booking.photographer?.fullName || 'Unknown'}</TableCell>
                    <TableCell>{format(new Date(booking.date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{booking.package?.name || 'N/A'}</TableCell>
                    <TableCell>${booking.totalPrice}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(booking.status || '')}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedBookingToView(booking._id!)}
                        >
                          View
                        </Button>
                        <div className="relative group">
                          <Button 
                            variant="outline" 
                            size="sm"
                          >
                            Update Status
                          </Button>
                          <div className="absolute z-10 right-0 w-48 bg-white shadow-lg rounded-md overflow-hidden transform scale-0 group-hover:scale-100 origin-top-right transition-transform duration-100 ease-in-out">
                            <div className="py-1">
                              <button 
                                className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                onClick={() => handleUpdateStatus(booking._id!, 'confirmed')}
                              >
                                Confirm
                              </button>
                              <button 
                                className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                onClick={() => handleUpdateStatus(booking._id!, 'completed')}
                              >
                                Mark Completed
                              </button>
                              <button 
                                className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                onClick={() => handleUpdateStatus(booking._id!, 'cancelled')}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No bookings found matching your search criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {selectedBookingToView !== null && getBookingToView() && (
        <BookingViewCard 
          booking={getBookingToView()!}
          isOpen={selectedBookingToView !== null}
          onClose={() => setSelectedBookingToView(null)}
          isAdmin={true}
        />
      )}
    </>
  );
};

export default BookingsManagement;