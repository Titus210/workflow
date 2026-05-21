import { Status } from '../types/application';

export const statusLabels: Record<Status, string> = {
  [Status.DRAFT]: 'Draft',
  [Status.SUBMITTED]: 'Submitted',
  [Status.UNDER_REVIEW]: 'Under Review',
  [Status.NEED_MORE_INFO]: 'Need More Info',
  [Status.APPROVED]: 'Approved',
  [Status.REJECTED]: 'Rejected'
};

export const statusColors: Record<
  Status,
  {bg: string;text: string;border: string;}> =
{
  [Status.DRAFT]: {
    bg: 'bg-gray-50 dark:bg-gray-800/50',
    text: 'text-gray-700 dark:text-gray-300',
    border: 'border-gray-200 dark:border-gray-700'
  },
  [Status.SUBMITTED]: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800'
  },
  [Status.UNDER_REVIEW]: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    text: 'text-yellow-700 dark:text-yellow-300',
    border: 'border-yellow-200 dark:border-yellow-800'
  },
  [Status.NEED_MORE_INFO]: {
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-200 dark:border-orange-800'
  },
  [Status.APPROVED]: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-200 dark:border-green-800'
  },
  [Status.REJECTED]: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-200 dark:border-red-800'
  }
};

export const allowedTransitions: Record<Status, Status[]> = {
  [Status.DRAFT]: [Status.SUBMITTED],
  [Status.SUBMITTED]: [Status.UNDER_REVIEW],
  [Status.UNDER_REVIEW]: [
  Status.APPROVED,
  Status.REJECTED,
  Status.NEED_MORE_INFO],

  [Status.NEED_MORE_INFO]: [Status.SUBMITTED],
  [Status.APPROVED]: [],
  [Status.REJECTED]: []
};

export const canEdit = (status: Status): boolean => {
  return status === Status.DRAFT || status === Status.NEED_MORE_INFO;
};

export const isTerminal = (status: Status): boolean => {
  return status === Status.APPROVED || status === Status.REJECTED;
};

export interface ActionButton {
  label: string;
  variant: 'primary' | 'secondary' | 'danger' | 'ghost';
  action: string;
  tooltip: string;
}

export const getActionButtons = (status: Status): ActionButton[] => {
  switch (status) {
    case Status.DRAFT:
      return [
      {
        label: 'Delete',
        variant: 'danger',
        action: 'delete',
        tooltip: 'Permanently delete this draft'
      },
      {
        label: 'Edit',
        variant: 'secondary',
        action: 'edit',
        tooltip: 'Edit application details'
      },
      {
        label: 'Submit',
        variant: 'primary',
        action: 'submit',
        tooltip: 'Move application from Draft to Submitted'
      }];

    case Status.SUBMITTED:
      return [
      {
        label: 'Withdraw',
        variant: 'secondary',
        action: 'withdraw',
        tooltip: 'Move application back to Draft'
      },
      {
        label: 'Start Review',
        variant: 'primary',
        action: 'start-review',
        tooltip: 'Move application to Under Review'
      }];

    case Status.UNDER_REVIEW:
      return [
      {
        label: 'Approve',
        variant: 'primary',
        action: 'approve',
        tooltip: 'Approve this application'
      },
      {
        label: 'Reject',
        variant: 'danger',
        action: 'reject',
        tooltip: 'Reject this application (requires comment)'
      },
      {
        label: 'Need More Info',
        variant: 'secondary',
        action: 'need-info',
        tooltip: 'Request more information (requires comment)'
      }];

    case Status.NEED_MORE_INFO:
      return [
      {
        label: 'Edit',
        variant: 'secondary',
        action: 'edit',
        tooltip: 'Edit application details to address comments'
      },
      {
        label: 'Resubmit',
        variant: 'primary',
        action: 'resubmit',
        tooltip: 'Submit updated application for review'
      }];

    case Status.APPROVED:
    case Status.REJECTED:
      return [];
    default:
      return [];
  }
};