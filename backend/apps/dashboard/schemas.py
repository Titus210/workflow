from ninja import Schema
from typing import List, Optional
from ..applications.models import Application
from ..applications.schemas import ApplicationSchema


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