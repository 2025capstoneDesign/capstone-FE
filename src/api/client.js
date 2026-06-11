// src/api/client.js
// API 모듈 공통 설정.
// 엔드포인트/인증 방식은 기존 코드와 동일하게 유지한다 (순수 리팩토링).

export const API_URL = process.env.REACT_APP_API_URL;

// FastAPI 백엔드의 v1 API 베이스 (예: http://localhost:18080/api/v1)
export const API_V1_URL = `${API_URL}/api/v1`;

/**
 * localStorage 기반 인증 헤더.
 * 기존 processService 등에서 쓰던 방식 그대로.
 * (일부 호출부는 AuthContext의 getAuthHeader()를 쓰므로,
 *  그런 함수는 authHeader 인자를 받아 기존 동작을 보존한다.)
 */
export const getStoredAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};
