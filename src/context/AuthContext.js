import React, { createContext, useContext, useState, useEffect } from "react";
import { login as apiLogin, register as apiRegister, getMe } from "../api/auth";
import { getApiErrorMessage } from "../utils/errorHandler";

// Create the Auth Context
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(
    () => localStorage.getItem("accessToken") || null
  );
  const [userEmail, setUserEmail] = useState(
    () => localStorage.getItem("userEmail") || null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 앱 시작 시 저장된 토큰으로 사용자 복원 (GET /auth/me)
  // 토큰이 만료/변조된 경우(401) 토큰을 비운다.
  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    if (!storedToken) return;

    getMe(storedToken)
      .then((response) => {
        setUserEmail(response.data.email);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          setAccessToken(null);
          setUserEmail(null);
        }
        // 네트워크 오류 등은 토큰을 유지 (서버 복구 후 재시도 가능)
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Register new user — body: { email, password }
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRegister({
        email: userData.email,
        password: userData.password,
      });
      const { access_token } = response.data;

      // Save token and user info
      setAccessToken(access_token);
      setUserEmail(userData.email);
      setLoading(false);

      return { success: true };
    } catch (err) {
      const errorMessage = getApiErrorMessage(
        err,
        "Registration failed. Please try again."
      );
      setError(errorMessage);
      setLoading(false);
      return { success: false, message: errorMessage };
    }
  };

  // Login user — body: { email, password }
  // (로그인 폼의 username 필드는 이메일 값이므로 email로 매핑)
  const login = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const email = userData.email || userData.username;
      const response = await apiLogin({
        email,
        password: userData.password,
      });
      const { access_token } = response.data;

      // Save token and user info
      setAccessToken(access_token);
      setUserEmail(email);
      setLoading(false);

      return { success: true };
    } catch (err) {
      const errorMessage = getApiErrorMessage(
        err,
        "Login failed. Please check your credentials."
      );
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