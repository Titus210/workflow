import { apiClient } from './apiClient';
import { mockApplications } from './mockData';

const buildTrendData = (period) => {
  const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
  const byDate = new Map();

  mockApplications.forEach((app) => {
    const date = new Date(app.createdAt).toISOString().slice(0, 10);
    byDate.set(date, (byDate.get(date) || 0) + 1);
  });

  return Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - index));
    const key = date.toISOString().slice(0, 10);
    return { date: key, count: byDate.get(key) || 0 };
  });
};

const buildDistribution = () => {
  const colorMap = {
    DRAFT: '#6B7280',
    SUBMITTED: '#3B82F6',
    UNDER_REVIEW: '#EAB308',
    NEED_MORE_INFO: '#F97316',
    APPROVED: '#22C55E',
    REJECTED: '#EF4444'
  };

  return Object.entries(
    mockApplications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => ({
    status,
    count,
    color: colorMap[status]
  }));
};

export const getStats = async () => {
  try {
    return await apiClient('/dashboard/stats/');
  } catch (error) {
    const approved = mockApplications.filter((app) => app.status === 'APPROVED').length;
    const rejected = mockApplications.filter((app) => app.status === 'REJECTED').length;
    const pending = mockApplications.filter((app) => ['SUBMITTED', 'UNDER_REVIEW'].includes(app.status)).length;

    return {
      totalApplications: mockApplications.length,
      pendingReview: pending,
      approvedThisMonth: approved,
      rejectedThisMonth: rejected,
      totalDelta: '+12%',
      pendingDelta: '+8%',
      approvedDelta: '+15%',
      rejectedDelta: '-5%'
    };
  }
};

export const getTrendData = async (period = '30d') => {
  try {
    return await apiClient(`/dashboard/trends/?period=${period}`);
  } catch (error) {
    return buildTrendData(period);
  }
};

export const getStatusDistribution = async () => {
  try {
    return await apiClient('/dashboard/distribution/');
  } catch (error) {
    return buildDistribution();
  }
};

export const getRecentApplications = async () => {
  try {
    return await apiClient('/dashboard/recent/');
  } catch (error) {
    return [...mockApplications]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }
};
