const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const getStoredToken = () =>
  localStorage.getItem('token') || sessionStorage.getItem('token');

export const clearAuthStorage = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('refreshToken');
  sessionStorage.removeItem('user');
};

export const apiClient = async (endpoint, options = {}) => {
  const token = getStoredToken();
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    if (!response.ok) {
      // Try to parse error response
      let errorData = {};
      try {
        errorData = await response.json();
      } catch (e) {
        // If not JSON, use status text
        errorData = { message: response.statusText };
      }
      
      throw {
        error: errorData.error || 'UNKNOWN_ERROR',
        message: errorData.message || 'An error occurred',
        details: errorData.details || {},
        status: response.status
      };
    }

    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return null;
    }

    return await response.json();
  } catch (error) {
    // Re-throw our structured error or network error
    if (error.error) {
      throw error;
    } else {
      // Network or fetch error
      throw {
        error: 'NETWORK_ERROR',
        message: 'Failed to connect to the server',
        details: {},
        status: 0
      };
    }
  }
};

export default apiClient;
