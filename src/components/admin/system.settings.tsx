import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import AdminAddNewForm from "@/components/AdminAddNewForm";

const SystemSettings = () => {
  const [emailNotifications, setEmailNotifications] = useState("enabled");
  const [smsNotifications, setSmsNotifications] = useState("enabled");
  const [categories, setCategories] = useState([
    "Portrait", "Wedding", "Event", "Nature", "Commercial"
  ]);
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  
  const handleSaveSettings = () => {
    // In a real application, you'd call an API to save these settings
    toast({
      title: "Settings Saved",
      description: "Your system settings have been updated successfully.",
    });
  };
  
  const handleRemoveCategory = (categoryToRemove: string) => {
    setCategories(categories.filter(category => category !== categoryToRemove));
  };
  
  // This function would be called from the AdminAddNewForm when a new category is added
  const handleAddCategory = (newCategory: string) => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
          <CardDescription>
            Configure global system settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Notification Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <Select 
                  value={emailNotifications} 
                  onValueChange={setEmailNotifications}
                >
                  <SelectTrigger id="email-notifications">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enabled">Enabled</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sms-notifications">SMS Notifications</Label>
                <Select 
                  value={smsNotifications} 
                  onValueChange={setSmsNotifications}
                >
                  <SelectTrigger id="sms-notifications">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enabled">Enabled</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Photography Categories</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAddCategoryForm(true)}
              >
                Add Category
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {categories.map(category => (
                <Badge 
                  key={category} 
                  className="bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  {category}
                  <button 
                    className="ml-2 text-gray-600 hover:text-gray-800"
                    onClick={() => handleRemoveCategory(category)}
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="pt-4">
            <Button onClick={handleSaveSettings}>Save Settings</Button>
          </div>
        </CardContent>
      </Card>
      
      <AdminAddNewForm 
        type="category" 
        isOpen={showAddCategoryForm} 
        onClose={() => setShowAddCategoryForm(false)} 
      />
    </>
  );
};

export default SystemSettings;