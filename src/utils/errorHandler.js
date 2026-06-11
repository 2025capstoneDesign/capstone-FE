/**
 * errorHandler.js - Common error handling utilities
 * 
 * This file contains utility functions for handling errors consistently throughout the application.
 * All errors should be displayed using the alert function by default.
 */

/**
 * Show an error message to the user using an alert dialog
 * @param {string} message - The error message to display
 * @param {Error} [error] - Optional error object for logging
 */
export const showError = (message, error = null) => {
  if (error) {
    console.error(message, error);
  }

  window.alert(message);
};

/**
 * Show a success/info message to the user.
 * (현재는 alert 기반 — 추후 toast로 교체 시 이 함수만 바꾸면 됨)
 * @param {string} message - The message to display
 */
export const showSuccess = (message) => {
  window.alert(message);
};

/**
 * Extract a human-readable message from an API error (FastAPI /api/v1 스펙).
 *
 * 백엔드 에러 형태 세 가지를 모두 처리한다:
 * - detail이 object: { code, message } → message 사용
 * - detail이 array: FastAPI validation error → 첫 항목의 msg 사용
 * - detail이 string: 구버전/단순 에러 → 그대로 사용
 *
 * @param {Error} error - The error object from the API call (axios error)
 * @param {string} defaultMessage - Fallback message
 * @returns {string}
 */
export const getApiErrorMessage = (error, defaultMessage = "An error occurred. Please try again.") => {
  const detail = error?.response?.data?.detail;

  if (typeof detail === "string" && detail) {
    return detail;
  }
  if (Array.isArray(detail)) {
    return detail[0]?.msg || defaultMessage;
  }
  if (detail && typeof detail === "object" && detail.message) {
    return detail.message;
  }
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return defaultMessage;
};

/**
 * Handle an API error and show an appropriate message to the user
 * @param {Error} error - The error object from the API call
 * @param {string} defaultMessage - The default error message if none can be extracted
 */
export const handleApiError = (error, defaultMessage = "An error occurred. Please try again.") => {
  showError(getApiErrorMessage(error, defaultMessage), error);
};

export default {
  showError,
  showSuccess,
  handleApiError,
  getApiErrorMessage
};