import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { StatsRow } from '../components/dashboard/StatsRow';
import { TrendsChart } from '../components/dashboard/TrendsChart';
import { StatusDonut } from '../components/dashboard/StatusDonut';
import { RecentApplicationsTable } from '../components/dashboard/RecentApplicationsTable';
import {
  getStats,
  getTrendData,
  getStatusDistribution,
  getRecentApplications } from
'../api/dashboardApi';
import {
  DashboardStats,
  TrendDataPoint,
  StatusDistribution,
  Application } from
'../types/application';
export function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [statusDist, setStatusDist] = useState<StatusDistribution[]>([]);
  const [recentApps, setRecentApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadDashboardData();
  }, []);
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, trendsData, distData, appsData] = await Promise.all([
      getStats(),
      getTrendData('30d'),
      getStatusDistribution(),
      getRecentApplications()]
      );
      setStats(statsData);
      setTrendData(trendsData);
      setStatusDist(distData);
      setRecentApps(appsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  const handlePeriodChange = async (period: '7d' | '30d' | '90d') => {
    const data = await getTrendData(period);
    setTrendData(data);
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text-secondary">Loading dashboard...</div>
      </div>);

  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">
            Dashboard
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Overview of all applications
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate('/applications')}>
            <FileText size={16} className="mr-2" />
            View All Applications
          </Button>
          <Button onClick={() => navigate('/applications/create')}>
            <Plus size={16} className="mr-2" />
            New Application
          </Button>
        </div>
      </div>

      {stats && <StatsRow stats={stats} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TrendsChart data={trendData} onPeriodChange={handlePeriodChange} />
        </div>
        <div>
          <StatusDonut data={statusDist} />
        </div>
      </div>

      <RecentApplicationsTable applications={recentApps} />
    </div>);

}