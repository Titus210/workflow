from django.contrib.auth.models import AbstractUser
from django.db import models


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