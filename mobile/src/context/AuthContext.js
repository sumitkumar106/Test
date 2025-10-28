import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

// Create Auth Context
const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  handleRegister: () => {},
  handleLogin: () => {},
  handleLogout: () => {},
  validateStoredToken: () => {},
});

/**
 * Auth Provider Component
 * Manages authentication state globally
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Validate stored token on app startup
   * Checks if user has valid stored credentials
   */
  const validateStoredToken = async () => {
    try {
      setIsLoading(true);

      // Get stored user profile and access token
      const storedUser = await authService.getUserProfile();
      const accessToken = await authService.getAccessToken();

      if (storedUser && accessToken) {
        // User has stored credentials
        setUser(storedUser);
        setIsAuthenticated(true);
      } else {
        // No stored credentials
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error validating stored token:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle user registration
   */
  const handleRegister = async (name, email, password, role = 'passenger') => {
    try {
      const registeredUser = await authService.register(name, email, password, role);
      setUser(registeredUser);
      setIsAuthenticated(true);
      return { success: true, user: registeredUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  /**
   * Handle user login
   */
  const handleLogin = async (email, password) => {
    try {
      const loggedInUser = await authService.login(email, password);
      setUser(loggedInUser);
      setIsAuthenticated(true);
      return { success: true, user: loggedInUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  /**
   * Handle user logout
   */
  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Clear state even if API call fails
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    }
  };

  // Validate stored token on app mount
  useEffect(() => {
    validateStoredToken();
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    handleRegister,
    handleLogin,
    handleLogout,
    validateStoredToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use Auth Context
 * @returns {Object} Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
