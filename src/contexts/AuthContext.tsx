import React, { createContext, useState, useContext, useEffect } from 'react';

// Types
export type UserRole = 'manager' | 'stockist' | 'deliverer' | 'customer';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkRole: (role: UserRole) => boolean;
}

// Default context value
const defaultAuthContext: AuthContextType = {
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  checkRole: () => false,
};

// Create context
const AuthContext = createContext<AuthContextType>(defaultAuthContext);

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Simulate API call to check authentication status
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Simulate API call for authentication
      // In a real application, this would be a fetch call to your backend
      const response = await new Promise<User>((resolve) => {
        setTimeout(() => {
          // Mock users for testing different roles
          const mockUsers = [
            { id: 1, name: 'Manager User', email: 'manager@example.com', password: 'password', role: 'manager' as UserRole },
            { id: 2, name: 'Stockist User', email: 'stockist@example.com', password: 'password', role: 'stockist' as UserRole },
            { id: 3, name: 'Deliverer User', email: 'deliverer@example.com', password: 'password', role: 'deliverer' as UserRole },
          ];
          
          const user = mockUsers.find(u => u.email === email && u.password === password);
          
          if (user) {
            // Remove password before storing in state
            const { password, ...userData } = user;
            resolve(userData as User);
          } else {
            throw new Error('Invalid credentials');
          }
        }, 500);
      });
      
      // Store user in state and localStorage
      setUser(response);
      localStorage.setItem('user', JSON.stringify(response));
      
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Check if user has required role
  const checkRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  // Context value
  const value = {
    user,
    loading,
    login,
    logout,
    checkRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};