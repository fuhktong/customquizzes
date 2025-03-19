// apiService.js - A helper service for API calls

/**
 * Makes an authenticated request to the API
 * @param {string} action - The API action (endpoint)
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {object} data - Request payload for POST requests
 * @returns {Promise} - The API response
 */
export const apiRequest = async (action, method = "GET", data = null) => {
  const apiUrl = `${process.env.REACT_APP_API_URL}api.php?action=${action}`;
  const authToken = localStorage.getItem("authToken");

  const headers = {
    "Content-Type": "application/json",
  };

  // Add auth token if available
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const options = {
    method,
    headers,
  };

  // Add body for POST requests
  if (method !== "GET" && data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(apiUrl, options);
    const responseData = await response.json();

    if (!response.ok) {
      // Handle authentication errors
      if (response.status === 401) {
        // Clear local storage on authentication failure
        localStorage.removeItem("authToken");
        localStorage.removeItem("userId");
        localStorage.removeItem("username");
      }

      throw new Error(responseData.error || "API request failed");
    }

    return responseData;
  } catch (error) {
    console.error(`API Error (${action}):`, error);
    throw error;
  }
};

/**
 * Checks if the user is authenticated
 * @returns {boolean} - Authentication status
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem("authToken");
};

/**
 * Gets the current user ID
 * @returns {string|null} - User ID if authenticated
 */
export const getUserId = () => {
  return localStorage.getItem("userId");
};
