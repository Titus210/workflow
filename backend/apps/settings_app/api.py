from ninja import Router
from ninja_jwt.authentication import JWTAuth
from .schemas import UserSchema, ProfileUpdateSchema, PasswordChangeSchema, NotificationPrefsSchema, AppSettingsSchema, SessionSchema
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from apps.accounts.models import UserSession

User = get_user_model()

router = Router()

# Settings Endpoints
@router.get("/profile/", auth=JWTAuth(), response={200: UserSchema, 401: dict})
def get_profile(request):
    """
    Get current user's profile.
    """
    return 200, {
        "id": request.user.id,
        "name": f"{request.user.first_name} {request.user.last_name}".strip() or request.user.username,
        "email": request.user.email,
        "role": request.user.role,
        "avatar": request.user.avatar,
        "lastActive": request.user.last_active.isoformat() if request.user.last_active else None
    }

@router.put("/profile/", auth=JWTAuth(), response={200: UserSchema, 400: dict, 401: dict})
def update_profile(request, data: ProfileUpdateSchema):
    """
    Update current user's profile.
    """
    user = request.user
    data_dict = data.dict(exclude_unset=True)
    
    # Handle name field (split into first_name and last_name)
    if 'name' in data_dict:
        name_parts = data_dict['name'].split(' ', 1)
        user.first_name = name_parts[0] if len(name_parts) > 0 else ''
        user.last_name = name_parts[1] if len(name_parts) > 1 else ''
    
    # Handle email
    if 'email' in data_dict:
        user.email = data_dict['email']
    
    # Handle avatar
    if 'avatar' in data_dict:
        user.avatar = data_dict['avatar']
    
    user.save()
    
    return 200, {
        "id": user.id,
        "name": f"{user.first_name} {user.last_name}".strip() or user.username,
        "email": user.email,
        "role": user.role,
        "avatar": user.avatar,
        "lastActive": user.last_active.isoformat() if user.last_active else None
    }

@router.post("/password/", auth=JWTAuth(), response={204: None, 400: dict, 401: dict})
def change_password(request, data: PasswordChangeSchema):
    """
    Change password for the current user.
    """
    # Check if old password is correct
    if not request.user.check_password(data.current):
        return 400, {"error": "INVALID_PASSWORD", "message": "Current password is incorrect", "details": {}}
    
    # Set new password
    request.user.set_password(data.new)
    request.user.save()
    
    return 204, None

@router.get("/notifications/", auth=JWTAuth(), response={200: NotificationPrefsSchema, 401: dict})
def get_notification_prefs(request):
    """
    Get notification preferences.
    """
    # In a real app, this would come from a user settings model or database
    # For now, we'll return default values
    return 200, {
        "emailNotifications": True,
        "pushNotifications": False,
        "digestFrequency": "weekly"
    }

@router.put("/notifications/", auth=JWTAuth(), response={200: NotificationPrefsSchema, 401: dict})
def update_notification_prefs(request, data: NotificationPrefsSchema):
    """
    Update notification preferences.
    """
    # In a real app, this would save to a user settings model or database
    # For now, we'll just return the data
    return 200, data

@router.get("/app/", auth=JWTAuth(), response={200: AppSettingsSchema, 401: dict})
def get_app_settings(request):
    """
    Get application settings.
    """
    # In a real app, this might come from a site-wide settings model
    # For now, we'll return default values
    return 200, {
        "defaultApplicationType": "Recordation",
        "autoAssignReviewer": True,
        "commentRequired": True
    }

@router.put("/app/", auth=JWTAuth(), response={200: AppSettingsSchema, 401: dict})
def update_app_settings(request, data: AppSettingsSchema):
    """
    Update application settings.
    """
    # In a real app, this would save to a site-wide settings model
    # For now, we'll just return the data
    return 200, data

@router.get("/team/", auth=JWTAuth(), response={200: list[UserSchema], 401: dict})
def get_team_members(request):
    """
    Get all team members (users).
    """
    users = User.objects.all()
    return 200, [
        {
            "id": user.id,
            "name": f"{user.first_name} {user.last_name}".strip() or user.username,
            "email": user.email,
            "role": user.role,
            "avatar": user.avatar,
            "lastActive": user.last_active.isoformat() if user.last_active else None
        }
        for user in users
    ]

@router.get("/sessions/", auth=JWTAuth(), response={200: list[SessionSchema], 401: dict})
def get_active_sessions(request):
    """
    Get active sessions.
    """
    def humanize(dt):
        delta = timezone.now() - dt
        if delta < timedelta(minutes=1):
            return "just now"
        if delta < timedelta(hours=1):
            minutes = int(delta.total_seconds() // 60)
            return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
        if delta < timedelta(days=1):
            hours = int(delta.total_seconds() // 3600)
            return f"{hours} hour{'s' if hours != 1 else ''} ago"
        days = delta.days
        return f"{days} day{'s' if days != 1 else ''} ago"

    sessions = UserSession.objects.filter(user=request.user).order_by("-last_active")
    return 200, [
        {
            "id": str(session.id),
            "device": session.device,
            "location": session.location or "Unknown",
            "lastActive": humanize(session.last_active),
            "current": session.current,
        }
        for session in sessions
    ]

@router.delete("/sessions/{session_id}/", auth=JWTAuth(), response={204: None, 400: dict, 401: dict, 404: dict})
def terminate_session(request, session_id: str):
    """
    Terminate a session.
    """
    try:
        session = UserSession.objects.get(id=session_id, user=request.user)
    except UserSession.DoesNotExist:
        return 404, {"error": "SESSION_NOT_FOUND", "message": "Session not found", "details": {}}

    if session.current:
        return 400, {"error": "CURRENT_SESSION", "message": "Cannot revoke current session", "details": {}}

    session.delete()
    return 204, None
