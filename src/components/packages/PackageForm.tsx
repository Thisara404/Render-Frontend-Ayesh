import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { X, Plus } from "lucide-react";
import packageService, { Package } from "@/services/packageService";

const packageSchema = z.object({
  name: z.string().min(1, { message: "Package name is required" }),
  description: z.string().min(1, { message: "Description is required" }).max(500, { message: "Description cannot exceed 500 characters" }),
  price: z.coerce.number().positive({ message: "Price must be greater than 0" }),
  duration: z.string().min(1, { message: "Duration is required" }),
  isActive: z.boolean().default(true),
  includes: z.array(z.string().min(1, { message: "Inclusion item cannot be empty" })).min(1, { message: "Add at least one inclusion" })
});

interface PackageFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  packageToEdit: Package | null;
}

const PackageForm: React.FC<PackageFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  packageToEdit,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [newInclusion, setNewInclusion] = useState("");

  const form = useForm<z.infer<typeof packageSchema>>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      duration: "",
      isActive: true,
      includes: [""]
    },
  });

  useEffect(() => {
    if (packageToEdit) {
      console.log("Setting form values with:", packageToEdit);
      form.reset({
        name: packageToEdit.name,
        description: packageToEdit.description,
        price: packageToEdit.price,
        duration: packageToEdit.duration,
        isActive: packageToEdit.isActive,
        includes: packageToEdit.includes
      });
    }
  }, [packageToEdit, form]);

  const handleAddInclusion = () => {
    if (!newInclusion.trim()) return;
    
    const currentIncludes = form.getValues("includes") || [];
    form.setValue("includes", [...currentIncludes, newInclusion]);
    setNewInclusion("");
  };

  const handleRemoveInclusion = (index: number) => {
    const currentIncludes = form.getValues("includes");
    currentIncludes.splice(index, 1);
    form.setValue("includes", [...currentIncludes]);
  };

  const handleFormSubmit = async (data: z.infer<typeof packageSchema>) => {
    setIsLoading(true);
    try {
      console.log("Submitting package data:", data);
      
      if (packageToEdit) {
        await packageService.updatePackage(packageToEdit._id, data);
        toast({
          title: "Success",
          description: "Package updated successfully",
        });
      } else {
        await packageService.createPackage(data);
        toast({
          title: "Success",
          description: "New package created successfully",
        });
      }
      onSubmit();
    } catch (error) {
      console.error("Error saving package:", error);
      toast({
        title: "Error",
        description: "Failed to save package. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {packageToEdit ? "Edit Package" : "Create New Package"}
          </DialogTitle>
          <DialogDescription>
            {packageToEdit
              ? "Update your photography package details"
              : "Create a new photography package for clients to book"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Package Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Basic Portrait Session" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what this package offers" 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        placeholder="99.99" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 2 hours" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>
                      Make this package available for booking
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div>
              <FormLabel>What's Included</FormLabel>
              <div className="flex gap-2 mt-1.5">
                <Input
                  value={newInclusion}
                  onChange={(e) => setNewInclusion(e.target.value)}
                  placeholder="e.g. 10 edited digital photos"
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  onClick={handleAddInclusion}
                  size="icon"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-3 space-y-2">
                {form.getValues("includes").map((item, index) => (
                  <div key={index} className="flex items-center justify-between rounded-md border px-3 py-2">
                    <span className="text-sm">{item}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveInclusion(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {form.formState.errors.includes && (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.includes.message}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : packageToEdit ? "Update Package" : "Create Package"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PackageForm;