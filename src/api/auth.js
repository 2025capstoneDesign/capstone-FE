// src/api/auth.js
// 인증 API — FastAPI /api/v1 스펙.
// register/login 모두 JSON body { email, password } 를 보내고
// { access_token, token_type } 을 받는다.

import axios from "axios";
import { API_V1_URL } from "./client";

export const register = async (userData) => {
  return axios.post(`${API_V1_URL}/auth/register`, userData, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const login = async (userData) => {
  return axios.post(`${API_V1_URL}/auth/login`, userData, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

// 현재 로그인한 사용자 조회 (세션 복원용)
export const getMe = async (token) => {
  return axios.get(`${API_V1_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
