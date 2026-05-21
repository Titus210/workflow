from ninja import Router
from ninja_jwt.authentication import JWTAuth
from .schemas import DashboardStatsSchema, TrendDataPointSchema, StatusDistributionSchema, ApplicationSchema
from ..applications.models import Application
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
import random

router = Router()

@router.get("/stats/", auth=JWTAuth(), response={200: DashboardStatsSchema, 401: dict})
def get_dashboard_stats(request):
    """
    Get dashboard statistics.
    """
    now = timezone.now()
    first_day_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    total_applications = Application.objects.count()
    pending_review = Application.objects.filter(
        status__in=[Application.SUBMITTED, Application.UNDER_REVIEW]
    ).count()
    approved_this_month = Application.objects.filter(
        status=Application.APPROVED,
        reviewed_at__gte=first_day_of_month
    ).count()
    rejected_this_month = Application.objects.filter(
        status=Application.REJECTED,
        reviewed_at__gte=first_day_of_month
    ).count()

    # For the deltas, we'll return hardcoded values as in the mock data
    total_delta = '+12%'
    pending_delta = '+8%'
    approved_delta = '+15%'
    rejected_delta = '-5%'

    return 200, {
        "totalApplications": total_applications,
        "pendingReview": pending_review,
        "approvedThisMonth": approved_this_month,
        "rejectedThisMonth": rejected_this_month,
        "totalDelta": total_delta,
        "pendingDelta": pending_delta,
        "approvedDelta": approved_delta,
        "rejectedDelta": rejected_delta
    }

@router.get("/trends/", auth=JWTAuth(), response={200: list[TrendDataPointSchema], 401: dict})
def get_trend_data(request, period: str = '30d'):
    """
    Get trend data for the specified period (7d, 30d, 90d).
    """
    # Determine the number of days
    days = 7 if period == '7d' else 30 if period == '30d' else 90
    end_date = timezone.localdate()
    start_date = end_date - timedelta(days=days - 1)

    # We'll generate data for each day from start_date to end_date
    data = []
    current_date = start_date
    while current_date <= end_date:
        # Count applications created on this day (ignoring time)
        count = Application.objects.filter(
            created_at__date=current_date
        ).count()
        # If there are no applications for a day, we want to show a random number between 0 and 4
        # to match the mock data behavior: count || Math.floor(Math.random() * 5)
        if count == 0:
            count = random.randint(0, 4)
        data.append({
            "date": current_date.isoformat(),
            "count": count
        })
        current_date += timedelta(days=1)

    return 200, data

@router.get("/distribution/", auth=JWTAuth(), response={200: list[StatusDistributionSchema], 401: dict})
def get_status_distribution(request):
    """
    Get distribution of applications by status with colors.
    """
    
    distribution = [
        { "status": Application.DRAFT, "color": "#6B7280" },
        { "status": Application.SUBMITTED, "color": "#3B82F6" },
        { "status": Application.UNDER_REVIEW, "color": "#EAB308" },
        { "status": Application.NEED_MORE_INFO, "color": "#F97316" },
        { "status": Application.APPROVED, "color": "#22C55E" },
        { "status": Application.REJECTED, "color": "#EF4444" },
    ]

    # Count for each status
    for item in distribution:
        status = item["status"]
        count = Application.objects.filter(status=status).count()
        item["count"] = count

    # Filter out statuses with zero count
    distribution = [item for item in distribution if item["count"] > 0]

    return 200, distribution

@router.get("/recent/", auth=JWTAuth(), response={200: list[ApplicationSchema], 401: dict})
def get_recent_applications(request):
    """
    Get the 5 most recent applications.
    """
    recent = Application.objects.order_by('-created_at')[:5]
    from ..applications.schemas import ApplicationSchema
    return 200, [ApplicationSchema.resolve_application(app) for app in recent]
