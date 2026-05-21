from ninja import Schema
from typing import Optional
from apps.accounts.models import User


class UserSchema(Schema):
    id: int
    name: str
    email: str
    role: str 
    avatar: Optional[str] = None
    lastActive: Optional[str] = None  # ISO format string

    @classmethod
    def resolve_user(cls, instance: User):
        # Compute name: first_name + last_name, or username if both are empty
        first = instance.first_name.strip()
        last = instance.last_name.strip()
        if first or last:
            name = f"{first} {last}".strip()
        else:
            name = instance.username
        return {
            "id": instance.id,
            "name": name,
            "email": instance.email,
            "role": instance.role,
            "avatar": instance.avatar,
            "lastActive": instance.last_active.isoformat() if instance.last_active else None
        }

    class Config:
        from_attributes = True


class LoginSchema(Schema):
    email: str
    password: str


class TokenSchema(Schema):
    access: str
    refresh: str


class UserUpdateSchema(Schema):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    avatar: Optional[str] = None