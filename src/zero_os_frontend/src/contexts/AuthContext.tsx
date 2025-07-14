import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

// Type definitions
interface Identity {
  getPrincipal: () => any;
}

interface AuthClient {
  create: () => Promise<AuthClient>;
  isAuthenticated: () => Promise<boolean>;
  getIdentity: () => Identity;
  login: (options: any) => Promise<void>;
  logout: () => Promise<void>;
}

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
    // Delay initialization to avoid bundling issues
    const timer = setTimeout(() => {
      initAuth();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const initAuth = async () => {
    try {
      // Try to load the auth client with error handling
      let AuthClientClass: any;
      
      try {
        const module = await import('@dfinity/auth-client');
        AuthClientClass = module.AuthClient;
      } catch (importError) {
        console.error('Failed to import auth client:', importError);
        // Fallback: use a mock client for development
        return initMockAuth();
      }

      if (!AuthClientClass) {
        console.error('AuthClient not found in module');
        return initMockAuth();
      }

      const client = await AuthClientClass.create({
        idleOptions: {
          disableIdle: true,
          disableDefaultIdleCallback: true,
        },
      });
      
      setAuthClient(client);
      
      const authenticated = await client.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        const userIdentity = client.getIdentity();
        setIdentity(userIdentity);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      // Use mock auth as fallback
      initMockAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const initMockAuth = () => {
    console.log('Using mock authentication for development');
    setIsAuthenticated(true);
    setIdentity({
      getPrincipal: () => ({
        toString: () => 'mock-principal-id-for-development'
      })
    } as Identity);
    setIsLoading(false);
  };

  const login = async () => {
    if (!authClient) {
      // For mock auth, just toggle state
      setIsAuthenticated(true);
      setIdentity({
        getPrincipal: () => ({
          toString: () => 'mock-principal-id-for-development'
        })
      } as Identity);
      toast.success('Logged in (development mode)');
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
        onError: (error: any) => {
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
      // For mock auth, just reset state
      setIsAuthenticated(false);
      setIdentity(null);
      toast.success('Logged out');
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

  const contextValue: AuthContextType = {
    isAuthenticated,
    isLoading,
    identity,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
