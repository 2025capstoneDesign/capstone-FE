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
 * Handle an API error and show an appropriate message to the user
 * @param {Error} error - The error object from the API call
 * @param {string} defaultMessage - The default error message if none can be extracted
 */
export const handleApiError = (error, defaultMessage = "An error occurred. Please try again.") => {
  let errorMessage = defaultMessage;
  
  // Try to extract a meaningful error message from the API response
  if (error.response?.data?.detail) {
    errorMessage = error.response.data.detail;
  } else if (error.response?.data?.message) {
    errorMessage = error.response.data.message;
  } else if (error.message) {
    errorMessage = error.message;
  }
  
  showError(errorMessage, error);
};

export default {
  showError,
  handleApiError
};