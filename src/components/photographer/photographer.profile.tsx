import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ProfileType {
  name: string;
  specialty: string;
  location: string;
  experience: string;
  bio: string;
  equipment: string;
  pricing: {
    hourly: string;
    wedding: string;
    event: string;
  };
  availability: {
    weekdays: string;
    weekends: string;
  };
}

interface PhotographerProfileProps {
  profile: ProfileType;
  onUpdateProfile: (profile: ProfileType) => Promise<void>;
  onChangeProfilePhoto: () => void;
}

const PhotographerProfile: React.FC<PhotographerProfileProps> = ({
  profile,
  onUpdateProfile,
  onChangeProfilePhoto
}) => {
  const [formState, setFormState] = useState<ProfileType>(profile);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    const fields = field.split('.');
    
    if (fields.length === 1) {
      setFormState(prev => ({
        ...prev,
        [field]: value
      }));
    } else {
      // Handle nested fields like pricing.hourly
      setFormState(prev => ({
        ...prev,
        [fields[0]]: {
          ...prev[fields[0] as keyof ProfileType],
          [fields[1]]: value
        }
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onUpdateProfile(formState);
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Photographer Profile</CardTitle>
        <CardDescription>
          Update your professional information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3">
              <div className="h-64 bg-gray-200 rounded-md flex items-center justify-center">
                {/* Profile image can go here */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="mt-4 flex justify-center">
                <Button type="button" onClick={onChangeProfilePhoto}>Change Profile Photo</Button>
              </div>
            </div>
            <div className="w-full md:w-2/3 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formState.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialty">Specialty</Label>
                  <Input
                    id="specialty"
                    value={formState.specialty}
                    onChange={(e) => handleInputChange('specialty', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formState.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience</Label>
                  <Input
                    id="experience"
                    value={formState.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio/About</Label>
                <Textarea
                  id="bio"
                  value={formState.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="equipment">Equipment</Label>
                <Textarea
                  id="equipment"
                  value={formState.equipment}
                  onChange={(e) => handleInputChange('equipment', e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Pricing Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hourly-rate">Hourly Rate</Label>
                <Input
                  id="hourly-rate"
                  value={formState.pricing.hourly}
                  onChange={(e) => handleInputChange('pricing.hourly', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wedding-package">Wedding Package</Label>
                <Input
                  id="wedding-package"
                  value={formState.pricing.wedding}
                  onChange={(e) => handleInputChange('pricing.wedding', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-rate">Event Rate</Label>
                <Input
                  id="event-rate"
                  value={formState.pricing.event}
                  onChange={(e) => handleInputChange('pricing.event', e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Availability</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weekdays">Weekdays</Label>
                <Input
                  id="weekdays"
                  value={formState.availability.weekdays}
                  onChange={(e) => handleInputChange('availability.weekdays', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weekends">Weekends</Label>
                <Input
                  id="weekends"
                  value={formState.availability.weekends}
                  onChange={(e) => handleInputChange('availability.weekends', e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PhotographerProfile;