import { API_BASE_URL } from './api';

export interface PortfolioImage {
  _id?: string;
  url: string;
  caption?: string;
  isFeatured: boolean;
  uploadDate?: string;
}

export interface Portfolio {
  _id: string;
  photographer: string;
  title: string;
  description?: string;
  images: PortfolioImage[];
  category: string;
  isPublished: boolean;
  views: number;
  createdAt: string;
}

class PortfolioService {
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getPhotographerPortfolios(): Promise<Portfolio[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/portfolio`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch portfolios');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      throw error;
    }
  }

  async getPublicPortfolios(photographerId: string): Promise<Portfolio[]> {
    try {
      console.log(`Fetching portfolios for photographer: ${photographerId}`);
      const response = await fetch(`${API_BASE_URL}/portfolio/photographer/${photographerId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch public portfolios');
      }

      const data = await response.json();
      console.log('Portfolio data received:', data);
      
      // Process image URLs to ensure they have the full path
      const portfolios = data.data || [];
      return portfolios;
    } catch (error) {
      console.error(`Error fetching public portfolios for ${photographerId}:`, error);
      throw error;
    }
  }

  async createPortfolio(portfolioData: Partial<Portfolio>): Promise<Portfolio> {
    try {
      const response = await fetch(`${API_BASE_URL}/portfolio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify(portfolioData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create portfolio');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error creating portfolio:', error);
      throw error;
    }
  }

  async uploadPortfolioImages(portfolioId: string, formData: FormData): Promise<Portfolio> {
    try {
      // For uploading files, don't set Content-Type header
      const headers: HeadersInit = {};
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/portfolio/${portfolioId}/images`, {
        method: 'POST',
        headers,
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload images');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    }
  }

  async deleteImage(portfolioId: string, imageId: string): Promise<Portfolio> {
    try {
      const response = await fetch(`${API_BASE_URL}/portfolio/${portfolioId}/images/${imageId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete image');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }
  
  // Refactor getFullImageUrl so it's more accessible across components
  getFullImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // For local development, prepend the API URL
    const apiUrl = import.meta.env.VITE_API_URL || 'https://render-backend-ayesh.onrender.com/api';
    const baseUrl = apiUrl.replace('/api', ''); // Remove '/api' since we need the base server URL
    return `${baseUrl}${imagePath}`;
  }
}

export default new PortfolioService();