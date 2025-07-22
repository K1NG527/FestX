import { createContext, useContext, useState, ReactNode } from "react";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";

// Authentication context type
export type AuthContextType = {
  user: any;
  isAuthenticated: boolean;
  login: (userData: any) => void;
  logout: () => void;
};

// Create a default value
const defaultAuthContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
};

// Create the context
const AuthContext = createContext<AuthContextType>(defaultAuthContext);

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Auth provider props
type AuthProviderProps = {
  children: ReactNode;
};

// Auth provider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  // Initialize directly from localStorage
  const storedUser = localStorage.getItem("user");
  const storedAuth = localStorage.getItem("isAuthenticated") === "true";

  const [user, setUser] = useState<any>(storedUser ? JSON.parse(storedUser) : null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(storedAuth);
  const [, setLocation] = useLocation();

  const login = (userData: any) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("isAuthenticated", "true");
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
    queryClient.clear();
    setLocation("/login");
  };

  const authContextValue = {
    user,
    isAuthenticated,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};