import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Application, ApplicationType } from '../../types/application';
interface ApplicationFormProps {
  application?: Application;
  onSubmit: (data: any) => Promise<Application>;
}
export function ApplicationForm({
  application,
  onSubmit
}: ApplicationFormProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    applicantName: '',
    applicantEmail: '',
    companyName: '',
    applicationType: ApplicationType.RECORDATION,
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    if (application) {
      setFormData({
        applicantName: application.applicantName,
        applicantEmail: application.applicantEmail,
        companyName: application.companyName,
        applicationType: application.applicationType,
        description: application.description
      });
    }
  }, [application]);
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.applicantName.trim()) {
      newErrors.applicantName = 'Applicant name is required';
    }
    if (!formData.applicantEmail.trim()) {
      newErrors.applicantEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.applicantEmail)) {
      newErrors.applicantEmail = 'Invalid email format';
    }
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const result = await onSubmit(formData);
      toast.success(
        application ?
        'Application updated successfully' :
        'Application created successfully'
      );
      navigate(`/applications/${result.id}`);
    } catch (error) {
      console.error('Failed to submit application:', error);
      toast.error('Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-text-primary mb-6">
        {application ? 'Edit Application' : 'New Application'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Applicant Name"
          required
          value={formData.applicantName}
          onChange={(e) =>
          setFormData({
            ...formData,
            applicantName: e.target.value
          })
          }
          error={errors.applicantName}
          placeholder="Enter applicant full name" />
        

        <Input
          label="Applicant Email"
          type="email"
          required
          value={formData.applicantEmail}
          onChange={(e) =>
          setFormData({
            ...formData,
            applicantEmail: e.target.value
          })
          }
          error={errors.applicantEmail}
          placeholder="applicant@example.com" />
        

        <Input
          label="Company Name"
          required
          value={formData.companyName}
          onChange={(e) =>
          setFormData({
            ...formData,
            companyName: e.target.value
          })
          }
          error={errors.companyName}
          placeholder="Enter company name" />
        

        <Select
          label="Application Type"
          required
          value={formData.applicationType}
          onChange={(e) =>
          setFormData({
            ...formData,
            applicationType: e.target.value as ApplicationType
          })
          }
          options={[
          {
            value: ApplicationType.RECORDATION,
            label: 'Recordation'
          },
          {
            value: ApplicationType.RENEWAL,
            label: 'Renewal'
          },
          {
            value: ApplicationType.CHANGE_OF_OWNERSHIP,
            label: 'Change of Ownership'
          },
          {
            value: ApplicationType.CHANGE_OF_NAME,
            label: 'Change of Name'
          },
          {
            value: ApplicationType.DISCONTINUATION,
            label: 'Discontinuation'
          }]
          } />
        

        <Textarea
          label="Description"
          required
          value={formData.description}
          onChange={(e) =>
          setFormData({
            ...formData,
            description: e.target.value
          })
          }
          error={errors.description}
          placeholder="Provide detailed information about this application..."
          rows={6}
          maxLength={1000}
          showCount />
        

        <div className="flex justify-between items-center pt-4 border-t border-border-color">
          <button
            type="button"
            onClick={() => navigate('/applications')}
            className="text-sm text-text-secondary hover:text-text-primary">
            
            Cancel
          </button>
          <Button type="submit" disabled={submitting}>
            {submitting ?
            'Submitting...' :
            application ?
            'Update Application' :
            'Create Application'}
          </Button>
        </div>
      </form>
    </Card>);

}