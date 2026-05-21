import React from 'react';
import { Status } from '../../types/application';
import { statusLabels, statusColors } from '../../lib/statusUtils';
interface StatusBadgeProps {
  status: Status;
}
export function StatusBadge({ status }: StatusBadgeProps) {
  const colors = statusColors[status];
  const label = statusLabels[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}>
      
      {label}
    </span>);

}