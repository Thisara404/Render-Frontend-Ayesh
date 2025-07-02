import { API_BASE_URL } from './api';

export interface PackageInclusion {
  item: string;
}

export interface Package {
  _id: string;
  photographer: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  includes: string[];
  isActive: boolean;
  createdAt: string;
}

class PackageService {
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getPhotographerPackages(): Promise<Package[]> {
    try {
      console.log("Making API request to fetch photographer packages");
      const response = await fetch(`${API_BASE_URL}/packages`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch packages');
      }

      const data = await response.json();
      console.log("API response for packages:", data);
      return data.data || [];
    } catch (error) {
      console.error('Error fetching packages:', error);
      throw error;
    }
  }

  async getPublicPackages(photographerId: string): Promise<Package[]> {
    try {
      console.log(`Making API request to fetch public packages for photographer ${photographerId}`);
      const response = await fetch(`${API_BASE_URL}/packages/photographer/${photographerId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch packages');
      }

      const data = await response.json();
      console.log("API response for public packages:", data);
      return data.data || [];
    } catch (error) {
      console.error('Error fetching packages:', error);
      throw error;
    }
  }

  async createPackage(packageData: Partial<Package>): Promise<Package> {
    try {
      console.log("Making API request to create package:", packageData);
      const response = await fetch(`${API_BASE_URL}/packages`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(packageData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create package');
      }

      const data = await response.json();
      console.log("API response for package creation:", data);
      return data.data;
    } catch (error) {
      console.error('Error creating package:', error);
      throw error;
    }
  }

  async updatePackage(packageId: string, packageData: Partial<Package>): Promise<Package> {
    try {
      console.log(`Making API request to update package ${packageId}:`, packageData);
      const response = await fetch(`${API_BASE_URL}/packages/${packageId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(packageData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update package');
      }

      const data = await response.json();
      console.log("API response for package update:", data);
      return data.data;
    } catch (error) {
      console.error('Error updating package:', error);
      throw error;
    }
  }

  async deletePackage(packageId: string): Promise<void> {
    try {
      console.log(`Making API request to delete package ${packageId}`);
      const response = await fetch(`${API_BASE_URL}/packages/${packageId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete package');
      }
      
      console.log("Package deleted successfully");
    } catch (error) {
      console.error('Error deleting package:', error);
      throw error;
    }
  }
}

export default new PackageService();