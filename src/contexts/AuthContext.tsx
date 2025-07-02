import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '@/services/auth.service';
import { toast } from '@/hooks/use-toast';

interface User {
  _id?: string;
  fullName?: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = () => {
      try {
        setLoading(true);
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Failed to load user from storage', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const redirectBasedOnRole = (role: string) => {
    switch (role) {
      case 'user':
        navigate('/bookings');
        break;
      case 'photographer':
        navigate('/dashboard');
        break;
      case 'admin':
        navigate('/admin');
        break;
      default:
        navigate('/');
    }
  };

  const login = async (email: string, password: string, role: string) => {
    try {
      setLoading(true);
      const response = await authService.login(email, password, role);
      
      // Set user in context and localStorage
      const userData = {
        email,
        role: response.role,
        id: response.userId
      };
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      toast({
        title: "Login Successful",
        description: `Welcome back! You are logged in as a ${response.role}.`,
      });
      
      // Redirect based on role
      redirectBasedOnRole(response.role);
      return response;
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      
      // Set user in context and localStorage
      const newUser = {
        fullName: userData.fullName,
        email: userData.email,
        role: response.role,
        id: response.userId
      };
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      
      toast({
        title: "Registration Successful",
        description: "Your account has been created successfully!",
      });
      
      // Redirect based on role
      redirectBasedOnRole(response.role);
      return response;
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Registration failed. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    navigate('/');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        login, 
        register, 
        logout, 
        isAuthenticated: !!user && !!localStorage.getItem('token')
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};