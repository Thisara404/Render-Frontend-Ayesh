import apiClient from './api.service';

const authService = {
  // Register a new user
  register: async (userData: any) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Login user
  login: async (email: string, password: string, role: string) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password, role });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return localStorage.getItem('token') !== null;
  },

  // Verify token is valid
  verifyToken: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Token verification error:', error);
      // Auto logout on token verification failure
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw error;
    }
  }
};

export default authService;