import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card } from '../components/ui/Card';
import { ApplicationDetailHeader } from '../components/applications/ApplicationDetailHeader';
import { ReviewerDecisionCard } from '../components/applications/ReviewerDecisionCard';
import { ActivityTimeline } from '../components/applications/ActivityTimeline';
import { ReviewerDecisionModal } from '../components/applications/ReviewerDecisionModal';
import {
  getApplication,
  submitApplication,
  startReview,
  makeDecision,
  getActivityLog,
  deleteApplication,
  withdrawApplication } from
'../api/applicationsApi';
import { Application, ActivityLogEntry } from '../types/application';
import { formatDate } from '../lib/formatters';
export function ApplicationDetailPage() {
  const { id } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<Application | null>(null);
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<
    'approve' | 'reject' | 'need-info'>(
    'approve');
  useEffect(() => {
    if (id) loadApplication();
  }, [id]);
  const loadApplication = async () => {
    setLoading(true);
    try {
      const [appData, activityData] = await Promise.all([
      getApplication(id!),
      getActivityLog(id!)]
      );
      setApplication(appData);
      setActivities(activityData);
    } catch (error) {
      console.error('Failed to load application:', error);
      toast.error('Failed to load application');
    } finally {
      setLoading(false);
    }
  };
  const handleAction = async (action: string) => {
    if (!application) return;
    try {
      if (action === 'edit') {
        navigate(`/applications/${application.id}/edit`);
      } else if (action === 'submit' || action === 'resubmit') {
        await submitApplication(application.id);
        toast.success('Application submitted successfully');
        loadApplication();
      } else if (action === 'start-review') {
        await startReview(application.id);
        toast.success('Review started');
        loadApplication();
      } else if (
      action === 'approve' ||
      action === 'reject' ||
      action === 'need-info')
      {
        setModalAction(action as 'approve' | 'reject' | 'need-info');
        setModalOpen(true);
      } else if (action === 'delete') {
        if (
        window.confirm(
          'Are you sure you want to permanently delete this draft?'
        ))
        {
          await deleteApplication(application.id);
          toast.success('Application deleted');
          navigate('/applications');
        }
      } else if (action === 'withdraw') {
        if (
        window.confirm(
          'Are you sure you want to withdraw this application? It will be returned to Draft status.'
        ))
        {
          await withdrawApplication(application.id);
          toast.success('Application withdrawn');
          loadApplication();
        }
      }
    } catch (error: any) {
      console.error('Action failed:', error);
      toast.error(error.message || 'Action failed');
    }
  };
  const handleDecisionSubmit = async (decision: string, comment: string) => {
    if (!application) return;
    try {
      await makeDecision(application.id, decision, comment);
      toast.success('Decision submitted successfully');
      setModalOpen(false);
      loadApplication();
    } catch (error) {
      console.error('Failed to submit decision:', error);
      toast.error('Failed to submit decision');
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text-secondary">Loading application...</div>
      </div>);

  }
  if (!application) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text-secondary">Application not found</div>
      </div>);

  }
  return (
    <div className="space-y-6">
      <ApplicationDetailHeader
        application={application}
        onAction={handleAction} />
      

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-text-primary mb-4">
              Application Details
            </h3>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-xs text-text-secondary">Applicant Name</dt>
                <dd className="text-sm text-text-primary mt-1">
                  {application.applicantName}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-text-secondary">Applicant Email</dt>
                <dd className="text-sm text-text-primary mt-1">
                  {application.applicantEmail}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-text-secondary">Company Name</dt>
                <dd className="text-sm text-text-primary mt-1">
                  {application.companyName}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-text-secondary">
                  Application Type
                </dt>
                <dd className="text-sm text-text-primary mt-1">
                  {application.applicationType}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-text-secondary">Created Date</dt>
                <dd className="text-sm text-text-primary mt-1">
                  {formatDate(application.createdAt)}
                </dd>
              </div>
              {application.submittedAt &&
              <div>
                  <dt className="text-xs text-text-secondary">
                    Submitted Date
                  </dt>
                  <dd className="text-sm text-text-primary mt-1">
                    {formatDate(application.submittedAt)}
                  </dd>
                </div>
              }
              <div className="col-span-2">
                <dt className="text-xs text-text-secondary">Description</dt>
                <dd className="text-sm text-text-primary mt-1 p-3 bg-gray-50 rounded border border-border-color">
                  {application.description}
                </dd>
              </div>
            </dl>
          </Card>

          <ReviewerDecisionCard application={application} />
        </div>

        <div>
          <ActivityTimeline activities={activities} />
        </div>
      </div>

      <ReviewerDecisionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        trackingNumber={application.trackingNumber}
        onSubmit={handleDecisionSubmit} />
      
    </div>);

}