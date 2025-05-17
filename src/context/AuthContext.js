import React, { createContext, useContext, useState, useEffect } from "react";
import { login as apiLogin, register as apiRegister } from "../api/auth";

// Create the Auth Context
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Update localStorage when token changes
  useEffect(() => {
    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
    } else {
      localStorage.removeItem("accessToken");
    }
  }, [accessToken]);

  // Update localStorage when userEmail changes
  useEffect(() => {
    if (userEmail) {
      localStorage.setItem("userEmail", userEmail);
    } else {
      localStorage.removeItem("userEmail");
    }
  }, [userEmail]);

  // Register new user
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRegister(userData);
      const { access_token, message } = response.data;
      
      // Save token and user info
      setAccessToken(access_token);
      setUserEmail(userData.email);
      setLoading(false);
      
      return { success: true, message };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || "Registration failed. Please try again.";
      setError(errorMessage);
      setLoading(false);
      return { success: false, message: errorMessage };
    }
  };

  // Login user
  const login = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiLogin(userData);
      const { access_token, message } = response.data;
      
      // Save token and user info
      setAccessToken(access_token);
      setUserEmail(userData.username); // username is actually email in the login form
      setLoading(false);
      
      return { success: true, message };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || "Login failed. Please check your credentials.";
      setError(errorMessage);
      setLoading(false);
      return { success: false, message: errorMessage };
    }
  };

  // Logout user
  const logout = () => {
    setAccessToken(null);
    setUserEmail(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userEmail");
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!accessToken;
  };

  // Get the auth header for API requests
  const getAuthHeader = () => {
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        userEmail,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated,
        getAuthHeader,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}