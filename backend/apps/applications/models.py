import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone


class Application(models.Model):
    # Application Type Choices
    APPLICATION_TYPE_CHOICES = [
        ('Recordation', 'Recordation'),
        ('Renewal', 'Renewal'),
        ('Change of Ownership', 'Change of Ownership'),
        ('Change of Name', 'Change of Name'),
        ('Discontinuation', 'Discontinuation'),
    ]
    
    # Status Choices
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('SUBMITTED', 'Submitted'),
        ('UNDER_REVIEW', 'Under Review'),
        ('NEED_MORE_INFO', 'Need More Info'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    
    # Reviewer Decision Choices
    REVIEWER_DECISION_CHOICES = [
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('NEED_MORE_INFO', 'Need More Info'),
    ]
    
    # Class constants for status values
    DRAFT = 'DRAFT'
    SUBMITTED = 'SUBMITTED'
    UNDER_REVIEW = 'UNDER_REVIEW'
    NEED_MORE_INFO = 'NEED_MORE_INFO'
    APPROVED = 'APPROVED'
    REJECTED = 'REJECTED'
    
    # Class constants for application types
    RECORDATION = 'Recordation'
    RENEWAL = 'Renewal'
    CHANGE_OF_OWNERSHIP = 'Change of Ownership'
    CHANGE_OF_NAME = 'Change of Name'
    DISCONTINUATION = 'Discontinuation'
    
    # Class constants for reviewer decisions
    DECISION_APPROVED = 'APPROVED'
    DECISION_REJECTED = 'REJECTED'
    DECISION_NEED_MORE_INFO = 'NEED_MORE_INFO'

    id = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    tracking_number = models.CharField(max_length=50, unique=True)
    applicant_name = models.CharField(max_length=255)
    applicant_email = models.EmailField()
    company_name = models.CharField(max_length=255)
    application_type = models.CharField(max_length=50, choices=APPLICATION_TYPE_CHOICES)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=DRAFT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    submitted_at = models.DateTimeField(blank=True, null=True)
    reviewed_at = models.DateTimeField(blank=True, null=True)
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, blank=True, null=True, related_name='reviewed_applications')
    reviewer_comment = models.TextField(blank=True, null=True)
    reviewer_decision = models.CharField(max_length=20, choices=REVIEWER_DECISION_CHOICES, blank=True, null=True)

    def __str__(self):
        return self.tracking_number

    class Meta:
        indexes = [
            models.Index(fields=['tracking_number']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
            models.Index(fields=['applicant_email']),
        ]


class ActivityLogEntry(models.Model):
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='activity_logs')
    status = models.CharField(max_length=20, choices=Application.STATUS_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, blank=True, null=True)
    comment = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.application.tracking_number} - {self.status} at {self.timestamp}"

    class Meta:
        ordering = ['-timestamp']