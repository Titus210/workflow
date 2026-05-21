from ninja import Router, Query
from ninja_jwt.authentication import JWTAuth
from .schemas import (
    ApplicationSchema, ApplicationCreateSchema, ApplicationUpdateSchema,
    ApplicationFiltersSchema, PaginatedResponseSchema, ActivityLogEntrySchema,
    DecisionSchema, StatusUpdateSchema
)
from .models import Application, ActivityLogEntry
from .services import transition, can_edit, can_transition
from apps.accounts.models import User
from django.db.models import Q
from django.utils import timezone
import math

router = Router()

# Helper function to format error responses
def error_response(error_code: str, message: str, details: dict = None, status_code: int = 400):
    if details is None:
        details = {}
    return status_code, {"error": error_code, "message": message, "details": details}

# Application Endpoints
@router.get("/", auth=JWTAuth(), response={200: PaginatedResponseSchema, 400: dict, 401: dict})
def list_applications(request, filters: ApplicationFiltersSchema = Query(...)):
    """
    Get a paginated list of applications with optional filtering by status and search.
    """
    queryset = Application.objects.all()

    if filters is not None:
        if filters.status and filters.status != 'all':
            queryset = queryset.filter(status=filters.status)

        if filters.search:
            search_term = filters.search
            queryset = queryset.filter(
                Q(tracking_number__icontains=search_term) |
                Q(applicant_name__icontains=search_term) |
                Q(company_name__icontains=search_term)
            )

    queryset = queryset.order_by('-created_at')

    page = filters.page if filters else 1
    page_size = filters.pageSize if filters else 10
    total = queryset.count()
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    start = (page - 1) * page_size
    end = start + page_size
    applications = queryset[start:end]

    application_schemas = [ApplicationSchema.resolve_application(app) for app in applications]

    return 200, {
        "data": application_schemas,
        "total": total,
        "page": page,
        "pageSize": page_size,
        "totalPages": total_pages
    }

@router.get("/{application_id}/", auth=JWTAuth(), response={200: ApplicationSchema, 401: dict, 404: dict})
def get_application(request, application_id: str):
    """
    Get a single application by ID.
    """
    try:
        application = Application.objects.get(id=application_id)
    except Application.DoesNotExist:
        return 404, {"error": "APPLICATION_NOT_FOUND", "message": "Application not found", "details": {}}
    return 200, ApplicationSchema.resolve_application(application)

@router.post("/", auth=JWTAuth(), response={201: ApplicationSchema, 400: dict, 401: dict})
def create_application(request, data: ApplicationCreateSchema):
    """
    Create a new application (draft).
    """
    from .utils import generate_tracking_number
    tracking_number = generate_tracking_number()

    application = Application.objects.create(
        tracking_number=tracking_number,
        applicant_name=data.applicantName,
        applicant_email=data.applicantEmail,
        company_name=data.companyName,
        application_type=data.applicationType,
        description=data.description,
        status=Application.DRAFT,
        created_at=timezone.now(),
        updated_at=timezone.now()
    )
    ActivityLogEntry.objects.create(
        application=application,
        status=Application.DRAFT,
        user=request.user,
        comment="Application created"
    )
    return 201, ApplicationSchema.resolve_application(application)

@router.put("/{application_id}/", auth=JWTAuth(), response={200: ApplicationSchema, 400: dict, 401: dict, 403: dict, 404: dict})
def update_application(request, application_id: str, data: ApplicationUpdateSchema):
    """
    Update an application. Only allowed for DRAFT and NEED_MORE_INFO.
    """
    try:
        application = Application.objects.get(id=application_id)
    except Application.DoesNotExist:
        return 404, {"error": "APPLICATION_NOT_FOUND", "message": "Application not found", "details": {}}

    if not can_edit(application):
        return 403, {"error": "EDIT_NOT_ALLOWED", "message": "Application cannot be edited in its current status", "details": {}}

    # Map schema field names (camelCase) to model field names (snake_case)
    field_mapping = {
        'applicantName': 'applicant_name',
        'applicantEmail': 'applicant_email',
        'companyName': 'company_name',
        'applicationType': 'application_type',
        'description': 'description'
    }
    
    for schema_attr, value in data.dict(exclude_unset=True).items():
        model_attr = field_mapping.get(schema_attr, schema_attr)
        setattr(application, model_attr, value)
    application.updated_at = timezone.now()
    application.save()

    return 200, ApplicationSchema.resolve_application(application)

