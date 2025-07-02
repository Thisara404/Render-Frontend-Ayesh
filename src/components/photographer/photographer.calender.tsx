import React from "react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BookingType {
  id: number;
  client: string;
  date: string;
  time: string;
  type: string;
  status: string;
  location?: string;
  notes?: string;
  contactInfo?: string;
}

interface PhotographerCalendarProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  bookings: BookingType[];
  onSelectBooking: (bookingId: number) => void;
  onBlockDate: () => void;
  onSetAvailable: () => void;
}

const PhotographerCalendar: React.FC<PhotographerCalendarProps> = ({
  date,
  setDate,
  bookings,
  onSelectBooking,
  onBlockDate,
  onSetAvailable
}) => {
  // Filter bookings for the selected date
  const selectedDateBookings = bookings.filter(booking => 
    booking.date === format(date || new Date(), 'yyyy-MM-dd')
  );

  const getStatusBadgeColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'confirmed':
        return "bg-green-500 text-white";
      case 'pending':
        return "bg-yellow-500 text-white";
      case 'cancelled':
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Availability Calendar</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Availability Calendar</CardTitle>
              <CardDescription>
                Manage your available dates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border pointer-events-auto"
              />
              <div className="flex gap-2 mt-4">
                <Button variant="outline" className="flex-1" onClick={onBlockDate}>Block Date</Button>
                <Button className="flex-1" onClick={onSetAvailable}>Set Available</Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="col-span-1 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {date ? format(date, 'MMMM d, yyyy') : 'Select a date'}
              </CardTitle>
              <CardDescription>
                {selectedDateBookings.length > 0 
                  ? `${selectedDateBookings.length} bookings on this date`
                  : 'No bookings for this date'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDateBookings.length > 0 ? (
                <div className="space-y-4">
                  {selectedDateBookings.map(booking => (
                    <div key={booking.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold">{booking.client}</h3>
                        <Badge className={getStatusBadgeColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500 space-y-1">
                        <div className="flex">
                          <span className="w-24">Time:</span>
                          <span>{booking.time}</span>
                        </div>
                        <div className="flex">
                          <span className="w-24">Type:</span>
                          <span>{booking.type}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button variant="outline" size="sm">Contact Client</Button>
                        <Button 
                          size="sm"
                          onClick={() => onSelectBooking(booking.id)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-2 text-gray-500">No bookings scheduled for this date</p>
                  <Button className="mt-4">Set As Available</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PhotographerCalendar;