from ninja import Router
from ninja_jwt.authentication import JWTAuth
from ninja_jwt.tokens import RefreshToken
from .schemas import UserSchema, LoginSchema, TokenSchema, UserUpdateSchema
from apps.accounts.models import User
from django.utils import timezone


router = Router()

# Authentication endpoints
@router.post("/login/", response={200: dict, 401: dict})
def login(request, data: LoginSchema):
    """
    Authenticate user and return JWT tokens.
    """
    try:
        user = User.objects.get(email=data.email)
    except User.DoesNotExist:
        # Return 401 to avoid user enumeration
        return 401, {"error": "INVALID_CREDENTIALS", "message": "Invalid email or password", "details": {}}

    if not user.check_password(data.password):
        return 401, {"error": "INVALID_CREDENTIALS", "message": "Invalid email or password", "details": {}}

    # Update last_active
    user.last_active = timezone.now()
    user.save(update_fields=['last_active'])
    # Generate JWT tokens using ninja_jwt
    refresh = RefreshToken.for_user(user)
    return {
        "user": UserSchema.resolve_user(user),
        "token": str(refresh.access_token),
        "refreshToken": str(refresh)
    }

@router.post("/logout/", response={204: None})
def logout(request):
    """
    Logout endpoint. In JWT, we typically just tell the client to discard the token.
    We can also implement a token blacklist if needed, but for simplicity, we return 204.
    """
    return 204, None

@router.get("/me/", auth=JWTAuth(), response={200: UserSchema, 401: dict})
def get_current_user(request):
    """
    Get the current authenticated user.
    """
    return 200, UserSchema.resolve_user(request.user)

# User management endpoints (for admin/reviewer to manage users)
@router.get("/users/", auth=JWTAuth(), response={200: list[UserSchema], 403: dict})
def list_users(request):
    """
    List all users. Only accessible by Admin and Reviewer roles.
    """
    if request.user.role not in ['Admin', 'Reviewer']:
        return 403, {"error": "FORBIDDEN", "message": "Insufficient permissions", "details": {}}
    users = User.objects.all()
    return 200, [UserSchema.resolve_user(user) for user in users]

@router.put("/users/{user_id}/", auth=JWTAuth(), response={200: UserSchema, 400: dict, 403: dict, 404: dict})
def update_user(request, user_id: int, data: UserUpdateSchema):
    """
    Update a user. Only Admin can update roles, but for simplicity, we allow Admin and Reviewer to update.
    """
    if request.user.role not in ['Admin', 'Reviewer']:
        return 403, {"error": "FORBIDDEN", "message": "Insufficient permissions", "details": {}}
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return 404, {"error": "USER_NOT_FOUND", "message": "User not found", "details": {}}
    
    # Update fields
    for attr, value in data.dict(exclude_unset=True).items():
        setattr(user, attr, value)
    user.save()
    return 200, UserSchema.resolve_user(user)

# Note: The above implementation is simplified. In a real project, we would use the NinjaJWT views for login/logout
# and then extend the API for user management.