import React, { useEffect, useState, createContext, useContext } from 'react';
import { getCurrentUser, login as loginRequest, logout as logoutRequest } from '../api/authApi';
import { clearAuthStorage } from '../api/apiClient';

interface User {
  id?: string | number;
  name: string;
  email: string;
  initial: string;
  role?: string;
}
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function AuthProvider({ children }: {children: React.ReactNode;}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const mapUser = (apiUser: any): User => ({
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    role: apiUser.role,
    initial: (apiUser.name || apiUser.email || 'U').charAt(0).toUpperCase()
  });

  useEffect(() => {
    const bootstrapAuth = async () => {
      const storedUser =
        localStorage.getItem('user') || sessionStorage.getItem('user');
      const storedToken =
        localStorage.getItem('token') || sessionStorage.getItem('token');

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const apiUser = await getCurrentUser();
        const normalizedUser = mapUser(apiUser);
        setUser(normalizedUser);

        if (localStorage.getItem('token')) {
          localStorage.setItem('user', JSON.stringify(normalizedUser));
        } else {
          sessionStorage.setItem('user', JSON.stringify(normalizedUser));
        }
      } catch (error) {
        clearAuthStorage();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean) => {
    const response = await loginRequest({ email, password });
    const normalizedUser = mapUser(response.user);
    const storage = rememberMe ? localStorage : sessionStorage;
    const otherStorage = rememberMe ? sessionStorage : localStorage;

    otherStorage.removeItem('token');
    otherStorage.removeItem('refreshToken');
    otherStorage.removeItem('user');

    storage.setItem('token', response.token);
    storage.setItem('refreshToken', response.refreshToken);
    storage.setItem('user', JSON.stringify(normalizedUser));

    setUser(normalizedUser);
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } catch (error) {
      // If the backend is unavailable, still clear the local session.
    } finally {
      clearAuthStorage();
      setUser(null);
    }
  };

  if (loading) return null;
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout
      }}>
      {children}
    </AuthContext.Provider>);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
