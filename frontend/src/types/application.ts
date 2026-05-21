export enum Status {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  NEED_MORE_INFO = 'NEED_MORE_INFO',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum ApplicationType {
  RECORDATION = 'Recordation',
  RENEWAL = 'Renewal',
  CHANGE_OF_OWNERSHIP = 'Change of Ownership',
  CHANGE_OF_NAME = 'Change of Name',
  DISCONTINUATION = 'Discontinuation',
}

export interface Application {
  id: string;
  trackingNumber: string;
  applicantName: string;
  applicantEmail: string;
  companyName: string;
  applicationType: ApplicationType;
  description: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewerComment?: string;
  reviewerDecision?: 'APPROVED' | 'REJECTED' | 'NEED_MORE_INFO';
}

export interface ActivityLogEntry {
  id: string;
  applicationId: string;
  status: Status;
  timestamp: string;
  user: string;
  comment?: string;
}

export interface DashboardStats {
  totalApplications: number;
  pendingReview: number;
  approvedThisMonth: number;
  rejectedThisMonth: number;
  totalDelta: string;
  pendingDelta: string;
  approvedDelta: string;
  rejectedDelta: string;
}

export interface TrendDataPoint {
  date: string;
  count: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
  color: string;
}