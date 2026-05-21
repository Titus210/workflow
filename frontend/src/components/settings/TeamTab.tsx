import React, { useEffect, useState } from 'react';
import { MoreVertical } from 'lucide-react';
import { Card } from '../ui/Card';
import { getTeamMembers } from '../../api/settingsApi';
export function TeamTab() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadMembers();
  }, []);
  const loadMembers = async () => {
    setLoading(true);
    try {
      const data = await getTeamMembers();
      setMembers(data);
    } catch (error) {
      console.error('Failed to load team members:', error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return <div className="text-text-secondary">Loading...</div>;
  }
  const roleColors: Record<
    string,
    {
      bg: string;
      text: string;
      border: string;
    }> =
  {
    Admin: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200'
    },
    Reviewer: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200'
    },
    Applicant: {
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      border: 'border-gray-200'
    }
  };
  return (
    <div className="space-y-6">
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-color">
                <th className="text-left text-xs font-medium text-text-secondary px-4 py-3">
                  Name
                </th>
                <th className="text-left text-xs font-medium text-text-secondary px-4 py-3">
                  Email
                </th>
                <th className="text-left text-xs font-medium text-text-secondary px-4 py-3">
                  Role
                </th>
                <th className="text-left text-xs font-medium text-text-secondary px-4 py-3">
                  Last Active
                </th>
                <th className="text-left text-xs font-medium text-text-secondary px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const colors = roleColors[member.role] || roleColors.Applicant;
                return (
                  <tr
                    key={member.id}
                    className="border-b border-border-color hover:bg-gray-50">
                    
                    <td className="px-4 py-3 text-sm text-text-primary">
                      {member.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">
                      {member.email}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}>
                        
                        {member.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">
                      {member.lastActive}
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-text-secondary hover:text-text-primary">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>);

              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>);

}