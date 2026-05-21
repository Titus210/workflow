import pytest
from apps.accounts.models import User

@pytest.mark.django_db
def test_get_profile(client, admin_token, auth_headers, admin_user):
    response = client.get('/settings/profile/', headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data['email'] == admin_user.email
    assert data['role'] == 'Admin'
    assert data['name'] == 'Admin User'  # first_name + last_name

@pytest.mark.django_db
def test_update_profile(client, admin_token, auth_headers, admin_user):
    response = client.put('/settings/profile/', json={
        'name': 'New Name',
        'email': 'newemail@example.com',
        'avatar': 'http://example.com/avatar.jpg'
    }, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data['name'] == 'New Name'
    assert data['email'] == 'newemail@example.com'
    assert data['avatar'] == 'http://example.com/avatar.jpg'
    # Check that the user was actually updated in the database
    user = User.objects.get(email='newemail@example.com')
    assert user.first_name == 'New'  # Assuming split on space
    assert user.last_name == 'Name'
    assert user.email == 'newemail@example.com'
    assert user.avatar == 'http://example.com/avatar.jpg'

@pytest.mark.django_db
def test_update_profile_only_name(client, admin_token, auth_headers, admin_user):
    response = client.put('/settings/profile/', json={
        'name': 'Only Name Update'
    }, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data['name'] == 'Only Name Update'
    # Email and avatar should remain unchanged
    assert data['email'] == admin_user.email
    assert data['avatar'] is None

@pytest.mark.django_db
def test_change_password_success(client, admin_token, auth_headers, admin_user):
    response = client.post('/settings/password/', json={
        'current': 'adminpass123',
        'new': 'newpassword123'
    }, headers=auth_headers)
    assert response.status_code == 204
    # Verify that the new password works
    login_response = client.post('/auth/login/', json={
        'email': admin_user.email,
        'password': 'newpassword123'
    })
    assert login_response.status_code == 200
    # And the old password no longer works
    old_login_response = client.post('/auth/login/', json={
        'email': admin_user.email,
        'password': 'adminpass123'
    })
    assert old_login_response.status_code == 401

@pytest.mark.django_db
def test_change_password_wrong_current(client, admin_token, auth_headers):
    response = client.post('/settings/password/', json={
        'current': 'wrongpassword',
        'new': 'newpassword123'
    }, headers=auth_headers)
    assert response.status_code == 400

@pytest.mark.django_db
def test_get_notification_prefs(client, admin_token, auth_headers):
    response = client.get('/settings/notifications/', headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data['emailNotifications'] == True
    assert data['pushNotifications'] == False
    assert data['digestFrequency'] == 'weekly'

@pytest.mark.django_db
def test_update_notification_prefs(client, admin_token, auth_headers):
    response = client.put('/settings/notifications/', json={
        'emailNotifications': False,
        'pushNotifications': True,
        'digestFrequency': 'monthly'
    }, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data['emailNotifications'] == False
    assert data['pushNotifications'] == True
    assert data['digestFrequency'] == 'monthly'

@pytest.mark.django_db
def test_get_app_settings(client, admin_token, auth_headers):
    response = client.get('/settings/app/', headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data['defaultApplicationType'] == 'Recordation'
    assert data['autoAssignReviewer'] == True
    assert data['commentRequired'] == True

@pytest.mark.django_db
def test_update_app_settings(client, admin_token, auth_headers):
    response = client.put('/settings/app/', json={
        'defaultApplicationType': 'Renewal',
        'autoAssignReviewer': False,
        'commentRequired': False
    }, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data['defaultApplicationType'] == 'Renewal'
    assert data['autoAssignReviewer'] == False
    assert data['commentRequired'] == False

@pytest.mark.django_db
def test_get_team_members(client, admin_token, auth_headers):
    # Create a few users
    User.objects.create_user(
        username='teamuser1',
        email='teamuser1@example.com',
        password='teampass123',
        first_name='Team',
        last_name='User1',
        role='Applicant'
    )
    User.objects.create_user(
        username='teamuser2',
        email='teamuser2@example.com',
        password='teampass123',
        first_name='Team',
        last_name='User2',
        role='Reviewer'
    )
    response = client.get('/settings/team/', headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    # Should have at least 3 users: admin, teamuser1, teamuser2
    assert len(data) >= 3
    # Check that each user has the expected fields
    for user_data in data:
        assert 'id' in user_data
        assert 'name' in user_data
        assert 'email' in user_data
        assert 'role' in user_data
        # lastActive might be None for newly created users, that's ok

@pytest.mark.django_db
def test_get_active_sessions(client, admin_token, auth_headers):
    response = client.get('/settings/sessions/', headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    # Should have the mock data we hardcoded
    assert len(data) == 3
    session = data[0]
    assert 'id' in session
    assert 'device' in session
    assert 'location' in session
    assert 'lastActive' in session
    assert 'current' in session

@pytest.mark.django_db
def test_terminate_session(client, admin_token, auth_headers):
    response = client.delete('/settings/sessions/1/', headers=auth_headers)
    assert response.status_code == 204