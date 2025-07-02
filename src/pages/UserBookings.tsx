import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import BookingViewCard from "@/components/BookingViewCard";
import RescheduleForm from "@/components/RescheduleForm";
import ViewPhotosGallery from "@/components/ViewPhotosGallery";
import { useAuth } from "@/contexts/AuthContext";
import bookingService, { BookingData } from "@/services/bookingService";

const UserBookings = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  
  // States for bookings
  const [upcomingBookings, setUpcomingBookings] = useState<BookingData[]>([]);
  const [pastBookings, setPastBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States for modals and actions
  const [selectedBookingToView, setSelectedBookingToView] = useState<string | null>(null);
  const [bookingToReschedule, setBookingToReschedule] = useState<string | null>(null);
  const [bookingToViewPhotos, setBookingToViewPhotos] = useState<string | null>(null);
  
  // Check if user is logged in
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view your bookings.",
      });
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const bookings = await bookingService.getUserBookings();
        
        // Sort bookings into upcoming and past
        const today = new Date();
        const upcoming: BookingData[] = [];
        const past: BookingData[] = [];
        
        bookings.forEach(booking => {
          const bookingDate = new Date(booking.date);
          if (bookingDate >= today) {
            upcoming.push(booking);
          } else {
            past.push(booking);
          }
        });
        
        setUpcomingBookings(upcoming);
        setPastBookings(past);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast({
          title: "Failed to Load Bookings",
          description: "There was an issue loading your bookings. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated]);
  
  const getStatusBadgeColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'confirmed':
      case 'completed':
        return "bg-green-500";
      case 'pending':
        return "bg-yellow-500";
      case 'cancelled':
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };
  
  // Helper functions to get booking details
  const getBookingById = (id: string) => {
    return upcomingBookings.find(booking => booking._id === id) || 
           pastBookings.find(booking => booking._id === id);
  };
  
  // Handle booking cancellation
  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) {
      return;
    }
    
    try {
      await bookingService.cancelBooking(bookingId);
      
      // Update the booking in state
      setUpcomingBookings(prevBookings => 
        prevBookings.map(booking => 
          booking._id === bookingId ? { ...booking, status: 'cancelled' } : booking
        )
      );
      
      toast({
        title: "Booking Cancelled",
        description: "Your booking has been successfully cancelled.",
      });
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      toast({
        title: "Cancellation Failed",
        description: error.message || "There was an issue cancelling your booking. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMMM d, yyyy');
  };

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">My Bookings</h1>
          <div className="flex gap-4">
            <Link to="/photographers">
              <Button>Book New Session</Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">Upcoming Bookings</TabsTrigger>
            <TabsTrigger value="past">Past Bookings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Sessions</CardTitle>
                <CardDescription>
                  View and manage your upcoming photography sessions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="w-10 h-10 border-t-4 border-primary border-solid rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-500">Loading your bookings...</p>
                  </div>
                ) : upcomingBookings.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Photographer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Package</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upcomingBookings.map(booking => (
                        <TableRow key={booking._id}>
                          <TableCell>{booking._id?.substring(0, 8)}</TableCell>
                          <TableCell>{booking.photographer?.fullName || 'Unknown'}</TableCell>
                          <TableCell>{formatDate(booking.date)}</TableCell>
                          <TableCell>{booking.timeSlot}</TableCell>
                          <TableCell>{booking.package?.name || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeColor(booking.status || '')}>
                              {booking.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedBookingToView(booking._id!)}
                              >
                                Details
                              </Button>
                              {booking.status === 'confirmed' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setBookingToReschedule(booking._id!)}
                                >
                                  Reschedule
                                </Button>
                              )}
                              {booking.status !== 'cancelled' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-red-500"
                                  onClick={() => handleCancelBooking(booking._id!)}
                                >
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">You don't have any upcoming bookings.</p>
                    <Link to="/photographers">
                      <Button>Book a Session</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="past" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Past Sessions</CardTitle>
                <CardDescription>
                  View your completed photography sessions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="w-10 h-10 border-t-4 border-primary border-solid rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-500">Loading your bookings...</p>
                  </div>
                ) : pastBookings.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Photographer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Package</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pastBookings.map(booking => (
                        <TableRow key={booking._id}>
                          <TableCell>{booking._id?.substring(0, 8)}</TableCell>
                          <TableCell>{booking.photographer?.fullName || 'Unknown'}</TableCell>
                          <TableCell>{formatDate(booking.date)}</TableCell>
                          <TableCell>{booking.timeSlot}</TableCell>
                          <TableCell>{booking.package?.name || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeColor(booking.status || '')}>
                              {booking.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedBookingToView(booking._id!)}
                              >
                                Details
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setBookingToViewPhotos(booking._id!)}
                              >
                                View Photos
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                              >
                                Review
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">You don't have any past bookings yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-8 text-center">
          <Link to="/how-it-works/user">
            <Button variant="outline">
              How It Works for Users
            </Button>
          </Link>
        </div>
      </main>
      
      {/* Modals and Dialogs */}
      {selectedBookingToView !== null && getBookingById(selectedBookingToView) && (
        <BookingViewCard 
          booking={getBookingById(selectedBookingToView)!}
          isOpen={selectedBookingToView !== null}
          onClose={() => setSelectedBookingToView(null)}
        />
      )}
      
      {bookingToReschedule !== null && getBookingById(bookingToReschedule) && (
        <RescheduleForm 
          bookingId={bookingToReschedule}
          currentDate={getBookingById(bookingToReschedule)!.date}
          currentTime={getBookingById(bookingToReschedule)!.timeSlot}
          isOpen={bookingToReschedule !== null}
          onClose={() => setBookingToReschedule(null)}
          onReschedule={() => {
            // Refresh bookings after rescheduling
            setBookingToReschedule(null);
            window.location.reload();
          }}
        />
      )}
      
      {bookingToViewPhotos !== null && getBookingById(bookingToViewPhotos) && (
        <ViewPhotosGallery
          bookingId={bookingToViewPhotos}
          bookingType={getBookingById(bookingToViewPhotos)!.package?.name || 'Session'}
          photographerName={getBookingById(bookingToViewPhotos)!.photographer?.fullName || 'Photographer'}
          isOpen={bookingToViewPhotos !== null}
          onClose={() => setBookingToViewPhotos(null)}
        />
      )}
    </>
  );
};

export default UserBookings;
