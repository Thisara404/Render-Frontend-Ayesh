import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import bookingService from "@/services/booking.service";

// Mock gallery images for fallback
const mockGalleryImages = [
  { id: 1, url: "https://images.unsplash.com/photo-1581299894007-aaa50297cf16?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", title: "Wedding Photo 1" },
  { id: 2, url: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", title: "Wedding Photo 2" },
  { id: 3, url: "https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", title: "Wedding Photo 3" },
  { id: 4, url: "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", title: "Wedding Photo 4" },
  { id: 5, url: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", title: "Wedding Photo 5" },
  { id: 6, url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", title: "Wedding Photo 6" },
];

interface ViewPhotosGalleryProps {
  bookingId: number;
  isOpen: boolean;
  onClose: () => void;
}

const ViewPhotosGallery: React.FC<ViewPhotosGalleryProps> = ({ 
  bookingId, 
  isOpen, 
  onClose 
}) => {
  const { toast } = useToast();
  const [images, setImages] = useState<any[]>(mockGalleryImages);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 9;

  useEffect(() => {
    if (isOpen && bookingId) {
      loadBookingPhotos();
    }
  }, [isOpen, bookingId]);
  
  const loadBookingPhotos = async () => {
    setLoading(true);
    try {
      const response = await bookingService.getBookingPhotos(bookingId.toString());
      if (response && response.data && response.data.length > 0) {
        setImages(response.data);
      } else {
        // If no photos are returned, keep using mock data but inform the user
        toast({
          title: "Using Sample Photos",
          description: "No photos have been uploaded for this booking yet. Showing sample images.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Error loading booking photos:", error);
      toast({
        title: "Error Loading Photos",
        description: "Could not load booking photos. Showing sample images instead.",
        variant: "destructive"
      });
      // Keep mock data as fallback
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate pagination
  const totalPages = Math.ceil(images.length / imagesPerPage);
  const currentImages = images.slice(
    (currentPage - 1) * imagesPerPage,
    currentPage * imagesPerPage
  );
  
  const handleDownload = (url: string, title: string) => {
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title || 'photo'}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const openFullImage = (url: string) => {
    setActiveImage(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[90vw]">
        <DialogHeader>
          <DialogTitle>Booking Photos</DialogTitle>
          <DialogDescription>
            View and download photos from this booking
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
          </div>
        ) : activeImage ? (
          <div className="flex flex-col items-center">
            <div className="relative w-full h-[60vh] bg-black flex items-center justify-center">
              <img
                src={activeImage}
                alt="Full Size"
                className="max-h-full max-w-full object-contain"
              />
              <Button
                onClick={() => setActiveImage(null)}
                className="absolute top-4 right-4"
                variant="secondary"
                size="sm"
              >
                Close
              </Button>
              <Button
                onClick={() => handleDownload(activeImage, "Photo")}
                className="absolute bottom-4 right-4"
                size="sm"
              >
                Download
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {currentImages.map((image) => (
                <div key={image.id} className="group relative aspect-square rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex flex-col justify-center items-center opacity-0 group-hover:opacity-100">
                    <Button
                      variant="secondary"
                      className="mb-2"
                      size="sm"
                      onClick={() => openFullImage(image.url)}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDownload(image.url, image.title)}
                    >
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-4 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                <div className="flex items-center px-4">
                  Page {currentPage} of {totalPages}
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
            
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={() => window.print()}>
                Print Photos
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewPhotosGallery;
