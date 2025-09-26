import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User } from '../types';
import { MOCK_CURRENT_USER } from '../constants';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string) => void;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const login = (username: string) => {
    if (username === 'admin') {
      const adminUser: User = { id: 'admin-user', name: 'Admin', avatar: 'A', location: 'Control Room', isVerified: true };
      setUser(adminUser);
      setIsAdmin(true);
    } else {
      // For any other user, log them in as a mock user.
      // A real app would fetch user data from a backend.
      setUser(MOCK_CURRENT_USER);
      setIsAdmin(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
  };
  
  const updateUser = (updatedData: Partial<User>) => {
    setUser(currentUser => currentUser ? { ...currentUser, ...updatedData } : null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isAdmin, login, logout, updateUser }}>
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