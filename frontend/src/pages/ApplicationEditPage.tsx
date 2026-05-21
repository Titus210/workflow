import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ApplicationForm } from '../components/applications/ApplicationForm';
import { getApplication, updateApplication } from '../api/applicationsApi';
import { Application } from '../types/application';
import { canEdit } from '../lib/statusUtils';
export function ApplicationEditPage() {
  const { id } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (id) loadApplication();
  }, [id]);
  const loadApplication = async () => {
    setLoading(true);
    try {
      const data = await getApplication(id!);
      if (!canEdit(data.status)) {
        toast.error('This application cannot be edited in its current status');
        navigate(`/applications/${id}`);
        return;
      }
      setApplication(data);
    } catch (error) {
      console.error('Failed to load application:', error);
      toast.error('Failed to load application');
      navigate('/applications');
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async (data: any) => {
    return await updateApplication(id!, data);
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text-secondary">Loading application...</div>
      </div>);

  }
  if (!application) {
    return null;
  }
  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-text-primary">
          Edit Application
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Update application details
        </p>
      </div>

      <ApplicationForm application={application} onSubmit={handleSubmit} />
    </div>);

}