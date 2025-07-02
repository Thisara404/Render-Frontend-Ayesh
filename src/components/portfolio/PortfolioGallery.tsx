import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Star, Trash2, Edit } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Portfolio, PortfolioImage } from "@/services/portfolioService";
import portfolioService from '@/services/portfolioService';

interface PortfolioGalleryProps {
  portfolio: Portfolio;
  onRefresh: () => void;
}

const PortfolioGallery: React.FC<PortfolioGalleryProps> = ({ portfolio, onRefresh }) => {
  const [loading, setLoading] = useState<boolean>(false);
  
  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) {
      return;
    }
    
    setLoading(true);
    try {
      await portfolioService.deleteImage(portfolio._id, imageId);
      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
      onRefresh();
    } catch (err) {
      console.error("Error deleting image:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to delete image',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Get the base URL for image paths
  const getFullImageUrl = (imagePath: string) => {
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // For local development, prepend the API URL
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.replace('/api', ''); // Remove '/api' since we need the base server URL
    return `${baseUrl}${imagePath}`;
  };

  if (portfolio.images.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed rounded-md">
        <p className="text-gray-500">No images in this collection yet.</p>
        <p className="text-sm text-gray-400 mt-1">Upload images to showcase your work.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {portfolio.images.map((image: PortfolioImage) => (
        <Card key={image._id} className="overflow-hidden group relative">
          <div className="aspect-square overflow-hidden">
            <img 
              src={getFullImageUrl(image.url)} 
              alt={image.caption || portfolio.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <CardContent className="p-3">
            <div className="flex justify-between items-center">
              <p className="text-sm truncate">
                {image.caption || "No caption"}
              </p>
              <div className="flex space-x-1 invisible group-hover:visible">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDeleteImage(image._id as string)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      <span>Edit Caption</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Star className="h-4 w-4 mr-2" />
                      <span>Mark as Featured</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
          {image.isFeatured && (
            <Badge className="absolute top-2 right-2 bg-yellow-500">
              Featured
            </Badge>
          )}
        </Card>
      ))}
    </div>
  );
};

export default PortfolioGallery;