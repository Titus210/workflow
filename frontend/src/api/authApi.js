import { apiClient } from './apiClient';

export const login = async (credentials) => {
  return await apiClient('/auth/login/', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
};

export const logout = async () => {
  return await apiClient('/auth/logout/', {
    method: 'POST'
  });
};

export const getCurrentUser = async () => {
  return await apiClient('/auth/me/');
};
