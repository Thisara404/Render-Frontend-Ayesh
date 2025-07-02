import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import  photographerService  from "@/services/photographer.service";

interface NewCollectionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (collection: any) => void;
}

const NewCollectionForm: React.FC<NewCollectionFormProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a collection title",
        variant: "destructive"
      });
      return;
    }
    
    if (!coverPhoto) {
      toast({
        title: "Error",
        description: "Please select a cover photo",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("coverPhoto", coverPhoto);
      
      const response = await photographerService.createCollection(formData);
      
      toast({
        title: "Collection Created",
        description: "Your new collection has been created successfully."
      });
      
      if (onSuccess && response.data) {
        onSuccess(response.data);
      }
      
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error creating collection:", error);
      toast({
        title: "Error",
        description: "Failed to create collection. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCoverPhoto(null);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Cover photo must be less than 5MB",
          variant: "destructive"
        });
        return;
      }
      setCoverPhoto(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Collection</DialogTitle>
          <DialogDescription>
            Create a new collection to organize your photographs.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Collection Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summer Wedding Collection"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A collection of summer wedding photographs..."
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="coverPhoto">Cover Photo</Label>
            <Input
              id="coverPhoto"
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              required
              className="cursor-pointer"
            />
            <p className="text-xs text-gray-500">
              Upload a cover image for your collection. Max size: 5MB.
            </p>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                  Creating...
                </div>
              ) : (
                "Create Collection"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewCollectionForm;