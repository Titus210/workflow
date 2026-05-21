import React from 'react';
import { ApplicationForm } from '../components/applications/ApplicationForm';
import { createApplication } from '../api/applicationsApi';
export function ApplicationCreatePage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-text-primary">
          Create Application
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Submit a new intellectual property application
        </p>
      </div>

      <ApplicationForm onSubmit={createApplication} />
    </div>);

}