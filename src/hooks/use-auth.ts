import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  token?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }, []);
  
  const login = (userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };
  
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };
  
  return {
    user,
    login,
    logout,
    isAuthenticated: !!user
  };
};