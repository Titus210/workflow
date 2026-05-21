from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
import uuid


class User(AbstractUser):
    ROLE_CHOICES = [
        ('Admin', 'Admin'),
        ('Reviewer', 'Reviewer'),
        ('Applicant', 'Applicant'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='Applicant')
    avatar = models.URLField(blank=True, null=True)
    last_active = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return self.username


class UserSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sessions",
    )
    device = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True, default="")
    last_active = models.DateTimeField()
    current = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["user", "last_active"]),
        ]
