import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Service for handling photographer-related API requests
 */
class PhotographerService {
  // Add this helper method to get full image URL
  getFullImageUrl(imagePath: string | undefined, defaultImage: string): string {
    if (!imagePath) return defaultImage;
    if (imagePath.startsWith('http')) return imagePath;
    
    // For local development, prepend the API URL
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiBaseUrl.replace('/api', ''); // Remove '/api' to get the server root
    return `${baseUrl}${imagePath}`;
  }

  /**
   * Get all photographers
   */
  async getAllPhotographers() {
    try {
      const defaultImage = "https://images.unsplash.com/photo-1568602471122-7832951cc4c5";
      const response = await axios.get(`${API_URL}/photographers`);
      
      if (response.data && response.data.data) {
        // Transform the data to include full image URLs
        response.data.data = response.data.data.map((photographer: any) => ({
          ...photographer,
          image: this.getFullImageUrl(photographer.profileImage, defaultImage)
        }));
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get photographer by ID
   */
  async getPhotographerById(id: string) {
    try {
      const response = await axios.get(`${API_URL}/photographers/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get photographer portfolio
   */
  async getPhotographerPortfolio(photographerId) {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/photographers/${photographerId}/portfolio`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  /**
   * Create new portfolio collection
   */
  async createCollection(collectionData) {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/photographers/collections`, collectionData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  /**
   * Update portfolio collection
   */
  async updateCollection(collectionId, collectionData) {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/photographers/collections/${collectionId}`, collectionData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  /**
   * Delete portfolio collection
   */
  async deleteCollection(collectionId) {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_URL}/photographers/collections/${collectionId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  /**
   * Upload photo to collection
   */
  async uploadPhoto(collectionId, photoData) {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/photographers/collections/${collectionId}/photos`, photoData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  /**
   * Update photographer profile
   */
  async updateProfile(profileData) {
    const token = localStorage.getItem('token');
    // Change the endpoint from /photographer/profile to /photographers/profile
    const response = await axios.put(`${API_URL}/photographers/profile`, profileData, {
      headers: { 
        Authorization: `Bearer ${token}`
        // Remove Content-Type header to let axios set it automatically for FormData
      }
    });
    return response.data;
  }

  /**
   * Update availability
   */
  async updateAvailability(availabilityData) {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/photographers/availability`, availabilityData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  /**
   * Search photographers by criteria
   */
  async searchPhotographers(searchParams) {
    const response = await axios.get(`${API_URL}/photographers/search`, {
      params: searchParams
    });
    return response.data;
  }
}

// Create an instance of the service
const photographerService = new PhotographerService();

export default photographerService;