import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import PortfolioUploadForm from "@/components/portfolio/PortfolioUploadForm";
import PortfolioGallery from "@/components/portfolio/PortfolioGallery";
import portfolioService, { Portfolio } from "@/services/portfolioService";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, FolderOpen, Clock, Calendar as CalendarIcon, User, Loader2 } from "lucide-react";
import PackageManagement from "@/components/packages/PackageManagement";
import bookingService, { BookingData } from "@/services/bookingService";
import PhotographerBookings from "@/components/photographer/photographer.bookings";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import photographerService from "@/services/photographer.service";

// Default mock data for initial state
const initialMockBookings = [
  { id: 1, client: "John Doe", date: "2025-06-15", time: "14:00-16:00", type: "Portrait", status: "confirmed", location: "Central Park, NY", notes: "Client wants natural settings", contactInfo: "john@example.com, (555) 123-4567" },
  { id: 2, client: "Jane Smith", date: "2025-06-18", time: "10:00-12:00", type: "Wedding", status: "pending", location: "Grand Hotel Ballroom", notes: "Pre-wedding photoshoot", contactInfo: "jane@example.com, (555) 987-6543" },
  { id: 3, client: "Mike Johnson", date: "2025-06-20", time: "16:00-18:00", type: "Event", status: "confirmed", location: "Tech Conference Center", notes: "Corporate event coverage", contactInfo: "mike@example.com, (555) 456-7890" }
];

const PhotographerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTab, setSelectedTab] = useState("bookings");
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [loadingPortfolios, setLoadingPortfolios] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [profileImage, setProfileImage] = useState<File | string | null>(user?.profileImage || null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([
    'portrait', 'wedding', 'event', 'family', 'commercial', 'nature', 'fashion'
  ]);
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    specialty: user?.specialty || '',
    location: user?.location || '',
    bio: user?.bio || '',
    categories: user?.categories || [],
    pricing: {
      hourlyRate: user?.pricing?.hourlyRate || 150,
      weddingPackage: user?.pricing?.weddingPackage || 2500,
      eventRate: user?.pricing?.eventRate || 200
    }
  });

  // Check if user is logged in and is a photographer
  useEffect(() => {
    if (!user || user.role !== 'photographer') {
      toast({
        title: "Access Denied",
        description: "You must be logged in as a photographer to view this page.",
        variant: "destructive"
      });
      navigate('/login');
    }
  }, [user, navigate, toast]);

  // Fetch portfolios when portfolio tab is selected
  useEffect(() => {
    const fetchPortfolios = async () => {
      if (selectedTab === "portfolio") {
        try {
          setLoadingPortfolios(true);
          const data = await portfolioService.getPhotographerPortfolios();
          setPortfolios(data);
        } catch (error) {
          console.error("Error fetching portfolios:", error);
          toast({
            title: "Error",
            description: "Failed to load your portfolio collections",
            variant: "destructive",
          });
        } finally {
          setLoadingPortfolios(false);
        }
      }
    };

    fetchPortfolios();
  }, [selectedTab, toast]);

  // Fetch real bookings
  useEffect(() => {
    const fetchBookings = async () => {
      if (!isAuthenticated || user?.role !== 'photographer') return;
      
      try {
        setLoadingBookings(true);
        const data = await bookingService.getPhotographerBookings();
        setBookings(data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast({
          title: "Failed to Load Bookings",
          description: "There was an issue loading your bookings. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoadingBookings(false);
      }
    };
    
    if (selectedTab === 'bookings' || selectedTab === 'calendar') {
      fetchBookings();
    }
  }, [selectedTab, isAuthenticated, user]);

  // Update booking status
  const handleBookingStatusChange = async (bookingId: string, status: string) => {
    try {
      await bookingService.updateBookingStatus(bookingId, status);
      
      // Update booking in state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking._id === bookingId ? { ...booking, status } : booking
        )
      );
      
      toast({
        title: `Booking ${status === 'confirmed' ? 'Confirmed' : 'Declined'}`,
        description: `The booking has been ${status === 'confirmed' ? 'confirmed' : 'declined'} successfully.`,
      });
    } catch (error: any) {
      console.error(`Error ${status === 'confirmed' ? 'confirming' : 'declining'} booking:`, error);
      toast({
        title: "Action Failed",
        description: error.message || `There was an issue ${status === 'confirmed' ? 'confirming' : 'declining'} the booking.`,
        variant: "destructive"
      });
    }
  };

  // Handle profile form change
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle pricing change
  const handlePricingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [name]: parseFloat(value) || 0
      }
    }));
  };

  // Handle category selection
  const handleCategoryChange = (category: string, checked: boolean) => {
    setProfileData(prev => {
      if (checked) {
        return {
          ...prev,
          categories: [...prev.categories, category]
        };
      } else {
        return {
          ...prev,
          categories: prev.categories.filter(c => c !== category)
        };
      }
    });
  };

  // Handle profile image change
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  // Handle profile submission
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      const formData = new FormData();
      
      // Append basic profile data
      formData.append('fullName', profileData.fullName);
      formData.append('specialty', profileData.specialty);
      formData.append('location', profileData.location);
      formData.append('bio', profileData.bio);
      formData.append('categories', JSON.stringify(profileData.categories));
      formData.append('pricing', JSON.stringify(profileData.pricing));
      
      // Append profile image if it's a File
      if (profileImage instanceof File) {
        formData.append('profileImage', profileImage);
      }
      
      // Make API call to update profile
      const updatedProfile = await photographerService.updateProfile(formData);
      
      // Update local user context with new data
      if (user) {
        const updatedUser = {
          ...user,
          ...updatedProfile,
          profileImage: updatedProfile.profileImage
        };
        // Update your auth context with new user data
        // This depends on your auth context implementation
      }
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: error.message || "There was a problem updating your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Photographer Dashboard</h1>
          <div className="flex gap-4">
            <Button onClick={() => setShowPortfolioForm(true)}>Upload New Photos</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{bookings.length}</div>
              <p className="text-xs text-gray-500 mt-1">+2 from last week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Portfolio Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">975</div>
              <p className="text-xs text-gray-500 mt-1">+15% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Upcoming Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">3</div>
              <p className="text-xs text-gray-500 mt-1">Within next 7 days</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="bookings" className="space-y-8" onValueChange={setSelectedTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="packages">Packages</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bookings" className="space-y-4">
            <PhotographerBookings 
              bookings={bookings}
              loading={loadingBookings}
              onStatusUpdate={handleBookingStatusChange}
            />
          </TabsContent>
          
          <TabsContent value="portfolio" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between md:items-center">
                  <div>
                    <CardTitle>Your Portfolio</CardTitle>
                    <CardDescription>
                      Manage your photography collections.
                    </CardDescription>
                  </div>
                  <Button 
                    className="mt-4 md:mt-0" 
                    onClick={() => setShowPortfolioForm(true)}
                  >
                    <PlusCircle className="h-5 w-5 mr-2" />
                    New Collection
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingPortfolios ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                      <Card key={i} className="overflow-hidden">
                        <div className="aspect-square bg-gray-200">
                          <Skeleton className="w-full h-full" />
                        </div>
                        <CardContent className="p-4">
                          <Skeleton className="h-4 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-1/2" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : portfolios.length > 0 ? (
                  <div className="space-y-8">
                    {portfolios.map(portfolio => (
                      <div key={portfolio._id} className="space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b">
                          <div>
                            <h3 className="font-semibold text-lg">{portfolio.title}</h3>
                            <p className="text-sm text-gray-500">
                              {portfolio.category.charAt(0).toUpperCase() + portfolio.category.slice(1)} • 
                              {portfolio.images.length} photos • 
                              {new Date(portfolio.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setSelectedPortfolio(portfolio)}
                          >
                            Upload More Photos
                          </Button>
                        </div>
                        <PortfolioGallery 
                          portfolio={portfolio}
                          onRefresh={() => {
                            portfolioService.getPhotographerPortfolios()
                              .then(setPortfolios)
                              .catch(console.error);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <FolderOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium mb-2">No Portfolio Collections Yet</h3>
                    <p className="text-gray-500 mb-6">
                      Create your first collection and start uploading photos to showcase your work.
                    </p>
                    <Button onClick={() => setShowPortfolioForm(true)}>
                      Create Your First Collection
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="packages" className="space-y-4">
            <PackageManagement refreshDashboard={() => {}} />
          </TabsContent>
          
          <TabsContent value="calendar" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Calendar</CardTitle>
                    <CardDescription>Select a date to see bookings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="border rounded-md p-3"
                    />
                  </CardContent>
                </Card>
              </div>
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Bookings for {date ? format(date, 'MMMM d, yyyy') : 'Today'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {bookings.length > 0 ? (
                      <div className="space-y-4">
                        {bookings.map(booking => (
                          <div key={booking.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="font-semibold">{booking.client}</h3>
                              <Badge className={booking.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'}>
                                {booking.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-500 space-y-1">
                              <div className="flex">
                                <span className="w-24">Time:</span>
                                <span>{booking.time}</span>
                              </div>
                              <div className="flex">
                                <span className="w-24">Type:</span>
                                <span>{booking.type}</span>
                              </div>
                            </div>
                            <div className="mt-4 flex gap-2">
                              <Button variant="outline" size="sm">Contact Client</Button>
                              <Button 
                                size="sm"
                                onClick={() => setSelectedPortfolio(booking)}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <CalendarIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                        <p className="mt-2 text-gray-500">No bookings scheduled for this date</p>
                        <Button className="mt-4">Set As Available</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Photographer Profile</CardTitle>
                <CardDescription>
                  Manage your public profile information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  {/* Profile Image Section */}
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/3">
                      <div className="relative mx-auto w-40 h-40 rounded-full overflow-hidden border-2 border-gray-200">
                        {profileImage ? (
                          <img 
                            src={profileImage instanceof File ? URL.createObjectURL(profileImage) : profileImage}
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <User className="h-20 w-20 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute bottom-0 inset-x-0 bg-black bg-opacity-50 text-white text-center py-1">
                          <label htmlFor="profile-upload" className="cursor-pointer text-sm">
                            Change Photo
                            <input 
                              id="profile-upload" 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={handleProfileImageChange}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Basic Information */}
                    <div className="w-full md:w-2/3 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Full Name</label>
                          <Input 
                            name="fullName" 
                            value={profileData.fullName} 
                            onChange={handleProfileChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Email</label>
                          <Input 
                            name="email" 
                            value={profileData.email} 
                            onChange={handleProfileChange}
                            disabled
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Business Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-4">Business Information</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Specialty</label>
                          <Input 
                            name="specialty" 
                            value={profileData.specialty} 
                            onChange={handleProfileChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Location</label>
                          <Input 
                            name="location" 
                            value={profileData.location} 
                            onChange={handleProfileChange}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Categories */}
                    <div>
                      <h3 className="font-medium mb-4">Photography Categories</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {availableCategories.map(category => (
                          <div key={category} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`category-${category}`}
                              checked={profileData.categories.includes(category)}
                              onCheckedChange={(checked) => handleCategoryChange(category, checked)}
                            />
                            <label htmlFor={`category-${category}`} className="text-sm font-medium capitalize">
                              {category}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bio</label>
                    <Textarea
                      name="bio"
                      value={profileData.bio}
                      onChange={handleProfileChange}
                      placeholder="Tell clients about yourself, your experience, and your photography style"
                      className="min-h-[120px]"
                    />
                  </div>
                  
                  {/* Pricing Information */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Pricing Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Hourly Rate ($)</label>
                        <Input
                          name="hourlyRate"
                          type="number"
                          value={profileData.pricing.hourlyRate}
                          onChange={handlePricingChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Wedding Package ($)</label>
                        <Input
                          name="weddingPackage"
                          type="number"
                          value={profileData.pricing.weddingPackage}
                          onChange={handlePricingChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Event Rate ($/hour)</label>
                        <Input
                          name="eventRate"
                          type="number"
                          value={profileData.pricing.eventRate}
                          onChange={handlePricingChange}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 flex justify-end">
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Profile'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-8 text-center">
          <Link to="/how-it-works/photographer">
            <Button variant="outline">
              How It Works for Photographers
            </Button>
          </Link>
        </div>
      </main>
      
      {/* Modal Components */}
      <PortfolioUploadForm 
        isOpen={showPortfolioForm} 
        onClose={() => setShowPortfolioForm(false)} 
        onSuccess={() => {
          portfolioService.getPhotographerPortfolios()
            .then(setPortfolios)
            .catch(console.error);
        }}
      />
      
      {selectedPortfolio && (
        <PortfolioUploadForm 
          isOpen={!!selectedPortfolio}
          onClose={() => setSelectedPortfolio(null)}
          onSuccess={() => {
            portfolioService.getPhotographerPortfolios()
              .then(setPortfolios)
              .catch(console.error);
          }}
          portfolioId={selectedPortfolio._id}
          initialStep={2}
        />
      )}
      
      <Footer />
    </>
  );
};

export default PhotographerDashboard;
