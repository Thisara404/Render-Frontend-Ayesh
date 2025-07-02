import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://render-backend-ayesh.onrender.com/api';

/**
 * Service for handling booking-related API requests
 */
class BookingService {
  /**
   * Create a new booking
   */
  async createBooking(bookingData) {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/bookings`, bookingData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  /**
   * Get user's bookings
   */
  async getUserBookings() {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/bookings/user`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  /**
   * Get photographer's bookings
   */
  async getPhotographerBookings() {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/bookings/photographer`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  /**
   * Get booking photos
   */
  async getBookingPhotos(bookingId) {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/bookings/${bookingId}/photos`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(bookingId, status) {
    const token = localStorage.getItem('token');
    const response = await axios.patch(`${API_URL}/bookings/${bookingId}/status`, { status }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  /**
   * Reschedule booking
   */
  async rescheduleBooking(bookingId, date, time) {
    const token = localStorage.getItem('token');
    const response = await axios.patch(`${API_URL}/bookings/${bookingId}/reschedule`, { date, time }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId) {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_URL}/bookings/${bookingId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
}

// Create an instance of the service
const bookingService = new BookingService();

export default bookingService;