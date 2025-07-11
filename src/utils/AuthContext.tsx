import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/api';

interface User {
  id: number;
  name: string;
  is_owner: boolean;
  tenant_id?: string;
  property_id?: string;
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (tenantId: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  registerOwner: (name: string, email: string, password: string) => Promise<void>;
  registerTenant: (name: string, rentAmount: number) => Promise<void>;
  mustChangePassword: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  useEffect(() => {
    loadStoredData();
  }, []);

  async function loadStoredData() {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading stored data:', error);
    } finally {
      setLoading(false);
    }
  }

  const signIn = async (tenantId: string, password: string) => {
    try {
      const response = await authService.login(tenantId, password);
      setUser(response.user);
      setMustChangePassword(!!response.must_change_password);
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  const registerOwner = async (name: string, email: string, password: string) => {
    try {
      await authService.registerOwner(name, email, password);
    } catch (error) {
      throw error;
    }
  };

  const registerTenant = async (name: string, rentAmount: number) => {
    try {
      await authService.registerTenant(name, rentAmount);
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
        registerOwner,
        registerTenant,
        mustChangePassword,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 