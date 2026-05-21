from ninja import Schema, Query
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from .models import Application, ActivityLogEntry
from apps.accounts.models import User


class ApplicationType(str):
    RECORDATION = 'Recordation'
    RENEWAL = 'Renewal'
    CHANGE_OF_OWNERSHIP = 'Change of Ownership'
    CHANGE_OF_NAME = 'Change of Name'
    DISCONTINUATION = 'Discontinuation'


class ApplicationStatus(str):
    DRAFT = 'DRAFT'
    SUBMITTED = 'SUBMITTED'
    UNDER_REVIEW = 'UNDER_REVIEW'
    NEED_MORE_INFO = 'NEED_MORE_INFO'
    APPROVED = 'APPROVED'
    REJECTED = 'REJECTED'


class ReviewerDecision(str):
    APPROVED = 'APPROVED'
    REJECTED = 'REJECTED'
    NEED_MORE_INFO = 'NEED_MORE_INFO'


class ActivityLogEntrySchema(Schema):
    id: int
    applicationId: str
    status: str
    timestamp: str  # ISO format string
    user: Optional[str] = None  # Username or full name? We'll use the user's full name or username.
    comment: Optional[str] = None

    @staticmethod
    def resolve_activity_log_entry(instance: ActivityLogEntry):
        # Resolve user to a string: first_name + last_name or username
        user_name = None
        if instance.user:
            first = instance.user.first_name.strip()
            last = instance.user.last_name.strip()
            if first or last:
                user_name = f"{first} {last}".strip()
            else:
                user_name = instance.user.username
        return {
            "id": instance.id,
            "applicationId": str(instance.application.id),
            "status": instance.status,
            "timestamp": instance.timestamp.isoformat(),
            "user": user_name,
            "comment": instance.comment
        }


class ApplicationSchema(Schema):
    id: str
    trackingNumber: str
    applicantName: str
    applicantEmail: str
    companyName: str
    applicationType: str
    description: str
    status: str
    createdAt: str  # ISO format string
    updatedAt: str  # ISO format string
    submittedAt: Optional[str] = None  # ISO format string
    reviewedAt: Optional[str] = None  # ISO format string
    reviewedBy: Optional[str] = None  # Username or full name
    withdrawnAt: Optional[str] = None  # ISO format string
    reviewerComment: Optional[str] = None
    reviewerDecision: Optional[str] = None

    @staticmethod
    def resolve_application(instance: Application):
        reviewed_by_name = None
        if instance.reviewed_by:
            first = instance.reviewed_by.first_name.strip()
            last = instance.reviewed_by.last_name.strip()
            if first or last:
                reviewed_by_name = f"{first} {last}".strip()
            else:
                reviewed_by_name = instance.reviewed_by.username
        withdrawn_at = None
        withdrawal_log = instance.activity_logs.filter(comment="Application withdrawn by user").order_by("-timestamp").first()
        if withdrawal_log:
            withdrawn_at = withdrawal_log.timestamp.isoformat()
        return {
            "id": str(instance.id),
            "trackingNumber": instance.tracking_number,
            "applicantName": instance.applicant_name,
            "applicantEmail": instance.applicant_email,
            "companyName": instance.company_name,
            "applicationType": instance.application_type,
            "description": instance.description,
            "status": instance.status,
            "createdAt": instance.created_at.isoformat(),
            "updatedAt": instance.updated_at.isoformat(),
            "submittedAt": instance.submitted_at.isoformat() if instance.submitted_at else None,
            "reviewedAt": instance.reviewed_at.isoformat() if instance.reviewed_at else None,
            "reviewedBy": reviewed_by_name,
            "withdrawnAt": withdrawn_at,
            "reviewerComment": instance.reviewer_comment,
            "reviewerDecision": instance.reviewer_decision
        }


class ApplicationCreateSchema(Schema):
    applicantName: str
    applicantEmail: str
    companyName: str
    applicationType: str
    description: str


class ApplicationUpdateSchema(Schema):
    applicantName: Optional[str] = None
    applicantEmail: Optional[str] = None
    companyName: Optional[str] = None
    applicationType: Optional[str] = None
    description: Optional[str] = None


class ApplicationFiltersSchema(Schema):
    status: Optional[str] = None
    search: Optional[str] = None
    page: int = 1
    pageSize: int = 10


class PaginatedResponseSchema(Schema):
    data: List[ApplicationSchema]
    total: int
    page: int
    pageSize: int
    totalPages: int


class DashboardStatsSchema(Schema):
    totalApplications: int
    pendingReview: int
    approvedThisMonth: int
    rejectedThisMonth: int
    totalDelta: str
    pendingDelta: str
    approvedDelta: str
    rejectedDelta: str


class TrendDataPointSchema(Schema):
    date: str  # YYYY-MM-DD
    count: int


class StatusDistributionSchema(Schema):
    status: str
    count: int
    color: str


class NotificationPrefsSchema(Schema):
    emailNotifications: bool
    pushNotifications: bool
    digestFrequency: str


class AppSettingsSchema(Schema):
    defaultApplicationType: str
    autoAssignReviewer: bool
    commentRequired: bool


class UserSchema(Schema):
    id: int
    name: str
    email: str
    role: str
    avatar: Optional[str] = None
    lastActive: Optional[str] = None  # ISO format string

    @staticmethod
    def resolve_user(instance: User):
        return {
            "id": instance.id,
            "name": f"{instance.first_name} {instance.last_name}".strip() or instance.username,
            "email": instance.email,
            "role": instance.role,
            "avatar": instance.avatar,
            "lastActive": instance.last_active.isoformat() if instance.last_active else None
        }


class SessionSchema(Schema):
    id: str
    device: str
    location: str
    lastActive: str
    current: bool


# New schemas for decision and status update
class DecisionSchema(Schema):
    decision: str
    comment: Optional[str] = None


class StatusUpdateSchema(Schema):
    status: str
    comment: Optional[str] = None
