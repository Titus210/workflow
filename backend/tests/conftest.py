import pytest
import uuid
from django.contrib.auth import get_user_model

User = get_user_model()

def make_unique_username(base):
    unique_id = uuid.uuid4().hex[:8]
    return f"{base}_{unique_id}"

def make_unique_email(base):
    unique_id = uuid.uuid4().hex[:8]
    return f"{base}_{unique_id}@example.com"

@pytest.fixture(scope="session")
def client():
    from config.api import api
    from ninja.testing import TestClient
    return TestClient(api)

@pytest.fixture
def admin_user():
    username = make_unique_username("admin")
    email = make_unique_email("admin")
    return User.objects.create_superuser(
        username=username,
        email=email,
        password='adminpass123',
        first_name='Admin',
        last_name='User',
        role='Admin'
    )

@pytest.fixture
def reviewer_user():
    username = make_unique_username("reviewer")
    email = make_unique_email("reviewer")
    return User.objects.create_user(
        username=username,
        email=email,
        password='reviewerpass123',
        first_name='John',
        last_name='Reviewer',
        role='Reviewer'
    )

@pytest.fixture
def applicant_user():
    username = make_unique_username("applicant")
    email = make_unique_email("applicant")
    return User.objects.create_user(
        username=username,
        email=email,
        password='applicantpass123',
        first_name='John',
        last_name='Doe',
        role='Applicant'
    )

@pytest.fixture
def admin_token(client, admin_user):
    response = client.post('/auth/login/', json={
        'email': admin_user.email,
        'password': 'adminpass123'
    })
    assert response.status_code == 200
    return response.json()['token']

@pytest.fixture
def reviewer_token(client, reviewer_user):
    response = client.post('/auth/login/', json={
        'email': reviewer_user.email,
        'password': 'reviewerpass123'
    })
    assert response.status_code == 200
    return response.json()['token']

@pytest.fixture
def applicant_token(client, applicant_user):
    response = client.post('/auth/login/', json={
        'email': applicant_user.email,
        'password': 'applicantpass123'
    })
    assert response.status_code == 200
    return response.json()['token']

@pytest.fixture
def auth_headers(admin_token):
    return {'Authorization': f'Bearer {admin_token}'}

@pytest.fixture
def reviewer_auth_headers(reviewer_token):
    return {'Authorization': f'Bearer {reviewer_token}'}

@pytest.fixture
def applicant_auth_headers(applicant_token):
    return {'Authorization': f'Bearer {applicant_token}'}
