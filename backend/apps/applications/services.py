from typing import Set
from django.utils import timezone
from apps.accounts.models import User
from .models import Application, ActivityLogEntry


# Define allowed transitions as per the workflow state machine
ALLOWED_TRANSITIONS = {
    Application.DRAFT: {Application.SUBMITTED},
    Application.SUBMITTED: {Application.UNDER_REVIEW, Application.DRAFT},  # DRAFT via withdraw
    Application.UNDER_REVIEW: {Application.APPROVED, Application.REJECTED, Application.NEED_MORE_INFO},
    Application.NEED_MORE_INFO: {Application.SUBMITTED},
    Application.APPROVED: set(),
    Application.REJECTED: set(),
}


def transition(application: Application, new_status: str, user: User = None, comment: str = None) -> Application:
    """
    Transition an application to a new status, creating an activity log entry.
    Enforces the workflow rules.
    """
    current_status = application.status
    if new_status not in ALLOWED_TRANSITIONS[current_status]:
        raise ValueError(f"Invalid transition from {current_status} to {new_status}")

    # Additional rules:
    # - Comments are REQUIRED for REJECTED and NEED_MORE_INFO decisions
    if new_status in [Application.REJECTED, Application.NEED_MORE_INFO] and not comment:
        raise ValueError(f"Comment is required for transition to {new_status}")

    # - Only DRAFT and NEED_MORE_INFO applications can be edited (PUT)
    # This rule is enforced in the API layer, not here.

    # - APPROVED and REJECTED are terminal states - no modifications allowed
    # This is also enforced in the API layer by not allowing PUT on terminal states.

    # Update the application
    application.status = new_status
    application.updated_at = timezone.now()

    # Set additional fields based on the transition
    if new_status == Application.SUBMITTED:
        application.submitted_at = timezone.now()
        if current_status == Application.NEED_MORE_INFO:
            application.reviewed_at = None
            application.reviewed_by = None
            application.reviewer_comment = None
            application.reviewer_decision = None
    elif new_status == Application.UNDER_REVIEW:
        application.reviewed_at = timezone.now()
        application.reviewed_by = user
    elif new_status in [Application.APPROVED, Application.REJECTED, Application.NEED_MORE_INFO]:
        application.reviewed_at = timezone.now()
        application.reviewed_by = user
        if new_status == Application.REJECTED:
            application.reviewer_comment = comment
            application.reviewer_decision = Application.REJECTED
        elif new_status == Application.NEED_MORE_INFO:
            application.reviewer_comment = comment
            application.reviewer_decision = Application.NEED_MORE_INFO
        elif new_status == Application.APPROVED:
            application.reviewer_comment = comment
            application.reviewer_decision = Application.APPROVED
    elif new_status == Application.DRAFT and current_status == Application.SUBMITTED:
        application.reviewed_at = None
        application.reviewed_by = None
        application.reviewer_comment = None
        application.reviewer_decision = None

    application.save()

    # Create activity log entry
    ActivityLogEntry.objects.create(
        application=application,
        status=new_status,
        user=user,
        comment=comment
    )

    return application


def can_edit(application: Application) -> bool:
    """
    Check if the application can be edited (only DRAFT and NEED_MORE_INFO).
    """
    return application.status in [Application.DRAFT, Application.NEED_MORE_INFO]


def can_transition(application: Application, new_status: str) -> bool:
    """
    Check if a transition is allowed.
    """
    return new_status in ALLOWED_TRANSITIONS[application.status]
