import { apiClient } from './apiClient';
import { Status } from '../types/application';
import { mockApplications, mockActivityLogs } from './mockData';

export const getApplications = async (filters = {}) => {
  // Build query parameters
  const params = new URLSearchParams();
  if (filters.status && filters.status !== 'all') {
    params.append('status', filters.status);
  }
  if (filters.search) {
    params.append('search', filters.search);
  }
  if (filters.page) {
    params.append('page', filters.page.toString());
  }
  if (filters.pageSize) {
    params.append('pageSize', filters.pageSize.toString());
  }
  
  const query = params.toString() ? `?${params.toString()}` : '';
  try {
    return await apiClient(`/applications/${query}`);
  } catch (error) {
    let data = [...mockApplications];

    if (filters.status && filters.status !== 'all') {
      data = data.filter((app) => app.status === filters.status);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      data = data.filter(
        (app) =>
          app.trackingNumber.toLowerCase().includes(searchLower) ||
          app.applicantName.toLowerCase().includes(searchLower) ||
          app.companyName.toLowerCase().includes(searchLower)
      );
    }

    return {
      data,
      total: data.length,
      page: filters.page || 1,
      pageSize: filters.pageSize || 10,
      totalPages: 1
    };
  }
};

export const getApplication = async (id) => {
  try {
    return await apiClient(`/applications/${id}/`);
  } catch (error) {
    const app = mockApplications.find((item) => item.id === id);
    if (!app) throw error;
    return app;
  }
};

export const createApplication = async (data) => {
  return await apiClient('/applications/', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const updateApplication = async (id, data) => {
  return await apiClient(`/applications/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

export const submitApplication = async (id) => {
  return await apiClient(`/applications/${id}/submit/`, {
    method: 'POST'
  });
};

export const startReview = async (id) => {
  return await apiClient(`/applications/${id}/start-review/`, {
    method: 'POST'
  });
};

export const withdrawApplication = async (id) => {
  return await apiClient(`/applications/${id}/withdraw/`, {
    method: 'POST'
  });
};

export const makeDecision = async (id, decision, comment = '') => {
  return await apiClient(`/applications/${id}/decision/`, {
    method: 'POST',
    body: JSON.stringify({ decision, comment })
  });
};

export const deleteApplication = async (id) => {
  return await apiClient(`/applications/${id}/`, {
    method: 'DELETE'
  });
};

export const updateApplicationStatus = async (id, newStatus, comment) => {
  return await apiClient(`/applications/${id}/status/`, {
    method: 'POST',
    body: JSON.stringify(comment ? { status: newStatus, comment } : { status: newStatus })
  });
};

export const getActivityLog = async (id) => {
  try {
    return await apiClient(`/applications/${id}/activity/`);
  } catch (error) {
    return mockActivityLogs[id] || [];
  }
};
