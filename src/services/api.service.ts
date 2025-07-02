import axios from 'axios';

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: 'https://render-backend-ayesh.onrender.com/api', // This is your backend URL
  withCredentials: false, // Set to true if using cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor for adding token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Response error:', error?.response?.data || error.message);
    
    // Handle unauthorized errors
    if (error.response && error.response.status === 401) {
      // Consider logging out the user here
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;