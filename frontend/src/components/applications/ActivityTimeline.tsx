import React from 'react';
import { Card } from '../ui/Card';
import { ActivityLogEntry } from '../../types/application';
import { formatDateTime } from '../../lib/formatters';
import { statusLabels } from '../../lib/statusUtils';
interface ActivityTimelineProps {
  activities: ActivityLogEntry[];
}
export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold text-text-primary mb-4">
        Activity Timeline
      </h3>
      <div className="space-y-4">
        {activities.map((activity, index) =>
        <div key={activity.id} className="relative pl-6">
            {index !== activities.length - 1 &&
          <div className="absolute left-2 top-6 bottom-0 w-px bg-border-color" />
          }
            <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-accent border-2 border-card-bg" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-text-primary">
                {statusLabels[activity.status]}
              </p>
              <p className="text-xs text-text-secondary">{activity.user}</p>
              <p className="text-xs text-text-secondary">
                {formatDateTime(activity.timestamp)}
              </p>
              {activity.comment &&
            <p className="text-xs text-text-secondary mt-2 p-2 bg-gray-50 rounded border border-border-color">
                  {activity.comment}
                </p>
            }
            </div>
          </div>
        )}
      </div>
    </Card>);

}