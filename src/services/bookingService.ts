import { API_BASE_URL } from './api';

export interface BookingData {
  _id?: string;
  photographer: string;
  package: string;
  date: string;
  timeSlot: string;
  location: string;
  totalPrice: number;
  notes?: string;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  status?: string;
  paymentStatus?: string;
  createdAt?: string;
}

class BookingService {
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async createBooking(bookingData: Partial<BookingData>): Promise<BookingData> {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create booking');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  async getUserBookings(): Promise<BookingData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/user`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch user bookings');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      throw error;
    }
  }

  async getPhotographerBookings(): Promise<BookingData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/photographer`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch photographer bookings');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching photographer bookings:', error);
      throw error;
    }
  }

  async updateBookingStatus(bookingId: string, status: string): Promise<BookingData> {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update booking status');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  }

  async cancelBooking(bookingId: string): Promise<BookingData> {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to cancel booking');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }

  async getAllBookings(): Promise<BookingData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch all bookings');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching all bookings:', error);
      throw error;
    }
  }
}

export default new BookingService();