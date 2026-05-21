import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { Application } from '../../types/application';
import { formatDate } from '../../lib/formatters';
interface RecentApplicationsTableProps {
  applications: Application[];
}
export function RecentApplicationsTable({
  applications
}: RecentApplicationsTableProps) {
  const navigate = useNavigate();
  return (
    <Card>
      <div className="flex items-center justify-between p-4 border-b border-border-color">
        <h3 className="text-sm font-semibold text-text-primary">
          Recent Applications
        </h3>
        <button
          onClick={() => navigate('/applications')}
          className="flex items-center gap-1 text-sm text-accent hover:text-blue-700">
          
          View all
          <ArrowRight size={16} />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-color">
              <th className="text-left text-xs font-medium text-text-secondary px-4 py-3">
                Tracking Number
              </th>
              <th className="text-left text-xs font-medium text-text-secondary px-4 py-3">
                Applicant Name
              </th>
              <th className="text-left text-xs font-medium text-text-secondary px-4 py-3">
                Status
              </th>
              <th className="text-left text-xs font-medium text-text-secondary px-4 py-3">
                Created Date
              </th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) =>
            <tr
              key={app.id}
              onClick={() => navigate(`/applications/${app.id}`)}
              className="border-b border-border-color hover:bg-gray-50 cursor-pointer">
              
                <td className="px-4 py-3 text-sm font-mono text-accent">
                  {app.trackingNumber}
                </td>
                <td className="px-4 py-3 text-sm text-text-primary">
                  {app.applicantName}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={app.status} />
                </td>
                <td className="px-4 py-3 text-sm text-text-secondary">
                  {formatDate(app.createdAt)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>);

}