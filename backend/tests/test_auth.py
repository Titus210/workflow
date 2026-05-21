import pytest
from django.contrib.auth import get_user_model

User = get_user_model()

@pytest.mark.django_db
def test_login_success(client, admin_user):
    response = client.post('/auth/login/', json={
        'email': admin_user.email,
        'password': 'adminpass123'
    })
    assert response.status_code == 200
    data = response.json()
    assert 'user' in data
    assert data['user']['email'] == admin_user.email
    assert data['user']['role'] == admin_user.role
    assert 'token' in data
    assert 'refreshToken' in data

@pytest.mark.django_db
def test_login_invalid_credentials(client):
    response = client.post('/auth/login/', json={
        'email': 'nonexistent@example.com',
        'password': 'wrongpassword'
    })
    assert response.status_code == 401

@pytest.mark.django_db
def test_me_endpoint(client, admin_token, auth_headers, admin_user):
    response = client.get('/auth/me/', headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data['email'] == admin_user.email
    assert data['role'] == admin_user.role

@pytest.mark.django_db
def test_me_unauthorized(client):
    response = client.get('/auth/me/')
    assert response.status_code == 401

@pytest.mark.django_db
def test_logout_endpoint(client, admin_token, auth_headers):
    response = client.post('/auth/logout/', headers=auth_headers)
    assert response.status_code == 204