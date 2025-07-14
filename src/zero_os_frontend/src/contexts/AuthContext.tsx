import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Identity } from '@dfinity/agent';
import toast from 'react-hot-toast';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  identity: Identity | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      const client = await AuthClient.create();
      setAuthClient(client);

      const isAuthenticated = await client.isAuthenticated();
      setIsAuthenticated(isAuthenticated);

      if (isAuthenticated) {
        const identity = client.getIdentity();
        setIdentity(identity);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      toast.error('Authentication initialization failed');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    if (!authClient) {
      toast.error('Authentication client not initialized');
      return;
    }

    try {
      await authClient.login({
        identityProvider: import.meta.env.VITE_DFX_NETWORK === 'ic' 
          ? 'https://identity.ic0.app' 
          : `http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943`,
        onSuccess: () => {
          setIsAuthenticated(true);
          setIdentity(authClient.getIdentity());
          toast.success('Successfully logged in!');
        },
        onError: (error) => {
          console.error('Login error:', error);
          toast.error('Login failed');
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed');
    }
  };

  const logout = async () => {
    if (!authClient) {
      toast.error('Authentication client not initialized');
      return;
    }

    try {
      await authClient.logout();
      setIsAuthenticated(false);
      setIdentity(null);
      toast.success('Successfully logged out!');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    identity,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