@router.delete("/{application_id}/", auth=JWTAuth(), response={204: None, 400: dict, 401: dict, 403: dict, 404: dict})
def delete_application(request, application_id: str):
    """
    Delete an application. Only allowed for DRAFT.
    """
    try:
        application = Application.objects.get(id=application_id)
    except Application.DoesNotExist:
        return 404, {"error": "APPLICATION_NOT_FOUND", "message": "Application not found", "details": {}}

    if application.status != Application.DRAFT:
        return 403, {"error": "DELETE_NOT_ALLOWED", "message": "Only draft applications can be deleted", "details": {}}

    application.delete()
    return 204, None

@router.post("/{application_id}/submit/", auth=JWTAuth(), response={200: ApplicationSchema, 400: dict, 401: dict, 403: dict, 404: dict})
def submit_application(request, application_id: str):
    """
    Submit an application: DRAFT/NEED_MORE_INFO -> SUBMITTED
    """
    try:
        application = Application.objects.get(id=application_id)
    except Application.DoesNotExist:
        return 404, {"error": "APPLICATION_NOT_FOUND", "message": "Application not found", "details": {}}

    if application.status not in [Application.DRAFT, Application.NEED_MORE_INFO]:
        return 400, {"error": "INVALID_TRANSITION", "message": "Application cannot be submitted from current status", "details": {}}

    try:
        application = transition(application, Application.SUBMITTED, user=request.user)
    except ValueError as e:
        return 400, {"error": "INVALID_TRANSITION", "message": str(e), "details": {}}

    return 200, ApplicationSchema.resolve_application(application)

@router.post("/{application_id}/start-review/", auth=JWTAuth(), response={200: ApplicationSchema, 400: dict, 401: dict, 403: dict, 404: dict})
def start_review(request, application_id: str):
    """
    Start review: SUBMITTED -> UNDER_REVIEW
    Only users with role "Reviewer" or "Admin" can call this.
    """
    try:
        application = Application.objects.get(id=application_id)
    except Application.DoesNotExist:
        return 404, {"error": "APPLICATION_NOT_FOUND", "message": "Application not found", "details": {}}

    if request.user.role not in ['Reviewer', 'Admin']:
        return 403, {"error": "FORBIDDEN", "message": "Insufficient permissions to start review", "details": {}}

    if application.status != Application.SUBMITTED:
        return 400, {"error": "INVALID_TRANSITION", "message": "Application must be submitted to start review", "details": {}}

    try:
        application = transition(application, Application.UNDER_REVIEW, user=request.user)
    except ValueError as e:
        return 400, {"error": "INVALID_TRANSITION", "message": str(e), "details": {}}

    return 200, ApplicationSchema.resolve_application(application)

@router.post("/{application_id}/withdraw/", auth=JWTAuth(), response={200: ApplicationSchema, 400: dict, 401: dict, 403: dict, 404: dict})
def withdraw_application(request, application_id: str):
    """
    Withdraw an application: SUBMITTED -> DRAFT
    """
    try:
        application = Application.objects.get(id=application_id)
    except Application.DoesNotExist:
        return 404, {"error": "APPLICATION_NOT_FOUND", "message": "Application not found", "details": {}}

    if application.status != Application.SUBMITTED:
        return 400, {"error": "INVALID_TRANSITION", "message": "Only submitted applications can be withdrawn", "details": {}}

    try:
        application = transition(application, Application.DRAFT, user=request.user, comment="Application withdrawn by user")
    except ValueError as e:
        return 400, {"error": "INVALID_TRANSITION", "message": str(e), "details": {}}

    return 200, ApplicationSchema.resolve_application(application)

