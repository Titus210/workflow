import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { Application } from '../../types/application';
import { formatDate } from '../../lib/formatters';
interface ApplicationsTableProps {
  applications: Application[];
}
export function ApplicationsTable({ applications }: ApplicationsTableProps) {
  const navigate = useNavigate();
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-color">
              <th className="text-left text-xs font-medium text-text-secondary px-4 py-3">
                <div className="flex items-center gap-1">
                  Tracking Number
                  <ChevronDown size={14} />
                </div>
              </th>
              <th className="text-left text-xs font-medium text-text-secondary px-4 py-3">
                Applicant Name
              </th>
              <th className="text-left text-xs font-medium text-text-secondary px-4 py-3">
                Company Name
              </th>
              <th className="text-left text-xs font-medium text-text-secondary px-4 py-3">
                Application Type
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
              className="border-b border-border-color hover:bg-gray-50 cursor-pointer transition-colors">
              
                <td className="px-4 py-3 text-sm font-mono text-accent hover:text-blue-700">
                  {app.trackingNumber}
                </td>
                <td className="px-4 py-3 text-sm text-text-primary">
                  {app.applicantName}
                </td>
                <td className="px-4 py-3 text-sm text-text-secondary">
                  {app.companyName}
                </td>
                <td className="px-4 py-3 text-sm text-text-secondary">
                  {app.applicationType}
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