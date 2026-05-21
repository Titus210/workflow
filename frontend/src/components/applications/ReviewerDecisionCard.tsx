import React from 'react';
import { Card } from '../ui/Card';
import { Application } from '../../types/application';
import { formatDateTime } from '../../lib/formatters';
interface ReviewerDecisionCardProps {
  application: Application;
}
export function ReviewerDecisionCard({
  application
}: ReviewerDecisionCardProps) {
  if (!application.reviewerDecision) return null;
  const decisionLabels = {
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    NEED_MORE_INFO: 'Need More Information'
  };
  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold text-text-primary mb-4">
        Reviewer Decision
      </h3>
      <dl className="space-y-3">
        <div>
          <dt className="text-xs text-text-secondary">Decision</dt>
          <dd className="text-sm text-text-primary font-medium mt-1">
            {decisionLabels[application.reviewerDecision]}
          </dd>
        </div>
        {application.reviewerComment &&
        <div>
            <dt className="text-xs text-text-secondary">Comment</dt>
            <dd className="text-sm text-text-primary mt-1 p-3 bg-gray-50 rounded border border-border-color">
              {application.reviewerComment}
            </dd>
          </div>
        }
        <div>
          <dt className="text-xs text-text-secondary">Reviewed By</dt>
          <dd className="text-sm text-text-primary mt-1">
            {application.reviewedBy}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-text-secondary">Reviewed Date</dt>
          <dd className="text-sm text-text-primary mt-1">
            {formatDateTime(application.reviewedAt!)}
          </dd>
        </div>
      </dl>
    </Card>);

}