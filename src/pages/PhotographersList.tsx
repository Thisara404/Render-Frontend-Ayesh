import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { API_BASE_URL } from '@/services/api';
import axios from 'axios';
import photographerService from "@/services/photographer.service";

// Update the interface to include profileImage
interface Photographer {
  _id: string;
  fullName: string;
  specialty?: string;
  profileImage?: string; // Add this field
  image?: string;
  rating?: number;
  price?: number;
  categories?: string[];
  location?: string;
  description?: string;
  portfolioPreview?: { url: string }[];
}

const PhotographersList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([50, 300]);
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Get category from URL if present
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategories([categoryParam]);
    }
  }, [searchParams]);

  // Fetch categories from the backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/categories`);
        if (response.data && response.data.categories && Array.isArray(response.data.categories)) {
          setAllCategories(response.data.categories.map((cat: any) => cat.name.toLowerCase()));
        } else {
          setAllCategories([
            "portrait", "wedding", "family", "event", "commercial", 
            "fashion", "product", "landscape", "travel", "corporate"
          ]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to default categories
        setAllCategories([
          "portrait", "wedding", "family", "event", "commercial", 
          "fashion", "product", "landscape", "travel", "corporate"
        ]);
      }
    };
    
    fetchCategories();
  }, []);

  // Fetch photographers from API
  useEffect(() => {
    const fetchPhotographers = async () => {
      setLoading(true);
      try {
        const response = await photographerService.getAllPhotographers();
        
        if (response.success && response.data) {
          // Response data already has full image URLs from the service
          setPhotographers(response.data);
        } else {
          toast({
            title: "Error",
            description: "Failed to load photographers. Invalid response format.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error fetching photographers:', error);
        toast({
          title: "Error",
          description: "Failed to load photographers. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPhotographers();
  }, [selectedCategories, priceRange, searchTerm, toast]);
  
  // Filter photographers based on client-side filters
  // This is a fallback if the backend filtering isn't working properly
  const filteredPhotographers = photographers.filter(photographer => {
    // Filter by search term if not already filtered by backend
    const searchMatch = !searchTerm || 
      photographer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (photographer.specialty && photographer.specialty.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (photographer.location && photographer.location.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by categories if not already filtered by backend
    // Include photographers with no categories when filtering
    const categoryMatch = 
      selectedCategories.length === 0 || 
      !photographer.categories || 
      photographer.categories.length === 0 ||
      (photographer.categories && photographer.categories.some(cat => 
        selectedCategories.includes(cat.toLowerCase())
      ));
    
    // Filter by price range if not already filtered by backend
    const priceMatch = !photographer.price || 
      (photographer.price >= priceRange[0] && photographer.price <= priceRange[1]);
    
    return searchMatch && categoryMatch && priceMatch;
  });

  // Handle category selection
  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, category]);
    } else {
      setSelectedCategories(prev => prev.filter(cat => cat !== category));
    }
    
    // Update URL search params
    const newParams = new URLSearchParams(searchParams);
    if (checked) {
      newParams.set('category', category);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  // Handle search input change with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Default image for photographers without a profile image
  const defaultImage = "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

  // Helper function to get full image URL
  const getFullImageUrl = (imagePath: string): string => {
    if (!imagePath) return defaultImage;
    if (imagePath.startsWith('http')) return imagePath;
    
    // For local development, prepend the API URL
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiBaseUrl.replace('/api', ''); // Remove '/api' to get the server root
    return `${baseUrl}${imagePath}`;
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setPriceRange([50, 300]);
    setSearchParams({});
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow bg-photo-beige dark:bg-photo-darknavy">
        {/* Hero Section */}
        <section className="bg-photo-navy text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-serif font-bold mb-4">
              Find Your Perfect Photographer
            </h1>
            <p className="max-w-2xl text-photo-beige">
              Browse through our curated list of professional photographers. 
              Filter by specialty, price, and location to find the right match for your needs.
            </p>
          </div>
        </section>
        
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="w-full lg:w-64 shrink-0">
              <div className="bg-white dark:bg-photo-navy p-6 rounded-lg shadow-sm border border-photo-navy/10 dark:border-photo-beige/10">
                <h2 className="font-medium text-lg mb-4 text-photo-navy dark:text-photo-beige">Filters</h2>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-photo-navy dark:text-photo-beige mb-2">
                    Search
                  </label>
                  <Input 
                    type="text" 
                    placeholder="Search photographers..." 
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-photo-navy dark:text-photo-beige mb-2">
                    Categories
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {allCategories.map((category) => (
                      <div key={category} className="flex items-center">
                        <Checkbox 
                          id={`category-${category}`} 
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={(checked) => 
                            handleCategoryChange(category, checked === true)
                          }
                        />
                        <label 
                          htmlFor={`category-${category}`} 
                          className="ml-2 text-sm text-photo-navy dark:text-photo-beige capitalize"
                        >
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-photo-navy dark:text-photo-beige mb-4">
                    Price Range ($/hr)
                  </label>
                  <Slider
                    defaultValue={[priceRange[0], priceRange[1]]}
                    min={25}
                    max={500}
                    step={25}
                    minStepsBetweenThumbs={1}
                    onValueChange={(value) => setPriceRange(value)}
                    className="mb-4"
                  />
                  <div className="flex justify-between">
                    <span className="text-sm text-photo-navy/70 dark:text-photo-beige/70">${priceRange[0]}/hr</span>
                    <span className="text-sm text-photo-navy/70 dark:text-photo-beige/70">${priceRange[1]}/hr</span>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={clearAllFilters}
                  className="w-full border-photo-rust text-photo-rust hover:bg-photo-rust/10"
                >
                  Clear Filters
                </Button>
              </div>
            </aside>
            
            {/* Photographers Grid */}
            <div className="flex-grow">
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl font-serif font-bold text-photo-navy dark:text-photo-beige">
                  {loading 
                    ? "Loading photographers..." 
                    : `${filteredPhotographers.length} Photographers Available`
                  }
                </h2>
                <div className="text-sm text-photo-navy/70 dark:text-photo-beige/70">
                  Sort by: 
                  <select className="ml-2 bg-white dark:bg-photo-navy border border-photo-navy/20 dark:border-photo-beige/20 rounded-md px-2 py-1 text-photo-navy dark:text-photo-beige">
                    <option value="rating">Highest Rated</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
              </div>
              
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="overflow-hidden bg-white dark:bg-photo-navy">
                      <div className="aspect-[3/2] bg-gray-200 dark:bg-gray-700">
                        <Skeleton className="w-full h-full" />
                      </div>
                      <div className="p-6">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-4" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-2/3" />
                        <div className="flex mt-4">
                          <Skeleton className="h-8 w-12 rounded-full mr-2" />
                          <Skeleton className="h-8 w-12 rounded-full mr-2" />
                          <Skeleton className="h-8 w-12 rounded-full" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : filteredPhotographers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPhotographers.map((photographer) => (
                    <Link 
                      to={`/photographer/${photographer._id}`} 
                      key={photographer._id}
                      className="group rounded-xl overflow-hidden bg-white dark:bg-photo-navy border border-photo-navy/10 dark:border-photo-beige/10 hover:shadow-md transition-shadow"
                    >
                      <div className="aspect-[3/2] overflow-hidden">
                        <img 
                          src={photographer.image || photographer.profileImage || defaultImage} 
                          alt={photographer.fullName} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-serif text-xl font-medium text-photo-navy dark:text-photo-beige">{photographer.fullName}</h3>
                          <div className="flex items-center text-yellow-500">
                            <svg className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path>
                            </svg>
                            <span className="ml-1 text-sm font-medium">{photographer.rating || 4.5}</span>
                          </div>
                        </div>
                        <p className="text-photo-navy/70 dark:text-photo-beige/70 text-sm mb-1">{photographer.specialty}</p>
                        <p className="text-photo-navy/70 dark:text-photo-beige/70 text-sm mb-3">{photographer.location}</p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {photographer.categories && photographer.categories.slice(0, 3).map((category, index) => (
                            <span 
                              key={index}
                              className="bg-photo-beige dark:bg-photo-navy/40 text-photo-navy dark:text-photo-beige/80 text-xs px-2 py-1 rounded-full capitalize"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-photo-navy dark:text-photo-beige">${photographer.price || 150}/hr</span>
                          <span className="text-sm text-photo-rust">View Profile →</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white dark:bg-photo-navy rounded-lg border border-photo-navy/10 dark:border-photo-beige/10">
                  <h3 className="text-xl font-medium mb-2 text-photo-navy dark:text-photo-beige">No photographers found</h3>
                  <p className="text-photo-navy/70 dark:text-photo-beige/70 mb-6">
                    Try adjusting your filters or search criteria to find photographers.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={clearAllFilters}
                    className="border-photo-rust text-photo-rust hover:bg-photo-rust/10"
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PhotographersList;
