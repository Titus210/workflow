import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';
import { Tooltip } from '../ui/Tooltip';
import { Application } from '../../types/application';
import { getActionButtons, isTerminal } from '../../lib/statusUtils';
interface ApplicationDetailHeaderProps {
  application: Application;
  onAction: (action: string) => void;
}
export function ApplicationDetailHeader({
  application,
  onAction
}: ApplicationDetailHeaderProps) {
  const navigate = useNavigate();
  const actionButtons = getActionButtons(application.status);
  return (
    <div className="space-y-4">
      <button
        onClick={() => navigate('/applications')}
        className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary">
        
        <ArrowLeft size={16} />
        Back to Applications
      </button>

      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold font-mono text-text-primary">
              {application.trackingNumber}
            </h1>
            <StatusBadge status={application.status} />
          </div>
          <p className="text-sm text-text-secondary">
            {application.applicantName} • {application.companyName}
          </p>
        </div>

        <div className="flex gap-2">
          {actionButtons.map((button) =>
          <Tooltip key={button.action} content={button.tooltip}>
              <Button
              variant={button.variant}
              onClick={() => onAction(button.action)}>
              
                {button.label}
              </Button>
            </Tooltip>
          )}
          {isTerminal(application.status) &&
          <p className="text-sm text-text-secondary italic mt-2">
              This application is finalized.
            </p>
          }
        </div>
      </div>
    </div>);

}