import React, { createContext, useContext, useState } from 'react';

interface SimpleAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

export const useSimpleAuth = () => {
  const context = useContext(SimpleAuthContext);
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
};

interface SimpleAuthProviderProps {
  children: React.ReactNode;
}

export const SimpleAuthProvider: React.FC<SimpleAuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading] = useState(false);

  const login = () => {
    console.log('Simple login');
    setIsAuthenticated(true);
  };

  const logout = () => {
    console.log('Simple logout');
    setIsAuthenticated(false);
  };

  const value: SimpleAuthContextType = {
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return (
    <SimpleAuthContext.Provider value={value}>
      {children}
    </SimpleAuthContext.Provider>
  );
};
