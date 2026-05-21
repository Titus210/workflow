import { apiClient } from './apiClient';
import { mockTeamMembers, mockUser } from './mockData';

const mockSessions = [
  {
    id: '1',
    device: 'Chrome on Linux',
    location: 'Local Development',
    lastActive: 'Current session',
    current: true
  },
  {
    id: '2',
    device: 'Safari on iPhone',
    location: 'Remote',
    lastActive: '2 hours ago',
    current: false
  }
];

export const getProfile = async () => {
  try {
    return await apiClient('/settings/profile/');
  } catch (error) {
    return mockUser;
  }
};

export const updateProfile = async (data) => {
  return await apiClient('/settings/profile/', {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

export const changePassword = async (data) => {
  return await apiClient('/settings/password/', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const getNotificationPrefs = async () => {
  try {
    return await apiClient('/settings/notifications/');
  } catch (error) {
    return {
      emailNotifications: true,
      pushNotifications: false,
      digestFrequency: 'weekly'
    };
  }
};

export const updateNotificationPrefs = async (data) => {
  return await apiClient('/settings/notifications/', {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

export const getAppSettings = async () => {
  try {
    return await apiClient('/settings/app/');
  } catch (error) {
    return {
      defaultApplicationType: 'Recordation',
      autoAssignReviewer: true,
      commentRequired: true
    };
  }
};

export const updateAppSettings = async (data) => {
  return await apiClient('/settings/app/', {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

export const getTeamMembers = async () => {
  try {
    return await apiClient('/settings/team/');
  } catch (error) {
    return mockTeamMembers;
  }
};

export const getActiveSessions = async () => {
  try {
    return await apiClient('/settings/sessions/');
  } catch (error) {
    return mockSessions;
  }
};

export const deleteActiveSession = async (sessionId) => {
  return await apiClient(`/settings/sessions/${sessionId}/`, {
    method: 'DELETE'
  });
};
