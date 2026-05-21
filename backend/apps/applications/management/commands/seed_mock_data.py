from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.applications.models import ActivityLogEntry, Application
from apps.accounts.models import UserSession


class Command(BaseCommand):
    help = "Seed stable mock users and applications for local development"

    def handle(self, *args, **options):
        user_model = get_user_model()

        users = {
            "admin@example.com": {
                "username": "admin",
                "password": "adminpass123",
                "first_name": "Admin",
                "last_name": "User",
                "role": "Admin",
                "is_staff": True,
                "is_superuser": True,
            },
            "reviewer@example.com": {
                "username": "reviewer",
                "password": "reviewerpass123",
                "first_name": "John",
                "last_name": "Reviewer",
                "role": "Reviewer",
                "is_staff": False,
                "is_superuser": False,
            },
            "applicant@example.com": {
                "username": "applicant",
                "password": "applicantpass123",
                "first_name": "John",
                "last_name": "Doe",
                "role": "Applicant",
                "is_staff": False,
                "is_superuser": False,
            },
        }

        created_users = {}
        for email, payload in users.items():
            password = payload.pop("password")
            user, created = user_model.objects.get_or_create(
                email=email,
                defaults=payload,
            )
            for field, value in payload.items():
                setattr(user, field, value)
            user.set_password(password)
            user.save()
            created_users[email] = user
            payload["password"] = password
            self.stdout.write(
                self.style.SUCCESS(f"{'Created' if created else 'Updated'} user {email}")
            )

        now = timezone.now()
        seed_rows = [
            {
                "tracking_number": "MOCK-APP-001",
                "applicant_name": "John Doe",
                "applicant_email": "applicant@example.com",
                "company_name": "Acme Corporation",
                "application_type": Application.RECORDATION,
                "description": "Seeded draft application for local development.",
                "status": Application.DRAFT,
                "days_ago": 15,
                "reviewed_by": None,
                "reviewer_comment": None,
                "reviewer_decision": None,
            },
            {
                "tracking_number": "MOCK-APP-002",
                "applicant_name": "Sarah Johnson",
                "applicant_email": "sarah.johnson@example.com",
                "company_name": "TechVision Inc",
                "application_type": Application.RENEWAL,
                "description": "Seeded submitted application for local development.",
                "status": Application.SUBMITTED,
                "days_ago": 12,
                "reviewed_by": None,
                "reviewer_comment": None,
                "reviewer_decision": None,
            },
            {
                "tracking_number": "MOCK-APP-003",
                "applicant_name": "Michael Chen",
                "applicant_email": "michael.chen@example.com",
                "company_name": "Global Innovations Ltd",
                "application_type": Application.CHANGE_OF_OWNERSHIP,
                "description": "Seeded under-review application for local development.",
                "status": Application.UNDER_REVIEW,
                "days_ago": 10,
                "reviewed_by": created_users["reviewer@example.com"],
                "reviewer_comment": None,
                "reviewer_decision": None,
            },
            {
                "tracking_number": "MOCK-APP-004",
                "applicant_name": "Emily Rodriguez",
                "applicant_email": "emily.rodriguez@example.com",
                "company_name": "Precision Engineering Co",
                "application_type": Application.CHANGE_OF_NAME,
                "description": "Seeded need-more-info application for local development.",
                "status": Application.NEED_MORE_INFO,
                "days_ago": 8,
                "reviewed_by": created_users["reviewer@example.com"],
                "reviewer_comment": "Please upload missing transfer documents.",
                "reviewer_decision": Application.NEED_MORE_INFO,
            },
            {
                "tracking_number": "MOCK-APP-005",
                "applicant_name": "David Kim",
                "applicant_email": "david.kim@example.com",
                "company_name": "NextGen Solutions",
                "application_type": Application.DISCONTINUATION,
                "description": "Seeded approved application for local development.",
                "status": Application.APPROVED,
                "days_ago": 6,
                "reviewed_by": created_users["reviewer@example.com"],
                "reviewer_comment": "All documentation is in order.",
                "reviewer_decision": Application.APPROVED,
            },
            {
                "tracking_number": "MOCK-APP-006",
                "applicant_name": "Jessica Williams",
                "applicant_email": "jessica.williams@example.com",
                "company_name": "Quantum Dynamics",
                "application_type": Application.RECORDATION,
                "description": "Seeded rejected application for local development.",
                "status": Application.REJECTED,
                "days_ago": 4,
                "reviewed_by": created_users["reviewer@example.com"],
                "reviewer_comment": "Missing required notarized documents.",
                "reviewer_decision": Application.REJECTED,
            },
        ]

        for row in seed_rows:
            created_at = now - timedelta(days=row["days_ago"])
            submitted_at = created_at + timedelta(days=1) if row["status"] != Application.DRAFT else None
            reviewed_at = (
                submitted_at + timedelta(days=2)
                if row["status"] in [Application.UNDER_REVIEW, Application.NEED_MORE_INFO, Application.APPROVED, Application.REJECTED]
                else None
            )

            app, created = Application.objects.update_or_create(
                tracking_number=row["tracking_number"],
                defaults={
                    "applicant_name": row["applicant_name"],
                    "applicant_email": row["applicant_email"],
                    "company_name": row["company_name"],
                    "application_type": row["application_type"],
                    "description": row["description"],
                    "status": row["status"],
                    "submitted_at": submitted_at,
                    "reviewed_at": reviewed_at,
                    "reviewed_by": row["reviewed_by"],
                    "reviewer_comment": row["reviewer_comment"],
                    "reviewer_decision": row["reviewer_decision"],
                },
            )

            Application.objects.filter(pk=app.pk).update(
                created_at=created_at,
                updated_at=reviewed_at or submitted_at or created_at,
                submitted_at=submitted_at,
                reviewed_at=reviewed_at,
            )
            app.refresh_from_db()

            ActivityLogEntry.objects.filter(application=app).delete()

            activity_steps = [
                (Application.DRAFT, created_at, created_users["applicant@example.com"], "Application created"),
            ]
            if submitted_at:
                activity_steps.append(
                    (Application.SUBMITTED, submitted_at, created_users["applicant@example.com"], None)
                )
            if row["status"] in [Application.UNDER_REVIEW, Application.NEED_MORE_INFO, Application.APPROVED, Application.REJECTED]:
                activity_steps.append(
                    (Application.UNDER_REVIEW, submitted_at + timedelta(days=1), created_users["reviewer@example.com"], None)
                )
            if row["status"] in [Application.NEED_MORE_INFO, Application.APPROVED, Application.REJECTED]:
                activity_steps.append(
                    (
                        row["status"],
                        reviewed_at,
                        created_users["reviewer@example.com"],
                        row["reviewer_comment"],
                    )
                )

            for status, timestamp, user, comment in activity_steps:
                log = ActivityLogEntry.objects.create(
                    application=app,
                    status=status,
                    user=user,
                    comment=comment,
                )
                ActivityLogEntry.objects.filter(pk=log.pk).update(timestamp=timestamp)

            self.stdout.write(
                self.style.SUCCESS(
                    f"{'Created' if created else 'Updated'} application {row['tracking_number']}"
                )
            )

        # Seed a couple of non-current sessions for the admin user for UI testing.
        admin_user = created_users["admin@example.com"]
        UserSession.objects.filter(user=admin_user, current=False).delete()
        UserSession.objects.create(
            user=admin_user,
            device="Safari on iPhone",
            location="Remote",
            last_active=timezone.now() - timedelta(hours=2),
            current=False,
        )
        UserSession.objects.create(
            user=admin_user,
            device="Firefox on Windows",
            location="Remote",
            last_active=timezone.now() - timedelta(days=1),
            current=False,
        )
