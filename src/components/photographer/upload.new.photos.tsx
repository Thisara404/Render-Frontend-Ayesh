import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface UploadPhotoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload?: (data: FormData) => Promise<void>;
  collections?: { id: number; title: string }[];
}

const UploadPhotoForm: React.FC<UploadPhotoFormProps> = ({ 
  isOpen, 
  onClose,
  onUpload,
  collections = []
}) => {
  const [photos, setPhotos] = useState<FileList | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [collectionId, setCollectionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photos || photos.length === 0) {
      toast({
        title: "No photos selected",
        description: "Please select at least one photo to upload",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      if (collectionId) {
        formData.append("collectionId", collectionId);
      }

      // Append all selected photos
      for (let i = 0; i < photos.length; i++) {
        formData.append("photos", photos[i]);
      }

      if (onUpload) {
        await onUpload(formData);
      }

      toast({
        title: "Photos Uploaded Successfully",
        description: "Your photos have been uploaded to your portfolio."
      });
      
      // Reset form and close dialog
      resetForm();
      onClose();
    } catch (error) {
      console.error("Failed to upload photos:", error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your photos. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setPhotos(null);
    setTitle("");
    setDescription("");
    setCollectionId("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload New Photos</DialogTitle>
          <DialogDescription>
            Add new photos to your portfolio. You can select multiple files.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summer Wedding Session"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description about these photos..."
              rows={3}
            />
          </div>
          
          {collections.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="collection">Add to Collection</Label>
              <select 
                id="collection" 
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={collectionId}
                onChange={(e) => setCollectionId(e.target.value)}
              >
                <option value="">-- Select a Collection --</option>
                {collections.map(collection => (
                  <option key={collection.id} value={collection.id.toString()}>
                    {collection.title}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="photos">Select Photos</Label>
            <Input
              id="photos"
              type="file"
              multiple
              onChange={(e) => setPhotos(e.target.files)}
              accept="image/*"
              required
              className="cursor-pointer"
            />
            <p className="text-sm text-gray-500">
              Supported formats: JPG, PNG, WebP. Max 10MB per image.
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
                  Uploading...
                </div>
              ) : (
                "Upload Photos"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadPhotoForm;