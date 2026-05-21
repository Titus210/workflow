import { Status, ApplicationType } from '../types/application';

const companies = [
'Acme Corporation',
'TechVision Inc',
'Global Innovations Ltd',
'Precision Engineering Co',
'NextGen Solutions',
'Quantum Dynamics',
'Stellar Industries',
'Apex Technologies',
'Horizon Enterprises',
'Vertex Systems'];


const names = [
'Sarah Johnson',
'Michael Chen',
'Emily Rodriguez',
'David Kim',
'Jessica Williams',
'Robert Martinez',
'Amanda Taylor',
'Christopher Lee',
'Jennifer Brown',
'Daniel Anderson',
'Lisa Thompson',
'James Wilson',
'Maria Garcia',
'John Davis',
'Patricia Miller'];


const generateTrackingNumber = (index) => {
  const date = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `APP-${dateStr}-${random}`;
};

const statuses = [
Status.DRAFT,
Status.SUBMITTED,
Status.UNDER_REVIEW,
Status.NEED_MORE_INFO,
Status.APPROVED,
Status.REJECTED];


const applicationTypes = [
ApplicationType.RECORDATION,
ApplicationType.RENEWAL,
ApplicationType.CHANGE_OF_OWNERSHIP,
ApplicationType.CHANGE_OF_NAME,
ApplicationType.DISCONTINUATION];


export const mockApplications = Array.from({ length: 20 }, (_, i) => {
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const createdAt = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString();
  const hasReview = [Status.APPROVED, Status.REJECTED, Status.NEED_MORE_INFO].includes(status);

  return {
    id: `app-${i + 1}`,
    trackingNumber: generateTrackingNumber(i),
    applicantName: names[Math.floor(Math.random() * names.length)],
    applicantEmail: `user${i + 1}@example.com`,
    companyName: companies[Math.floor(Math.random() * companies.length)],
    applicationType: applicationTypes[Math.floor(Math.random() * applicationTypes.length)],
    description: `This application is for ${applicationTypes[Math.floor(Math.random() * applicationTypes.length)].toLowerCase()} of intellectual property rights. The submission includes all required documentation and supporting materials for review by the examining authority.`,
    status,
    createdAt,
    updatedAt: createdAt,
    submittedAt: status !== Status.DRAFT ? new Date(new Date(createdAt).getTime() + 24 * 60 * 60 * 1000).toISOString() : undefined,
    reviewedAt: hasReview ? new Date(new Date(createdAt).getTime() + 5 * 24 * 60 * 60 * 1000).toISOString() : undefined,
    reviewedBy: hasReview ? 'John Reviewer' : undefined,
    reviewerComment: hasReview ?
    status === Status.APPROVED ?
    'All documentation is in order. Application approved.' :
    status === Status.REJECTED ?
    'Application does not meet the minimum requirements. Missing critical documentation.' :
    'Additional information required regarding ownership transfer documentation.' :
    undefined,
    reviewerDecision: hasReview ? status === Status.APPROVED ? 'APPROVED' : status === Status.REJECTED ? 'REJECTED' : 'NEED_MORE_INFO' : undefined
  };
});

export const mockActivityLogs = mockApplications.reduce((acc, app) => {
  const logs = [
  {
    id: `${app.id}-log-1`,
    applicationId: app.id,
    status: Status.DRAFT,
    timestamp: app.createdAt,
    user: app.applicantName
  }];


  if (app.status !== Status.DRAFT) {
    logs.push({
      id: `${app.id}-log-2`,
      applicationId: app.id,
      status: Status.SUBMITTED,
      timestamp: app.submittedAt,
      user: app.applicantName
    });
  }

  if ([Status.UNDER_REVIEW, Status.APPROVED, Status.REJECTED, Status.NEED_MORE_INFO].includes(app.status)) {
    logs.push({
      id: `${app.id}-log-3`,
      applicationId: app.id,
      status: Status.UNDER_REVIEW,
      timestamp: new Date(new Date(app.submittedAt).getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      user: 'John Reviewer'
    });
  }

  if ([Status.APPROVED, Status.REJECTED, Status.NEED_MORE_INFO].includes(app.status)) {
    logs.push({
      id: `${app.id}-log-4`,
      applicationId: app.id,
      status: app.status,
      timestamp: app.reviewedAt,
      user: app.reviewedBy,
      comment: app.reviewerComment
    });
  }

  acc[app.id] = logs;
  return acc;
}, {});

export const mockUser = {
  id: 'user-1',
  name: 'Alex Morgan',
  email: 'alex.morgan@example.com',
  role: 'Admin',
  avatar: null
};

export const mockTeamMembers = [
{ id: '1', name: 'Alex Morgan', email: 'alex.morgan@example.com', role: 'Admin', lastActive: '2 hours ago' },
{ id: '2', name: 'John Reviewer', email: 'john.reviewer@example.com', role: 'Reviewer', lastActive: '5 minutes ago' },
{ id: '3', name: 'Sarah Johnson', email: 'sarah.j@example.com', role: 'Applicant', lastActive: '1 day ago' },
{ id: '4', name: 'Michael Chen', email: 'michael.c@example.com', role: 'Reviewer', lastActive: '3 hours ago' },
{ id: '5', name: 'Emily Rodriguez', email: 'emily.r@example.com', role: 'Applicant', lastActive: '2 days ago' }];