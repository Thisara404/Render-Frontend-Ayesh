import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import portfolioService from '@/services/portfolioService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PortfolioUploadFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  portfolioId?: string;
  initialStep?: number;
}

const PortfolioUploadForm: React.FC<PortfolioUploadFormProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  portfolioId,
  initialStep = 1 
}) => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [images, setImages] = useState<FileList | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [step, setStep] = useState<number>(initialStep);
  const [activePortfolioId, setActivePortfolioId] = useState<string>(portfolioId || '');

  useEffect(() => {
    // If initialStep or portfolioId changes, update state
    setStep(initialStep);
    if (portfolioId) {
      setActivePortfolioId(portfolioId);
    }
  }, [initialStep, portfolioId]);

  const categories = [
    'portrait', 'wedding', 'family', 'event', 
    'commercial', 'fashion', 'product', 
    'landscape', 'travel', 'corporate'
  ];

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setImages(null);
    setError('');
    setStep(1);
    setActivePortfolioId('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCreatePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // First, create the portfolio collection
      const portfolio = await portfolioService.createPortfolio({
        title,
        description,
        category,
        isPublished: true
      });

      setActivePortfolioId(portfolio._id);
      setStep(2);
      toast({
        title: "Collection Created",
        description: "Now you can upload images to your collection",
      });
    } catch (err) {
      console.error("Error creating portfolio:", err);
      setError(err instanceof Error ? err.message : 'Failed to create portfolio');
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to create portfolio',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadImages = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!images || images.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one image",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      
      // Append all images to formData
      Array.from(images).forEach(image => {
        formData.append('images', image);
      });

      // Upload images
      await portfolioService.uploadPortfolioImages(activePortfolioId, formData);

      toast({
        title: "Success",
        description: `${images.length} images uploaded successfully!`,
      });
      
      // If there's an onSuccess callback, call it
      if (onSuccess) {
        onSuccess();
      }
      
      // Close the dialog
      handleClose();
    } catch (err) {
      console.error("Error uploading images:", err);
      setError(err instanceof Error ? err.message : 'Failed to upload images');
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to upload images',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? 'Create New Portfolio Collection' : 'Upload Images'}
          </DialogTitle>
          <DialogDescription>
            {step === 1 
              ? 'Create a new collection to showcase your work' 
              : 'Select images to add to your new portfolio collection'}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <form onSubmit={handleCreatePortfolio} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Collection Title*</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Summer Wedding Collection"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category*</Label>
              <Select 
                value={category} 
                onValueChange={setCategory}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="capitalize">
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description about this collection..."
                rows={3}
              />
            </div>
            
            {error && <p className="text-sm text-red-500">{error}</p>}
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || !title || !category}
              >
                {isLoading ? 'Creating...' : 'Next'}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={handleUploadImages} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="images">Select Images*</Label>
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setImages(e.target.files)}
                required
                className="cursor-pointer"
              />
              <p className="text-sm text-gray-500 mt-1">
                You can select multiple images. Supported formats: JPEG, PNG, WebP
              </p>
            </div>
            
            {error && <p className="text-sm text-red-500">{error}</p>}
            
            <DialogFooter className="flex justify-between">
              {!portfolioId && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                >
                  Back
                </Button>
              )}
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading || !images || images.length === 0}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                      Uploading...
                    </div>
                  ) : 'Upload Images'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PortfolioUploadForm;