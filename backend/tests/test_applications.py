import pytest
from django.utils import timezone
from datetime import timedelta
from apps.applications.models import Application, ActivityLogEntry

@pytest.mark.django_db
def test_create_application(client, applicant_token, applicant_auth_headers):
    response = client.post('/applications/', json={
        'applicantName': 'John Doe',
        'applicantEmail': 'john@example.com',
        'companyName': 'Acme Corp',
        'applicationType': 'Recordation',
        'description': 'Test application'
    }, headers=applicant_auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data['status'] == 'DRAFT'
    assert data['trackingNumber'].startswith('APP-')
    # Check that an activity log was created
    app_id = data['id']
    logs = ActivityLogEntry.objects.filter(application_id=app_id)
    assert logs.count() == 1
    assert logs.first().status == 'DRAFT'

@pytest.mark.django_db
def test_list_applications(client, applicant_token, applicant_auth_headers):
    # Create a couple of applications
    client.post('/applications/', json={
        'applicantName': 'John Doe',
        'applicantEmail': 'john@example.com',
        'companyName': 'Acme Corp',
        'applicationType': 'Recordation',
        'description': 'Test application 1'
    }, headers=applicant_auth_headers)
    client.post('/applications/', json={
        'applicantName': 'Jane Smith',
        'applicantEmail': 'jane@example.com',
        'companyName': 'Beta Ltd',
        'applicationType': 'Renewal',
        'description': 'Test application 2'
    }, headers=applicant_auth_headers)
    response = client.get('/applications/', headers=applicant_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert 'data' in data
    assert len(data['data']) == 2
    assert data['total'] == 2
    assert data['page'] == 1
    assert data['pageSize'] == 10
    assert data['totalPages'] == 1

@pytest.mark.django_db
def test_list_applications_with_filters(client, applicant_token, applicant_auth_headers):
    # Create one DRAFT and one SUBMITTED application
    draft_resp = client.post('/applications/', json={
        'applicantName': 'John Doe',
        'applicantEmail': 'john@example.com',
        'companyName': 'Acme Corp',
        'applicationType': 'Recordation',
        'description': 'Draft application'
    }, headers=applicant_auth_headers)
    draft_id = draft_resp.json()['id']
    # Submit the draft
    client.post(f'/applications/{draft_id}/submit/', headers=applicant_auth_headers)
    # Create another DRAFT
    client.post('/applications/', json={
        'applicantName': 'Jane Smith',
        'applicantEmail': 'jane@example.com',
        'companyName': 'Beta Ltd',
        'applicationType': 'Renewal',
        'description': 'Another draft'
    }, headers=applicant_auth_headers)
    # Filter by status=DRAFT
    response = client.get('/applications/?status=DRAFT', headers=applicant_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data['data']) == 1  # One remaining draft
    # Filter by status=SUBMITTED
    response = client.get('/applications/?status=SUBMITTED', headers=applicant_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data['data']) == 1  # One submitted
    # Filter by search
    response = client.get('/applications/?search=Acme', headers=applicant_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data['data']) == 1  # Only the one with Acme Corp

@pytest.mark.django_db
def test_get_application(client, applicant_token, applicant_auth_headers):
    # Create an application
    resp = client.post('/applications/', json={
        'applicantName': 'John Doe',
        'applicantEmail': 'john@example.com',
        'companyName': 'Acme Corp',
        'applicationType': 'Recordation',
        'description': 'Test application'
    }, headers=applicant_auth_headers)
    app_id = resp.json()['id']
    # Get it
    response = client.get(f'/applications/{app_id}/', headers=applicant_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data['id'] == app_id
    assert data['applicantName'] == 'John Doe'

@pytest.mark.django_db
def test_get_application_not_found(client, applicant_auth_headers):
    response = client.get('/applications/00000000-0000-0000-0000-000000000000/', headers=applicant_auth_headers)
    assert response.status_code == 404

@pytest.mark.django_db
def test_update_application(client, applicant_token, applicant_auth_headers):
    # Create a DRAFT application
    resp = client.post('/applications/', json={
        'applicantName': 'John Doe',
        'applicantEmail': 'john@example.com',
        'companyName': 'Acme Corp',
        'applicationType': 'Recordation',
        'description': 'Original description'
    }, headers=applicant_auth_headers)
    app_id = resp.json()['id']
    # Update it
    response = client.put(f'/applications/{app_id}/', json={
        'applicantName': 'John Doe Updated',
        'description': 'Updated description'
    }, headers=applicant_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data['applicantName'] == 'John Doe Updated'
    assert data['description'] == 'Updated description'
    # Check that the status is still DRAFT
    assert data['status'] == 'DRAFT'

@pytest.mark.django_db
def test_update_application_only_draft_and_need_more_info(client, applicant_token, applicant_auth_headers, reviewer_token, reviewer_auth_headers):
    # Create an application and submit it
    resp = client.post('/applications/', json={
        'applicantName': 'John Doe',
        'applicantEmail': 'john@example.com',
        'companyName': 'Acme Corp',
        'applicationType': 'Recordation',
        'description': 'Test application'
    }, headers=applicant_auth_headers)
    app_id = resp.json()['id']
    # Submit it
    client.post(f'/applications/{app_id}/submit/', headers=applicant_auth_headers)
    # Now try to update it (should fail)
    response = client.put(f'/applications/{app_id}/', json={
        'description': 'Should not be allowed'
    }, headers=applicant_auth_headers)
    assert response.status_code == 403  # EDIT_NOT_ALLOWED
    # Now start review (as reviewer)
    client.post(f'/applications/{app_id}/start-review/', headers=reviewer_auth_headers)
    # Try to update again (should still fail because UNDER_REVIEW is not editable)
    response = client.put(f'/applications/{app_id}/', json={
        'description': 'Still not allowed'
    }, headers=applicant_auth_headers)
    assert response.status_code == 403
    # Now transition to NEED_MORE_INFO (as reviewer)
    client.post(f'/applications/{app_id}/decision/', json={
        'decision': 'NEED_MORE_INFO',
        'comment': 'Needs more info'
    }, headers=reviewer_auth_headers)
    # Now update should be allowed
    response = client.put(f'/applications/{app_id}/', json={
        'description': 'Now allowed'
    }, headers=applicant_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data['description'] == 'Now allowed'

@pytest.mark.django_db
def test_delete_application_only_draft(client, applicant_token, applicant_auth_headers):
    # Create a DRAFT application
    resp = client.post('/applications/', json={
        'applicantName': 'John Doe',
        'applicantEmail': 'john@example.com',
        'companyName': 'Acme Corp',
        'applicationType': 'Recordation',
        'description': 'To be deleted'
    }, headers=applicant_auth_headers)
    app_id = resp.json()['id']
    # Delete it (should succeed)
    response = client.delete(f'/applications/{app_id}/', headers=applicant_auth_headers)
    assert response.status_code == 204
    # Try to delete again (should 404)
    response = client.delete(f'/applications/{app_id}/', headers=applicant_auth_headers)
    assert response.status_code == 404
    # Now create a SUBMITTED application and try to delete (should fail)
    resp2 = client.post('/applications/', json={
        'applicantName': 'John Doe',
        'applicantEmail': 'john@example.com',
        'companyName': 'Acme Corp',
        'applicationType': 'Recordation',
        'description': 'To be submitted'
    }, headers=applicant_auth_headers)
    app_id2 = resp2.json()['id']
    client.post(f'/applications/{app_id2}/submit/', headers=applicant_auth_headers)
    response = client.delete(f'/applications/{app_id2}/', headers=applicant_auth_headers)
    assert response.status_code == 403  # DELETE_NOT_ALLOWED

@pytest.mark.django_db
def test_submit_application(client, applicant_token, applicant_auth_headers):
    # Create a DRAFT application
    resp = client.post('/applications/', json={
        'applicantName': 'John Doe',
        'applicantEmail': 'john@example.com',
        'companyName': 'Acme Corp',
        'applicationType': 'Recordation',
        'description': 'Test application'
    }, headers=applicant_auth_headers)
    app_id = resp.json()['id']
    # Submit it
    response = client.post(f'/applications/{app_id}/submit/', headers=applicant_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data['status'] == 'SUBMITTED'
    assert data['submittedAt'] is not None
    # Check activity log
    logs = ActivityLogEntry.objects.filter(application_id=app_id).order_by('timestamp')
    assert logs.count() == 2  # DRAFT and SUBMITTED
    assert logs[0].status == 'DRAFT'
    assert logs[1].status == 'SUBMITTED'
    # Try to submit again (should fail)
    response = client.post(f'/applications/{app_id}/submit/', headers=applicant_auth_headers)
    assert response.status_code == 400  # INVALID_TRANSITION

@pytest.mark.django_db
def test_start_review(client, applicant_token, applicant_auth_headers, reviewer_token, reviewer_auth_headers):
    # Create and submit an application
    resp = client.post('/applications/', json={
        'applicantName': 'John Doe',
        'applicantEmail': 'john@example.com',
        'companyName': 'Acme Corp',
        'applicationType': 'Recordation',
        'description': 'Test application'
    }, headers=applicant_auth_headers)
    app_id = resp.json()['id']
    client.post(f'/applications/{app_id}/submit/', headers=applicant_auth_headers)
    # Start review (as reviewer)
    response = client.post(f'/applications/{app_id}/start-review/', headers=reviewer_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data['status'] == 'UNDER_REVIEW'
    assert data['reviewedAt'] is not None
    assert data['reviewedBy'] is not None
    # Check activity log
    logs = ActivityLogEntry.objects.filter(application_id=app_id).order_by('timestamp')
    assert logs.count() == 3  # DRAFT, SUBMITTED, UNDER_REVIEW
    assert logs[2].status == 'UNDER_REVIEW'
    # Try to start review again (should fail)
    response = client.post(f'/applications/{app_id}/start-review/', headers=reviewer_auth_headers)
    assert response.status_code == 400  # INVALID_TRANSITION
    # Try to start review as applicant (should fail)
    response = client.post(f'/applications/{app_id}/start-review/', headers=applicant_auth_headers)
    assert response.status_code == 403  # FORBIDDEN

@pytest.mark.django_db
def test_withdraw_application(client, applicant_token, applicant_auth_headers):
    # Create and submit an application
    resp = client.post('/applications/', json={
        'applicantName': 'John Doe',
        'applicantEmail': 'john@example.com',
        'companyName': 'Acme Corp',
        'applicationType': 'Recordation',
        'description': 'Test application'
    }, headers=applicant_auth_headers)
    app_id = resp.json()['id']
    client.post(f'/applications/{app_id}/submit/', headers=applicant_auth_headers)
    # Withdraw it
    response = client.post(f'/applications/{app_id}/withdraw/', headers=applicant_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data['status'] == 'DRAFT'
    assert data['withdrawnAt'] is not None  # Actually, the field is updatedAt, but we set it to the withdraw time
    # Check activity log
    logs = ActivityLogEntry.objects.filter(application_id=app_id).order_by('timestamp')
    assert logs.count() == 3  # DRAFT, SUBMITTED, DRAFT (withdraw)
    assert logs[2].status == 'DRAFT'
    assert logs[2].comment == 'Application withdrawn by user'
    # Try to withdraw again (should fail)
    response = client.post(f'/applications/{app_id}/withdraw/', headers=applicant_auth_headers)
    assert response.status_code == 400  # INVALID_TRANSITION
    # Try to withdraw a DRAFT without submitting first (should fail)
    resp2 = client.post('/applications/', json={
        'applicantName': 'John Doe',
        'applicantEmail': 'john@example.com',
        'companyName': 'Acme Corp',
        'applicationType': 'Recordation',
        'description': 'Another application'
    }, headers=applicant_auth_headers)
    app_id2 = resp2.json()['id']
    response = client.post(f'/applications/{app_id2}/withdraw/', headers=applicant_auth_headers)
    assert response.status_code == 400  # INVALID_TRANSITION

@pytest.mark.django_db
def test_make_decision(client, applicant_token, applicant_auth_headers, reviewer_token, reviewer_auth_headers):
    # Create, submit, and start review an application
    resp = client.post('/applications/', json={
        'applicantName': 'John Doe',
        'applicantEmail': 'john@example.com',
        'companyName': 'Acme Corp',
        'applicationType': 'Recordation',
        'description': 'Test application'
    }, headers=applicant_auth_headers)
    app_id = resp.json()['id']
    client.post(f'/applications/{app_id}/submit/', headers=applicant_auth_headers)
    client.post(f'/applications/{app_id}/start-review/', headers=reviewer_auth_headers)
    # Make an APPROVED decision (as reviewer)
    response = client.post(f'/applications/{app_id}/decision/', json={
        'decision': 'APPROVED',
        'comment': 'Looks good'
    }, headers=reviewer_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data['status'] == 'APPROVED'
    assert data['reviewedAt'] is not None
    assert data['reviewedBy'] is not None
    assert data['reviewerDecision'] == 'APPROVED'
    assert data['reviewerComment'] == 'Looks good'
    # Check activity log
    logs = ActivityLogEntry.objects.filter(application_id=app_id).order_by('timestamp')
    assert logs.count() == 4  # DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED
    assert logs[3].status == 'APPROVED'
    assert logs[3].comment == 'Looks good'
    # Try to make a decision again (should fail)
    response = client.post(f'/applications/{app_id}/decision/', json={
        'decision': 'REJECTED',
        'comment': 'Changed mind'
    }, headers=reviewer_auth_headers)
    assert response.status_code == 400  # INVALID_TRANSITION
    # Try to make a decision as applicant (should fail)
    response = client.post(f'/applications/{app_id}/decision/', json={
        'decision': 'REJECTED',
        'comment': 'Not allowed'
    }, headers=applicant_auth_headers)
    assert response.status_code == 403  # FORBIDDEN
    # Test REJECTED decision requires comment
    # We need to go back to UNDER_REVIEW, so let's create a new application
    resp2 = client.post('/applications/', json={
        'applicantName': 'Jane Doe',
        'applicantEmail': 'jane@example.com',
        'companyName': 'Beta Ltd',
        'applicationType': 'Renewal',
        'description': 'Another application'
    }, headers=applicant_auth_headers)
    app_id2 = resp2.json()['id']
    client.post(f'/applications/{app_id2}/submit/', headers=applicant_auth_headers)
    client.post(f'/applications/{app_id2}/start-review/', headers=reviewer_auth_headers)
    # Try REJECTED without comment
    response = client.post(f'/applications/{app_id2}/decision/', json={
        'decision': 'REJECTED'
    }, headers=reviewer_auth_headers)
    assert response.status_code == 400  # COMMENT_REQUIRED
    # Now with comment
    response = client.post(f'/applications/{app_id2}/decision/', json={
        'decision': 'REJECTED',
        'comment': 'Not good enough'
    }, headers=reviewer_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data['status'] == 'REJECTED'
    assert data['reviewerDecision'] == 'REJECTED'
    assert data['reviewerComment'] == 'Not good enough'
    # Test NEED_MORE_INFO decision requires comment
    resp3 = client.post('/applications/', json={
        'applicantName': 'Bob Doe',
        'applicantEmail': 'bob@example.com',
        'companyName': 'Gamma LLC',
        'applicationType': 'Change of Ownership',
        'description': 'Third application'
    }, headers=applicant_auth_headers)
    app_id3 = resp3.json()['id']
    client.post(f'/applications/{app_id3}/submit/', headers=applicant_auth_headers)
    client.post(f'/applications/{app_id3}/start-review/', headers=reviewer_auth_headers)
    # Try NEED_MORE_INFO without comment
    response = client.post(f'/applications/{app_id3}/decision/', json={
        'decision': 'NEED_MORE_INFO'
    }, headers=reviewer_auth_headers)
    assert response.status_code == 400  # COMMENT_REQUIRED
    # Now with comment
    response = client.post(f'/applications/{app_id3}/decision/', json={
        'decision': 'NEED_MORE_INFO',
        'comment': 'Need more info on ownership'
    }, headers=reviewer_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data['status'] == 'NEED_MORE_INFO'
    assert data['reviewerDecision'] == 'NEED_MORE_INFO'
    assert data['reviewerComment'] == 'Need more info on ownership'

@pytest.mark.django_db
def test_update_application_status_kanban(client, applicant_token, applicant_auth_headers, reviewer_token, reviewer_auth_headers):
    # Create and submit an application
    resp = client.post('/applications/', json={
        'applicantName': 'John Doe',
        'applicantEmail': 'john@example.com',
        'companyName': 'Acme Corp',
        'applicationType': 'Recordation',
        'description': 'Test application'
    }, headers=applicant_auth_headers)
    app_id = resp.json()['id']
    client.post(f'/applications/{app_id}/submit/', headers=applicant_auth_headers)
    # Applicant cannot start review via kanban shortcut
    response = client.post(f'/applications/{app_id}/status/', json={
        'status': 'UNDER_REVIEW'
    }, headers=applicant_auth_headers)
    assert response.status_code == 403
    # Use the Kanban endpoint to start review
    response = client.post(f'/applications/{app_id}/status/', json={
        'status': 'UNDER_REVIEW'
    }, headers=reviewer_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data['status'] == 'UNDER_REVIEW'
    # Try an invalid transition (e.g., UNDER_REVIEW to DRAFT is not allowed directly)
    response = client.post(f'/applications/{app_id}/status/', json={
        'status': 'DRAFT'
    }, headers=reviewer_auth_headers)
    assert response.status_code == 409  # INVALID_TRANSITION
    # But we can go from UNDER_REVIEW to NEED_MORE_INFO
    response = client.post(f'/applications/{app_id}/status/', json={
        'status': 'NEED_MORE_INFO',
        'comment': 'Need more info'
    }, headers=reviewer_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data['status'] == 'NEED_MORE_INFO'
    # From NEED_MORE_INFO we can go back to SUBMITTED
    response = client.post(f'/applications/{app_id}/status/', json={
        'status': 'SUBMITTED'
    }, headers=applicant_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data['status'] == 'SUBMITTED'

@pytest.mark.django_db
def test_get_activity_log(client, applicant_token, applicant_auth_headers, reviewer_token, reviewer_auth_headers):
    # Create, submit, start review, and approve an application
    resp = client.post('/applications/', json={
        'applicantName': 'John Doe',
        'applicantEmail': 'john@example.com',
        'companyName': 'Acme Corp',
        'applicationType': 'Recordation',
        'description': 'Test application'
    }, headers=applicant_auth_headers)
    app_id = resp.json()['id']
    client.post(f'/applications/{app_id}/submit/', headers=applicant_auth_headers)
    client.post(f'/applications/{app_id}/start-review/', headers=reviewer_auth_headers)
    client.post(f'/applications/{app_id}/decision/', json={
        'decision': 'APPROVED',
        'comment': 'Looks good'
    }, headers=reviewer_auth_headers)
    # Get the activity log
    response = client.get(f'/applications/{app_id}/activity/', headers=applicant_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 4
    # Check order (oldest first)
    assert data[0]['status'] == 'DRAFT'
    assert data[1]['status'] == 'SUBMITTED'
    assert data[2]['status'] == 'UNDER_REVIEW'
    assert data[3]['status'] == 'APPROVED'
    assert data[3]['comment'] == 'Looks good'
    # Check that the user strings are resolved correctly
    # The first log (DRAFT) should have the applicant as user
    assert data[0]['user'] == 'John Doe'  # first_name + last_name
    # The second log (SUBMITTED) should also have the applicant
    assert data[1]['user'] == 'John Doe'
    # The third log (UNDER_REVIEW) should have the reviewer
    assert data[2]['user'] == 'John Reviewer'  # from the reviewer_user fixture
    # The fourth log (APPROVED) should have the reviewer
    assert data[3]['user'] == 'John Reviewer'
