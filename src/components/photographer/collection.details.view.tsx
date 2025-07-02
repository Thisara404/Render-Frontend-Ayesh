import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { photographerService } from "@/services/photographer.service";

interface CollectionDetailsViewProps {
  collectionId: number;
  isOpen: boolean;
  onClose: () => void;
  onAddPhotos: () => void;
}

const CollectionDetailsView: React.FC<CollectionDetailsViewProps> = ({
  collectionId,
  isOpen,
  onClose,
  onAddPhotos
}) => {
  const [collection, setCollection] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && collectionId) {
      fetchCollectionDetails();
    }
  }, [isOpen, collectionId]);

  const fetchCollectionDetails = async () => {
    setIsLoading(true);
    try {
      // For demo purposes, create mock data based on ID
      // Replace with actual API call when ready
      const mockCollection = {
        id: collectionId,
        title: `Collection ${collectionId}`,
        description: "Beautiful collection of photographs",
        coverImage: "https://images.unsplash.com/photo-1581299894007-aaa50297cf16",
        createdAt: new Date().toISOString(),
        photoCount: Math.floor(Math.random() * 20) + 5
      };
      
      const mockPhotos = Array(mockCollection.photoCount).fill(0).map((_, index) => ({
        id: index + 1,
        url: `https://source.unsplash.com/random/800x600?sig=${index + collectionId * 100}`,
        title: `Photo ${index + 1}`,
        uploadedAt: new Date().toISOString()
      }));

      // When API is ready:
      // const collectionResponse = await photographerService.getCollection(collectionId);
      // const photosResponse = await photographerService.getCollectionPhotos(collectionId);
      // setCollection(collectionResponse.data);
      // setPhotos(photosResponse.data);
      
      setCollection(mockCollection);
      setPhotos(mockPhotos);
    } catch (error) {
      console.error("Failed to fetch collection details:", error);
      toast({
        title: "Error",
        description: "Failed to load collection details",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    if (!confirm("Are you sure you want to delete this photo?")) return;
    
    try {
      // When API is ready:
      // await photographerService.deletePhoto(photoId);
      
      setPhotos(photos.filter(photo => photo.id !== photoId));
      toast({
        title: "Photo Deleted",
        description: "The photo has been removed from this collection"
      });
    } catch (error) {
      console.error("Failed to delete photo:", error);
      toast({
        title: "Error",
        description: "Failed to delete photo",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[90vw]">
        <DialogHeader>
          <DialogTitle>{collection?.title || "Collection Details"}</DialogTitle>
          <DialogDescription>
            {collection?.description || "Loading collection details..."}
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-500">
                {photos.length} photos in this collection
              </p>
              <Button onClick={onAddPhotos}>
                Add More Photos
              </Button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="group relative aspect-square rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex flex-col justify-center items-center opacity-0 group-hover:opacity-100">
                    <Button
                      variant="secondary"
                      className="mb-2"
                      size="sm"
                      onClick={() => window.open(photo.url, '_blank')}
                    >
                      View
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeletePhoto(photo.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {photos.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No photos in this collection yet</p>
                <Button onClick={onAddPhotos}>
                  Add Photos
                </Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CollectionDetailsView;