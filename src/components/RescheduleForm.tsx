import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import bookingService from "@/services/bookingService";

// Define available time slots
const timeSlots = [
  "9:00 AM - 11:00 AM",
  "11:00 AM - 1:00 PM",
  "1:00 PM - 3:00 PM",
  "3:00 PM - 5:00 PM",
  "5:00 PM - 7:00 PM"
];

interface RescheduleFormProps {
  bookingId: number;
  currentDate: string;
  currentTime: string;
  isOpen: boolean;
  onClose: () => void;
}

const RescheduleForm = ({ 
  bookingId, 
  currentDate, 
  currentTime,
  isOpen, 
  onClose 
}: RescheduleFormProps) => {
  // Convert the currentDate string to a Date object
  const initialDate = new Date(currentDate);
  
  const [date, setDate] = useState<Date | undefined>(initialDate);
  const [timeSlot, setTimeSlot] = useState(currentTime);
  const [isLoading, setIsLoading] = useState(false);

  // Disable past dates and next 2 days (assuming photographer needs notice)
  const disabledDays = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const twoDaysFromNow = new Date(today);
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    
    return date < twoDaysFromNow;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date) {
      toast({
        title: "Error",
        description: "Please select a date for rescheduling.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/bookings/${bookingId}/reschedule`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          date: formattedDate,
          timeSlot
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reschedule booking');
      }
      
      toast({
        title: "Booking Rescheduled",
        description: `Your booking has been rescheduled to ${format(date, 'MMMM d, yyyy')} at ${timeSlot}.`,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Reschedule Booking</DialogTitle>
          <DialogDescription>
            Select a new date and time for your booking #{bookingId}.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Current Booking</Label>
            <p className="text-sm">
              {format(initialDate, 'MMMM d, yyyy')} at {currentTime}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label>Select New Date</Label>
            <div className="border rounded-md p-3">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={disabledDays}
                className="pointer-events-auto"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="timeSlot">Select New Time</Label>
            <Select value={timeSlot} onValueChange={setTimeSlot}>
              <SelectTrigger id="timeSlot">
                <SelectValue placeholder="Select time slot" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="text-sm text-gray-500">
            <p>Note: Rescheduling is subject to photographer availability.</p>
            <p>You can reschedule up to 48 hours before your session without additional fees.</p>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                  Rescheduling...
                </div>
              ) : (
                "Reschedule Booking"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RescheduleForm;
