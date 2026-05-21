import React from 'react';
import { StatCard } from '../ui/StatCard';
import { DashboardStats } from '../../types/application';
interface StatsRowProps {
  stats: DashboardStats;
}
export function StatsRow({ stats }: StatsRowProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Applications"
        value={stats.totalApplications}
        delta={stats.totalDelta}
        deltaType="positive" />
      
      <StatCard
        label="Pending Review"
        value={stats.pendingReview}
        delta={stats.pendingDelta}
        deltaType="positive" />
      
      <StatCard
        label="Approved This Month"
        value={stats.approvedThisMonth}
        delta={stats.approvedDelta}
        deltaType="positive" />
      
      <StatCard
        label="Rejected This Month"
        value={stats.rejectedThisMonth}
        delta={stats.rejectedDelta}
        deltaType="negative" />
      
    </div>);

}