@router.post("/{application_id}/decision/", auth=JWTAuth(), response={200: ApplicationSchema, 400: dict, 401: dict, 403: dict, 404: dict})
def make_decision(request, application_id: str, data: DecisionSchema):
    """
    Make a decision: UNDER_REVIEW -> APPROVED/REJECTED/NEED_MORE_INFO
    Only users with role "Reviewer" or "Admin" can call this.
    Comment is required for REJECTED and NEED_MORE_INFO.
    """
    try:
        application = Application.objects.get(id=application_id)
    except Application.DoesNotExist:
        return 404, {"error": "APPLICATION_NOT_FOUND", "message": "Application not found", "details": {}}

    if request.user.role not in ['Reviewer', 'Admin']:
        return 403, {"error": "FORBIDDEN", "message": "Insufficient permissions to make a decision", "details": {}}

    if application.status != Application.UNDER_REVIEW:
        return 400, {"error": "INVALID_TRANSITION", "message": "Application must be under review to make a decision", "details": {}}

    if data.decision not in [Application.APPROVED, Application.REJECTED, Application.NEED_MORE_INFO]:
        return 400, {"error": "INVALID_DECISION", "message": "Invalid decision", "details": {}}

    if data.decision in [Application.REJECTED, Application.NEED_MORE_INFO] and not data.comment:
        return 400, {"error": "COMMENT_REQUIRED", "message": "Comment is required for this decision", "details": {}}

    try:
        application = transition(application, data.decision, user=request.user, comment=data.comment)
    except ValueError as e:
        return 400, {"error": "INVALID_TRANSITION", "message": str(e), "details": {}}

    return 200, ApplicationSchema.resolve_application(application)

@router.post("/{application_id}/status/", auth=JWTAuth(), response={200: ApplicationSchema, 400: dict, 401: dict, 403: dict, 404: dict, 409: dict})
def update_application_status(request, application_id: str, data: StatusUpdateSchema):
    """
    Kanban shortcut: update status (validates transition)
    """
    try:
        application = Application.objects.get(id=application_id)
    except Application.DoesNotExist:
        return 404, {"error": "APPLICATION_NOT_FOUND", "message": "Application not found", "details": {}}

    if not can_transition(application, data.status):
        return 409, {"error": "INVALID_TRANSITION", "message": f"Cannot transition from {application.status} to {data.status}", "details": {}}

    reviewer_only_targets = {
        Application.UNDER_REVIEW,
        Application.APPROVED,
        Application.REJECTED,
        Application.NEED_MORE_INFO,
    }
    if data.status in reviewer_only_targets and request.user.role not in ["Reviewer", "Admin"]:
        return 403, {"error": "FORBIDDEN", "message": "Insufficient permissions to update status", "details": {}}

    if data.status in [Application.REJECTED, Application.NEED_MORE_INFO] and not data.comment:
        return 400, {"error": "COMMENT_REQUIRED", "message": "Comment is required for this decision", "details": {}}

    try:
        application = transition(application, data.status, user=request.user, comment=data.comment)
    except ValueError as e:
        return 400, {"error": "INVALID_TRANSITION", "message": str(e), "details": {}}

    return 200, ApplicationSchema.resolve_application(application)

@router.get("/{application_id}/activity/", auth=JWTAuth(), response={200: list[ActivityLogEntrySchema], 401: dict, 404: dict})
def get_activity_log(request, application_id: str):
    """
    Get activity log for an application.
    """
    try:
        application = Application.objects.get(id=application_id)
    except Application.DoesNotExist:
        return 404, {"error": "APPLICATION_NOT_FOUND", "message": "Application not found", "details": {}}

    logs = application.activity_logs.order_by("timestamp")
    return 200, [ActivityLogEntrySchema.resolve_activity_log_entry(log) for log in logs]
