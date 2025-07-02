import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import portfolioService from '@/services/portfolioService';
import { API_BASE_URL } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface Photographer {
  _id: string;
  fullName: string;
  specialty?: string;
  image?: string;
  rating?: number;
  price?: number;
  categories?: string[];
  location?: string;
  portfolioPreview?: { url: string }[];
}

const Index: React.FC = () => {
  const [featuredPhotographers, setFeaturedPhotographers] = useState<Photographer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentHeroImage, setCurrentHeroImage] = useState(0);
  const { toast } = useToast();

  // Default image for photographers without a profile image
  const defaultImage = "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

  // Hero section images from local assets folder
  const heroImages = [
    "/assets/images/Hero/1.jpg",
    "/assets/images/Hero/2.jpg",
    "/assets/images/Hero/3.jpg",
    "/assets/images/Hero/4.jpg",
    "/assets/images/Hero/5.jpg"
  ];

  // Function to cycle through hero images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroImage((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Function to get full image URL
  const getFullImageUrl = (imagePath: string): string => {
    if (!imagePath) return defaultImage;
    if (imagePath.startsWith('http')) return imagePath;
    // For local development, prepend the API URL
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiBaseUrl.replace('/api', ''); // Remove '/api' to get the server root
    return `${baseUrl}${imagePath}`;
  };

  // Fetch real photographers data
  useEffect(() => {
    const fetchPhotographers = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/photographers`);
        if (!response.ok) {
          throw new Error(`Failed to load photographers: ${response.status}`);
        }
        const data = await response.json();
        
        if (!data.data || !Array.isArray(data.data)) {
          throw new Error('Invalid response format');
        }

        // Get random 3 photographers
        let randomPhotographers = [...data.data];
        if (randomPhotographers.length > 3) {
          // Shuffle the array and take first 3
          randomPhotographers = randomPhotographers
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
        }

        // For each photographer, fetch their portfolio previews
        const photographersWithPortfolios = await Promise.all(
          randomPhotographers.map(async (photographer: Photographer) => {
            try {
              // Get the photographer's portfolios
              const portfolios = await portfolioService.getPublicPortfolios(photographer._id);
              
              // Get at most 3 images from different portfolios as a preview
              const previewImages: { url: string }[] = [];
              if (portfolios && portfolios.length > 0) {
                portfolios.forEach(portfolio => {
                  if (portfolio.images && portfolio.images.length > 0) {
                    // Get featured image from each portfolio until we have 3
                    const featuredImage = portfolio.images.find(img => img.isFeatured) || portfolio.images[0];
                    if (previewImages.length < 3 && featuredImage) {
                      previewImages.push({
                        url: portfolioService.getFullImageUrl(featuredImage.url)
                      });
                    }
                  }
                });
              }
              
              return {
                ...photographer,
                portfolioPreview: previewImages
              };
            } catch (error) {
              console.error(`Error fetching portfolio for photographer ${photographer._id}:`, error);
              return photographer;
            }
          })
        );
        
        setFeaturedPhotographers(photographersWithPortfolios);
      } catch (error) {
        console.error('Error fetching photographers:', error);
        toast({
          title: "Error",
          description: "Failed to load featured photographers. Please try again later.",
          variant: "destructive"
        });
        
        // Set default values as fallback
        setFeaturedPhotographers([
          {
            _id: '1',
            fullName: "Alex Johnson",
            specialty: "Portrait Photography",
            image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
            rating: 4.9,
            price: 150
          },
          {
            _id: '2',
            fullName: "Sophia Williams",
            specialty: "Wedding Photography",
            image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81",
            rating: 4.8,
            price: 200
          },
          {
            _id: '3',
            fullName: "Michael Chen",
            specialty: "Commercial Photography",
            image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
            rating: 4.7,
            price: 175
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotographers();
  }, [toast]);

  // Sample testimonials
  const testimonials = [
    {
      name: "Emma Thompson",
      photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
      quote: "We found the perfect wedding photographer through SnapBook. The whole process was so easy, and the photos are amazing!",
      role: "Bride"
    },
    {
      name: "David Rodriguez",
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
      quote: "As a busy professional, I needed corporate headshots quickly. SnapBook connected me with a photographer within hours.",
      role: "Marketing Director"
    }
  ];

  // In the return statement, update sections with dark mode support
  return (
    <div className="flex flex-col min-h-screen" style={{ overflow: 'hidden', width: '100%', maxWidth: '100%' }}>
      <Header />
      {/* Hero Section with Dynamic Background Image Carousel */}
      <section className="relative bg-gradient-to-b from-photo-navy to-photo-darknavy text-photo-beige py-24 md:py-32" style={{ overflow: 'hidden' }}>
        {/* Background hero images carousel */}
        {heroImages.map((image, index) => (
          <div 
            key={index}
            className={`absolute inset-0 bg-center bg-cover transition-opacity duration-1000 ${
              index === currentHeroImage ? 'opacity-30' : 'opacity-0'
            }`}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}
        
        {/* Overlay and Design Elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-photo-navy/70 to-photo-rust/60 opacity-30"></div>
        <div className="absolute inset-y-0 right-0 w-full md:w-1/2 bg-white/10 transform -skew-x-12"></div>
        <div className="absolute bottom-0 right-0 w-full h-32 bg-white/5 transform -skew-y-3"></div>
        
        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl animate-fade-in">
            <div className="flex items-center justify-center md:justify-start mb-6">
              <img src="/assets/images/logo.png" alt="SnapBook Logo" className="h-24 md:h-28" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6">
              Capture Your <span className="text-yellow-200">Perfect Moments</span> With Professional Photographers
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8">
              Find and book talented photographers in your area for any occasion. From weddings to portraits,
              product shoots to special events.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/photographers">
                <Button size="lg" className="bg-photo-beige text-photo-navy hover:bg-photo-beige/90 transition-colors">
                  Find a Photographer
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="border-photo-beige text-neutral-500 hover:bg-photo-beige/10 transition-colors">
                  Join as a Photographer
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Hero Image Navigation Dots */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
          {heroImages.map((_, index) => (
            <button
              key={index}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                index === currentHeroImage ? 'bg-white' : 'bg-white/40'
              }`}
              onClick={() => setCurrentHeroImage(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-photo-beige dark:bg-photo-darknavy" style={{ overflow: 'hidden' }}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold text-center mb-12 text-photo-navy dark:text-photo-beige">Photography Services</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Category Cards */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-photo-rust/20 dark:bg-photo-rust/30 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-photo-rust" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="font-medium text-lg mb-2 text-photo-navy dark:text-photo-beige">Wedding</h3>
              <p className="text-photo-navy/70 dark:text-photo-beige/70 text-sm">Capture your special day</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-photo-rust/20 dark:bg-photo-rust/30 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-photo-rust" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="font-medium text-lg mb-2 text-photo-navy dark:text-photo-beige">Portrait</h3>
              <p className="text-photo-navy/70 dark:text-photo-beige/70 text-sm">Professional headshots</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-photo-rust/20 dark:bg-photo-rust/30 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-photo-rust" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="font-medium text-lg mb-2 text-photo-navy dark:text-photo-beige">Family</h3>
              <p className="text-photo-navy/70 dark:text-photo-beige/70 text-sm">Preserving precious moments</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-photo-rust/20 dark:bg-photo-rust/30 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-photo-rust" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-medium text-lg mb-2 text-photo-navy dark:text-photo-beige">Commercial</h3>
              <p className="text-photo-navy/70 dark:text-photo-beige/70 text-sm">Boost your business</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Photographers */}
      <section className="py-16 bg-white dark:bg-photo-navy" style={{ overflow: 'hidden' }}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-serif font-bold mb-2 text-photo-navy dark:text-photo-beige">Featured Photographers</h2>
              <p className="text-photo-navy/70 dark:text-photo-beige/70">
                Discover our top-rated professional photographers
              </p>
            </div>
            <Link to="/photographers" className="text-photo-rust hover:text-photo-rust/80 font-medium">
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((item) => (
                <div key={item} className="rounded-xl overflow-hidden bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600">
                  <Skeleton className="aspect-[3/2] w-full" />
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPhotographers.map((photographer) => (
                <Link
                  to={`/photographer/${photographer._id}`}
                  key={photographer._id}
                  className="group rounded-xl overflow-hidden bg-photo-beige dark:bg-photo-navy border border-photo-navy/10 dark:border-photo-beige/10 hover:shadow-md transition-shadow"
                >
                  <div className="aspect-[3/2] overflow-hidden">
                    {photographer.portfolioPreview && photographer.portfolioPreview.length > 0 ? (
                      <img
                        src={photographer.portfolioPreview[0].url}
                        alt={`${photographer.fullName}'s work`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <img
                        src={photographer.image || defaultImage}
                        alt={photographer.fullName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-medium mb-1 text-photo-navy dark:text-photo-beige">{photographer.fullName}</h3>
                    <p className="text-photo-navy/70 dark:text-photo-beige/70 mb-3">{photographer.specialty || "Professional Photographer"}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-medium dark:text-gray-300">{photographer.rating || "4.8"}</span>
                      </div>
                      <span className="text-photo-accent dark:text-purple-400 font-semibold">${photographer.price || "150"}/hr</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-photo-beige dark:bg-photo-navy">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold text-center mb-12 text-photo-navy dark:text-photo-beige">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-photo-rust/20 dark:bg-photo-rust/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-photo-rust">1</span>
              </div>
              <h3 className="text-xl font-medium mb-2 text-photo-navy dark:text-photo-beige">Browse Photographers</h3>
              <p className="text-photo-navy/70 dark:text-photo-beige/70">
                Explore our selection of professional photographers and view their portfolios.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-photo-rust/20 dark:bg-photo-rust/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-photo-rust">2</span>
              </div>
              <h3 className="text-xl font-medium mb-2 text-photo-navy dark:text-photo-beige">Book a Session</h3>
              <p className="text-photo-navy/70 dark:text-photo-beige/70">
                Select a date and package that works for you and request a booking.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-photo-rust/20 dark:bg-photo-rust/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-photo-rust">3</span>
              </div>
              <h3 className="text-xl font-medium mb-2 text-photo-navy dark:text-photo-beige">Get Your Photos</h3>
              <p className="text-photo-navy/70 dark:text-photo-beige/70">
                After your session, receive professionally edited photos in your gallery.
              </p>
            </div>
          </div>
          <div className="text-center mt-12">
            <Link to="/how-it-works">
              <Button variant="outline" className="border-photo-rust text-photo-rust hover:bg-photo-rust/10 dark:text-photo-rust dark:hover:bg-photo-rust/20">
                Learn More About the Process
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white dark:bg-photo-darknavy">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold text-center mb-12 text-photo-navy dark:text-photo-beige">What Our Users Say</h2>
          
          {/* Full image testimonial cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="rounded-lg overflow-hidden border border-photo-navy/10 dark:border-photo-beige/10 shadow-md hover:shadow-lg transition-shadow">
              <img 
                src="/assets/images/testimonials/1.jpeg" 
                alt="Client testimonial" 
                className="w-full h-auto"
              />
            </div>
            <div className="rounded-lg overflow-hidden border border-photo-navy/10 dark:border-photo-beige/10 shadow-md hover:shadow-lg transition-shadow">
              <img 
                src="/assets/images/testimonials/2.jpeg" 
                alt="Client testimonial" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-photo-navy text-photo-beige">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-serif font-bold mb-4">Ready to Book Your Perfect Session?</h2>
          <p className="text-photo-beige/80 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied clients who have found their ideal photographers through SnapBook.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/photographers">
              <Button size="lg" className="bg-photo-beige text-photo-navy hover:bg-photo-beige/90">
                Find Your Photographer
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline" className="border-photo-beige text-accent hover:bg-photo-beige/10">
                Sign Up Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
