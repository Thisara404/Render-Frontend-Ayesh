import { API_BASE_URL } from './api';

export interface UserData {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface PhotographerData extends UserData {
  specialty?: string;
  bookings?: number;
  rating?: number;
}

class AdminService {
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getUsers(): Promise<UserData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch users');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async getPhotographers(): Promise<PhotographerData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/photographers`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch photographers');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching photographers:', error);
      throw error;
    }
  }
}

export default new AdminService();