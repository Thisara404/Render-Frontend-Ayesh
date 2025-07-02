import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Clock, Mail, Check, CameraIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import portfolioService, { Portfolio, PortfolioImage } from '@/services/portfolioService';
import packageService, { Package } from "@/services/packageService";
import bookingService from '@/services/bookingService';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/services/api';

interface Photographer {
  _id: string;
  fullName: string;
  specialty?: string;
  image?: string;
  rating?: number;
  price?: number;
  categories?: string[];
  location?: string;
  bio?: string;
  experience?: number;
}

const PhotographerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [bookingStep, setBookingStep] = useState(1);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loadingPortfolios, setLoadingPortfolios] = useState<boolean>(true);
  const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<PortfolioImage | null>(null);
  const [photographer, setPhotographer] = useState<Photographer | null>(null);
  const [loadingPhotographer, setLoadingPhotographer] = useState<boolean>(true);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loadingPackages, setLoadingPackages] = useState<boolean>(true);
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  // Available time slots
  const timeSlots = [
    "9:00 AM", "10:00 AM", "11:00 AM", 
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"
  ];

  // Fetch photographer data
  useEffect(() => {
    const fetchPhotographerData = async () => {
      if (!id) return;
      
      setLoadingPhotographer(true);
      try {
        // Fix the API path - use the correct endpoint
        console.log(`Fetching photographer data for ID: ${id}`);
        const response = await fetch(`${API_BASE_URL}/photographer/${id}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          throw new Error(errorData.message || 'Failed to load photographer data');
        }
        
        const data = await response.json();
        console.log('Photographer data received:', data);
        setPhotographer(data.data);
      } catch (error) {
        console.error('Error fetching photographer:', error);
        toast({
          title: "Error",
          description: "Failed to load photographer information. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoadingPhotographer(false);
      }
    };

    fetchPhotographerData();
  }, [id]);

  // Fetch photographer's public portfolios
  useEffect(() => {
    const fetchPortfolios = async () => {
      if (!id) return;
      
      setLoadingPortfolios(true);
      try {
        const portfolioData = await portfolioService.getPublicPortfolios(id);
        setPortfolios(portfolioData);
        
        // Select the first portfolio by default if available
        if (portfolioData.length > 0) {
          setSelectedPortfolio(portfolioData[0]._id);
        }
      } catch (error) {
        console.error('Error fetching portfolios:', error);
        toast("Error", {
          description: "Failed to load photographer's portfolio",
        });
      } finally {
        setLoadingPortfolios(false);
      }
    };

    fetchPortfolios();
  }, [id]);

  // Fetch packages
  useEffect(() => {
    const fetchPackages = async () => {
      if (!id) return;
      
      try {
        setLoadingPackages(true);
        console.log(`Fetching packages for photographer: ${id}`);
        const data = await packageService.getPublicPackages(id);
        console.log('Fetched packages:', data);
        setPackages(data);
      } catch (error) {
        console.error('Error fetching packages:', error);
        toast({
          title: "Error",
          description: "Failed to load photographer packages.",
          variant: "destructive",
        });
      } finally {
        setLoadingPackages(false);
      }
    };

    fetchPackages();
  }, [id]);

  // Handle booking submission
  const handleBooking = async () => {
    if (bookingStep === 1 && date && selectedTime && selectedPackage) {
      setBookingStep(2);
    } else if (bookingStep === 2) {
      // Validate form fields
      if (!contactInfo.name || !contactInfo.email || !contactInfo.phone) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required contact information.",
          variant: "destructive"
        });
        return;
      }
      
      // Check if user is logged in
      if (!isAuthenticated) {
        toast({
          title: "Authentication Required",
          description: "Please log in to book a session.",
          variant: "destructive"
        });
        navigate('/login');
        return;
      }
      
      try {
        // Format date to ISO string
        const bookingDate = date ? format(date, 'yyyy-MM-dd') : '';
        
        // Create booking object
        const bookingData = {
          photographer: photographer?._id,
          package: selectedPackage?._id,
          date: bookingDate,
          timeSlot: selectedTime,
          location: 'To be determined', // This could be added to the form
          totalPrice: selectedPackage?.price || 0,
          notes: contactInfo.notes,
          contactInfo: {
            name: contactInfo.name,
            email: contactInfo.email,
            phone: contactInfo.phone
          }
        };
        
        // Submit booking
        await bookingService.createBooking(bookingData);
        
        toast.success(`Booking confirmed with ${photographer?.fullName}!`, {
          description: `Your session is scheduled for ${format(date!, 'MMMM d, yyyy')} at ${selectedTime}.`,
        });
        
        // Reset form
        setBookingStep(1);
        setDate(undefined);
        setSelectedTime(undefined);
        setSelectedPackage(null);
        setContactInfo({ name: '', email: '', phone: '', notes: '' });
        
        // Redirect to user bookings page
        navigate('/bookings');
      } catch (error: any) {
        console.error('Booking creation error:', error);
        toast({
          title: "Booking Failed",
          description: error.message || "There was an issue creating your booking. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  // Open image view
  const handleOpenImage = (image: PortfolioImage) => {
    setSelectedImage(image);
  };

  // Get current portfolio
  const getCurrentPortfolio = () => {
    return portfolios.find(p => p._id === selectedPortfolio);
  };

  // Default image for photographer
  const defaultImage = "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80";

  const getFullImageUrl = (imagePath: string): string => {
    if (!imagePath) return defaultImage;
    if (imagePath.startsWith('http')) return imagePath;
    
    // For local development, prepend the API URL
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiBaseUrl.replace('/api', ''); // Remove '/api' to get the server root
    return `${baseUrl}${imagePath}`;
  };

  // Add this function to handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties
      const [parent, child] = name.split('.');
      setContactInfo(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setContactInfo(prev => ({ ...prev, [name]: value }));
    }
  };

  // Add this function to handle package selection
  const handlePackageSelection = (pkg: Package) => {
    setSelectedPackage(pkg);
  };

  if (loadingPhotographer) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow bg-gray-50 pt-16">
          <div className="container mx-auto px-4">
            <div className="w-full h-[300px] bg-gray-200 animate-pulse rounded-lg mb-6"></div>
            <div className="h-8 w-64 bg-gray-200 animate-pulse rounded mb-3"></div>
            <div className="h-4 w-48 bg-gray-200 animate-pulse rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="bg-white rounded-lg p-6 h-[600px] animate-pulse"></div>
              </div>
              <div>
                <div className="bg-white rounded-lg p-6 h-[400px] animate-pulse"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!photographer && !loadingPhotographer) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow bg-gray-50 py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold mb-4">Photographer Not Found</h1>
            <p className="text-gray-600 mb-6">We couldn't find the photographer you're looking for.</p>
            <Button onClick={() => navigate('/photographers')}>Go Back</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow bg-gray-50 dark:bg-gray-900">
        {/* Photographer Hero */}
        <section className="relative h-[50vh] min-h-[400px]">
          <div className="absolute inset-0">
            <img 
              src={photographer?.profileImage ? getFullImageUrl(photographer.profileImage) : 
      photographer?.image ? getFullImageUrl(photographer.image) : defaultImage}
              alt={photographer?.fullName || 'Photographer'} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="container mx-auto">
              <h1 className="text-4xl font-serif font-bold mb-2">{photographer?.fullName}</h1>
              <div className="flex items-center mb-2">
                <span className="mr-2">{photographer?.specialty || 'Professional Photographer'}</span>
                {photographer?.rating && (
                  <>
                    <span className="mx-2">•</span>
                    <span className="flex items-center text-yellow-400 mr-2">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path>
                      </svg>
                      <span className="ml-1">{photographer.rating}</span>
                    </span>
                  </>
                )}
                {photographer?.location && (
                  <>
                    <span className="mx-2">•</span>
                    <span>{photographer.location}</span>
                  </>
                )}
              </div>
              {photographer?.categories && photographer.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {photographer.categories.map((category, index) => (
                    <span 
                      key={index}
                      className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full capitalize"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-gray-200 max-w-2xl">
                {photographer?.bio || `${photographer?.fullName} is a professional photographer with a passion for capturing special moments.`}
              </p>
            </div>
          </div>
        </section>
        
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="portfolio" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <TabsList className="border-b border-gray-100 dark:border-gray-700 w-full rounded-none p-0 h-auto">
                  <TabsTrigger 
                    value="portfolio" 
                    className="py-4 px-6 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-photo-accent"
                  >
                    Portfolio
                  </TabsTrigger>
                  <TabsTrigger 
                    value="packages" 
                    className="py-4 px-6 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-photo-accent"
                  >
                    Packages
                  </TabsTrigger>
                  <TabsTrigger 
                    value="reviews" 
                    className="py-4 px-6 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-photo-accent"
                  >
                    Reviews
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="portfolio" className="p-6">
                  {loadingPortfolios ? (
                    <div className="space-y-6">
                      {/* Portfolio loading skeleton */}
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {[1, 2, 3].map(i => (
                          <Skeleton key={`tab-${i}`} className="h-10 w-32 rounded-full" />
                        ))}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                          <Skeleton key={`img-${i}`} className="aspect-square rounded-md" />
                        ))}
                      </div>
                    </div>
                  ) : portfolios.length > 0 ? (
                    <div className="space-y-6">
                      {/* Portfolio category selection */}
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {portfolios.map(portfolio => (
                          <Button 
                            key={portfolio._id}
                            variant={selectedPortfolio === portfolio._id ? "default" : "outline"}
                            onClick={() => setSelectedPortfolio(portfolio._id)}
                            className="whitespace-nowrap capitalize"
                          >
                            {portfolio.title}
                          </Button>
                        ))}
                      </div>
                      
                      {/* Portfolio images grid */}
                      {getCurrentPortfolio() && getCurrentPortfolio()?.images.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {getCurrentPortfolio()?.images.map((image) => (
                            <div 
                              key={image._id} 
                              className="aspect-square rounded-md overflow-hidden cursor-pointer"
                              onClick={() => handleOpenImage(image)}
                            >
                              <img 
                                src={getFullImageUrl(image.url)} 
                                alt={image.caption || "Portfolio image"}
                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <CameraIcon className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No photos in this collection</h3>
                          <p className="text-gray-500 dark:text-gray-400 mt-2">
                            There are no photos in this collection yet. Check back later!
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <CameraIcon className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No Portfolio Available</h3>
                      <p className="text-gray-500 dark:text-gray-400 mt-2">
                        This photographer doesn't have any portfolio galleries yet.
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="packages" className="p-6">
                  <div className="space-y-6">
                    {loadingPackages ? (
                      <div className="text-center py-6">
                        <div className="w-8 h-8 border-t-2 border-primary border-solid rounded-full animate-spin mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading packages...</p>
                      </div>
                    ) : packages.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">This photographer hasn't created any packages yet.</p>
                      </div>
                    ) : (
                      packages.map((pkg) => (
                        <div key={pkg._id} className="border border-gray-100 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-serif text-xl font-medium dark:text-gray-100">{pkg.name} Package</h3>
                              <p className="text-photo-muted dark:text-gray-400">{pkg.duration}</p>
                            </div>
                            <div className="text-xl font-medium dark:text-gray-200">${pkg.price}</div>
                          </div>
                          <p className="mb-4 dark:text-gray-300">{pkg.description}</p>
                          <div className="space-y-2">
                            <h4 className="font-medium dark:text-gray-200">Includes:</h4>
                            <ul className="space-y-1">
                              {pkg.includes && pkg.includes.map((item, i) => (
                                <li key={i} className="flex items-center text-sm dark:text-gray-300">
                                  <Check className="h-4 w-4 mr-2 text-green-500" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <Button 
                            onClick={() => handlePackageSelection(pkg)} 
                            className="mt-4 w-full"
                            variant={selectedPackage?._id === pkg._id ? "default" : "outline"}
                          >
                            {selectedPackage?._id === pkg._id ? "Selected" : "Select This Package"}
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="reviews" className="p-6">
                  {photographer?.reviews && photographer.reviews.length > 0 ? (
                    <div className="space-y-6">
                      {photographer.reviews.map((review, index) => (
                        <div key={index} className="border-b border-gray-100 dark:border-gray-700 pb-6 last:border-0">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-medium">{review.name}</h3>
                              <p className="text-sm text-gray-500">{review.date}</p>
                            </div>
                            <div className="flex text-yellow-500">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <svg 
                                  key={i} 
                                  className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'fill-gray-200'}`} 
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path>
                                </svg>
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No Reviews Yet</h3>
                      <p className="text-gray-500 dark:text-gray-400 mt-2">
                        This photographer doesn't have any reviews yet. Be the first to book and review!
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Booking Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 sticky top-24">
                <h2 className="text-xl font-serif font-medium mb-4 dark:text-gray-100">{bookingStep === 1 ? 'Book a Session' : 'Confirm Booking'}</h2>
                
                {bookingStep === 1 ? (
                  <>
                    <div className="mb-6">
                      <h3 className="font-medium mb-2 dark:text-gray-300">Select Date</h3>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-800" align="start">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                            disabled={(date) => date < new Date()}
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="font-medium mb-2 dark:text-gray-300">Select Time</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {timeSlots.map((time) => (
                          <Button
                            key={time}
                            variant={selectedTime === time ? "default" : "outline"}
                            size="sm"
                            className={cn(
                              "text-sm",
                              selectedTime === time ? "bg-photo-accent hover:bg-photo-accent/90" : ""
                            )}
                            onClick={() => setSelectedTime(time)}
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="font-medium mb-2 dark:text-gray-300">Select Package</h3>
                      <div className="space-y-2">
                        {packages.map((pkg) => (
                          <div 
                            key={pkg._id}
                            className={`border ${selectedPackage?._id === pkg._id ? 'border-photo-accent' : 'border-gray-200'} rounded-md p-3 cursor-pointer hover:border-photo-accent`}
                            onClick={() => handlePackageSelection(pkg)}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-medium">{pkg.name}</h4>
                                <p className="text-sm text-gray-500">{pkg.duration}</p>
                              </div>
                              <div className="font-medium">${pkg.price}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Date</span>
                        <span className="font-medium dark:text-gray-200">{date ? format(date, "MMMM d, yyyy") : ""}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Time</span>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-gray-500" />
                          <span className="font-medium">{selectedTime}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Package</span>
                        <span className="font-medium">{selectedPackage ? `${selectedPackage.name} - $${selectedPackage.price}` : 'Not selected'}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">Photographer</span>
                        <span className="font-medium">{photographer?.fullName}</span>
                      </div>
                      <div className="flex justify-between items-center font-medium text-lg pt-2">
                        <span>Total</span>
                        <span>${selectedPackage?.price || 0}</span>
                      </div>
                    </div>
                    <div className="mb-6">
                      <h3 className="font-medium mb-2 dark:text-gray-300">Contact Information</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Full Name *</label>
                          <input 
                            type="text" 
                            name="name"
                            value={contactInfo.name}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Your full name"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Email *</label>
                          <input 
                            type="email" 
                            name="email"
                            value={contactInfo.email}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Your email address"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Phone *</label>
                          <input 
                            type="tel" 
                            name="phone"
                            value={contactInfo.phone}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Your phone number"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Special Requests</label>
                          <textarea 
                            name="notes"
                            value={contactInfo.notes}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            rows={3}
                            placeholder="Any special requests for your session"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                <div className="flex gap-3">
                  {bookingStep === 2 && (
                    <Button 
                      variant="outline" 
                      className="w-1/2"
                      onClick={() => setBookingStep(1)}
                    >
                      Back
                    </Button>
                  )}
                  <Button 
                    className={`bg-photo-accent hover:bg-photo-accent/90 ${bookingStep === 1 ? 'w-full' : 'w-1/2'}`}
                    disabled={bookingStep === 1 && (!date || !selectedTime)}
                    onClick={handleBooking}
                  >
                    {bookingStep === 1 ? 'Continue to Book' : 'Confirm Booking'}
                  </Button>
                </div>
                
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    You won't be charged until after your session
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Full size image view dialog */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl p-1 bg-black" aria-describedby="portfolio-image-description">
            <DialogTitle className="sr-only">Portfolio Image</DialogTitle>
            <DialogDescription id="portfolio-image-description" className="sr-only">
              View full size portfolio image from {photographer?.fullName}'s collection
            </DialogDescription>
            <div className="relative w-full">
              <img
                src={getFullImageUrl(selectedImage.url)}
                alt={selectedImage.caption || "Portfolio image"}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              <DialogClose className="absolute top-2 right-2 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </DialogClose>
            </div>
            {selectedImage.caption && (
              <div className="p-4 bg-white">
                <p className="text-sm font-medium">{selectedImage.caption}</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
      
      <Footer />
    </div>
  );
};

export default PhotographerDetail;
