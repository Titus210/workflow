from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Application, ActivityLogEntry


@receiver(pre_save, sender=Application)
def application_pre_save(sender, instance, **kwargs):
    """
    Store the old status before saving to detect changes.
    """
    if instance.pk:
        try:
            old_instance = Application.objects.get(pk=instance.pk)
            instance._old_status = old_instance.status
        except Application.DoesNotExist:
            instance._old_status = None
    else:
        instance._old_status = None


@receiver(post_save, sender=Application)
def application_post_save(sender, instance, created, **kwargs):
    """
    Create activity log entry when application status changes.
    """
    # If this is a new application, we don't create an activity log here
    # because it's handled in the create endpoint.
    if created:
        return

    # Check if status changed
    if hasattr(instance, '_old_status') and instance._old_status != instance.status:
        # Determine who made the change - we don't have the user in the signal,
        # so we'll set it to None and let the API handles set the user properly.
        # However, we can try to get the user from the request if available,
        # but that's complex. Instead, we'll rely on the API to create logs.
        # For now, we'll skip creating logs in signals and let the API handle it.
        # But to follow the requirement, we'll create a log with user=None.
        ActivityLogEntry.objects.create(
            application=instance,
            status=instance.status,
            user=None,  # We don't have the user here
            comment=f"Status changed from {instance._old_status} to {instance.status}"
        )