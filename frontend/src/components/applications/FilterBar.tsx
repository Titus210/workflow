import React from 'react';
import { Search } from 'lucide-react';
import { Card } from '../ui/Card';
import { Select } from '../ui/Select';
import { Status } from '../../types/application';
interface FilterBarProps {
  status: string;
  search: string;
  onStatusChange: (status: string) => void;
  onSearchChange: (search: string) => void;
  onClear: () => void;
}
export function FilterBar({
  status,
  search,
  onStatusChange,
  onSearchChange,
  onClear
}: FilterBarProps) {
  const statusOptions = [
  {
    value: 'all',
    label: 'All Statuses'
  },
  {
    value: Status.DRAFT,
    label: 'Draft'
  },
  {
    value: Status.SUBMITTED,
    label: 'Submitted'
  },
  {
    value: Status.UNDER_REVIEW,
    label: 'Under Review'
  },
  {
    value: Status.NEED_MORE_INFO,
    label: 'Need More Info'
  },
  {
    value: Status.APPROVED,
    label: 'Approved'
  },
  {
    value: Status.REJECTED,
    label: 'Rejected'
  }];

  return (
    <Card className="p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            
            <input
              type="text"
              placeholder="Search by name or tracking number..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-border-color rounded bg-card-bg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent" />
            
          </div>
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            options={statusOptions} />
          
        </div>
        {(status !== 'all' || search) &&
        <button
          onClick={onClear}
          className="text-sm text-accent hover:text-blue-700 whitespace-nowrap">
          
            Clear filters
          </button>
        }
      </div>
    </Card>);

}