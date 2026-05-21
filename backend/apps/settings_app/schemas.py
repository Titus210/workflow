from ninja import Schema
from typing import Optional
from django.contrib.auth.models import User


class UserSchema(Schema):
    id: int
    name: str
    email: str
    role: str
    avatar: Optional[str] = None
    lastActive: Optional[str] = None  # ISO format string


class ProfileUpdateSchema(Schema):
    name: Optional[str] = None
    email: Optional[str] = None
    avatar: Optional[str] = None


class PasswordChangeSchema(Schema):
    current: str
    new: str


class NotificationPrefsSchema(Schema):
    emailNotifications: bool
    pushNotifications: bool
    digestFrequency: str


class AppSettingsSchema(Schema):
    defaultApplicationType: str
    autoAssignReviewer: bool
    commentRequired: bool


class SessionSchema(Schema):
    id: str
    device: str
    location: str
    lastActive: str
    current: bool