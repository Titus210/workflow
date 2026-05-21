import pytest
from apps.applications.models import Application
from django.utils import timezone
from datetime import timedelta

@pytest.mark.django_db
def test_dashboard_stats(client, admin_token, auth_headers, reviewer_token, reviewer_auth_headers):
    # Create some test applications
    # Create 2 DRAFT applications
    client.post('/applications/', json={
        'applicantName': 'John Doe',
        'applicantEmail': 'john@example.com',
        'companyName': 'Acme Corp',
        'applicationType': 'Recordation',
        'description': 'Draft application 1'
    }, headers=auth_headers)
    client.post('/applications/', json={
        'applicantName': 'Jane Smith',
        'applicantEmail': 'jane@example.com',
        'companyName': 'Beta Ltd',
        'applicationType': 'Renewal',
        'description': 'Draft application 2'
    }, headers=auth_headers)
    # Create 1 SUBMITTED application
    submit_resp = client.post('/applications/', json={
        'applicantName': 'Bob Johnson',
        'applicantEmail': 'bob@example.com',
        'companyName': 'Gamma LLC',
        'applicationType': 'Change of Ownership',
        'description': 'Submitted application'
    }, headers=auth_headers)
    submit_id = submit_resp.json()['id']
    client.post(f'/applications/{submit_id}/submit/', headers=auth_headers)
    # Create 1 UNDER_REVIEW application (reviewer action)
    review_resp = client.post('/applications/', json={
        'applicantName': 'Alice Brown',
        'applicantEmail': 'alice@example.com',
        'companyName': 'Delta Inc',
        'applicationType': 'Change of Name',
        'description': 'Under review application'
    }, headers=auth_headers)
    review_id = review_resp.json()['id']
    client.post(f'/applications/{review_id}/submit/', headers=auth_headers)
    # Use reviewer token for reviewer actions
    reviewer_client = client
    reviewer_client.post(f'/applications/{review_id}/start-review/', headers=reviewer_auth_headers)
    # Create 2 APPROVED applications from last month (to test monthly stats)
    approved1_resp = client.post('/applications/', json={
        'applicantName': 'Approved User 1',
        'applicantEmail': 'approved1@example.com',
        'companyName': 'Approved Corp',
        'applicationType': 'Recordation',
        'description': 'Approved application 1'
    }, headers=auth_headers)
    approved1_id = approved1_resp.json()['id']
    client.post(f'/applications/{approved1_id}/submit/', headers=auth_headers)
    reviewer_client.post(f'/applications/{approved1_id}/start-review/', headers=reviewer_auth_headers)
    reviewer_client.post(f'/applications/{approved1_id}/decision/', json={
        'decision': 'APPROVED',
        'comment': 'Looks good'
    }, headers=reviewer_auth_headers)
    approved2_resp = client.post('/applications/', json={
        'applicantName': 'Approved User 2',
        'applicantEmail': 'approved2@example.com',
        'companyName': 'Approved Corp',
        'applicationType': 'Renewal',
        'description': 'Approved application 2'
    }, headers=auth_headers)
    approved2_id = approved2_resp.json()['id']
    client.post(f'/applications/{approved2_id}/submit/', headers=auth_headers)
    reviewer_client.post(f'/applications/{approved2_id}/start-review/', headers=reviewer_auth_headers)
    reviewer_client.post(f'/applications/{approved2_id}/decision/', json={
        'decision': 'APPROVED',
        'comment': 'Looks good'
    }, headers=reviewer_auth_headers)
    # Now test the stats endpoint
    response = client.get('/dashboard/stats/', headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    # Total applications: 2 draft + 1 submitted + 1 under review + 2 approved = 6
    assert data['totalApplications'] == 6
    # Pending review: submitted + under review = 1 + 1 = 2
    assert data['pendingReview'] == 2
    # Approved this month: 2 (both approved this month)
    assert data['approvedThisMonth'] == 2
    # Rejected this month: 0
    assert data['rejectedThisMonth'] == 0
    # Check that deltas are present (they're hardcoded in the implementation)
    assert 'totalDelta' in data
    assert 'pendingDelta' in data
    assert 'approvedDelta' in data
    assert 'rejectedDelta' in data

@pytest.mark.django_db
def test_dashboard_trends(client, auth_headers):
    # Create an application today
    client.post('/applications/', json={
        'applicantName': 'Today User',
        'applicantEmail': 'today@example.com',
        'companyName': 'Today Corp',
        'applicationType': 'Recordation',
        'description': 'Today application'
    }, headers=auth_headers)
    # Test trends for different periods
    for period in ['7d', '30d', '90d']:
        response = client.get(f'/dashboard/trends/?period={period}', headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Should have entries for each day in the period
        days = 7 if period == '7d' else 30 if period == '30d' else 90
        assert len(data) == days
        # Check structure
        for point in data:
            assert 'date' in point
            assert 'count' in point
            # Date should be in YYYY-MM-DD format
            assert len(point['date']) == 10
            assert point['date'][4] == '-'
            assert point['date'][7] == '-'

@pytest.mark.django_db
def test_dashboard_distribution(client, auth_headers, reviewer_token, reviewer_auth_headers):
    # Create applications with different statuses
    # DRAFT
    client.post('/applications/', json={
        'applicantName': 'Draft User',
        'applicantEmail': 'draft@example.com',
        'companyName': 'Draft Corp',
        'applicationType': 'Recordation',
        'description': 'Draft application'
    }, headers=auth_headers)
    # SUBMITTED
    submit_resp = client.post('/applications/', json={
        'applicantName': 'Submitted User',
        'applicantEmail': 'submitted@example.com',
        'companyName': 'Submitted Corp',
        'applicationType': 'Renewal',
        'description': 'Submitted application'
    }, headers=auth_headers)
    submit_id = submit_resp.json()['id']
    client.post(f'/applications/{submit_id}/submit/', headers=auth_headers)
    # UNDER_REVIEW
    review_resp = client.post('/applications/', json={
        'applicantName': 'Review User',
        'applicantEmail': 'review@example.com',
        'companyName': 'Review Corp',
        'applicationType': 'Change of Ownership',
        'description': 'Under review application'
    }, headers=auth_headers)
    review_id = review_resp.json()['id']
    client.post(f'/applications/{review_id}/submit/', headers=auth_headers)
    # Use reviewer token for reviewer actions
    reviewer_client = client
    reviewer_client.post(f'/applications/{review_id}/start-review/', headers=reviewer_auth_headers)
    # APPROVED
    approved_resp = client.post('/applications/', json={
        'applicantName': 'Approved User',
        'applicantEmail': 'approved@example.com',
        'companyName': 'Approved Corp',
        'applicationType': 'Change of Name',
        'description': 'Approved application'
    }, headers=auth_headers)
    approved_id = approved_resp.json()['id']
    client.post(f'/applications/{approved_id}/submit/', headers=auth_headers)
    reviewer_client.post(f'/applications/{approved_id}/start-review/', headers=reviewer_auth_headers)
    reviewer_client.post(f'/applications/{approved_id}/decision/', json={
        'decision': 'APPROVED',
        'comment': 'Looks good'
    }, headers=reviewer_auth_headers)
    # REJECTED
    rejected_resp = client.post('/applications/', json={
        'applicantName': 'Rejected User',
        'applicantEmail': 'rejected@example.com',
        'companyName': 'Rejected Corp',
        'applicationType': 'Discontinuation',
        'description': 'Rejected application'
    }, headers=auth_headers)
    rejected_id = rejected_resp.json()['id']
    client.post(f'/applications/{rejected_id}/submit/', headers=auth_headers)
    reviewer_client.post(f'/applications/{rejected_id}/start-review/', headers=reviewer_auth_headers)
    reviewer_client.post(f'/applications/{rejected_id}/decision/', json={
        'decision': 'REJECTED',
        'comment': 'Not good enough'
    }, headers=reviewer_auth_headers)
    # NEED_MORE_INFO
    needmore_resp = client.post('/applications/', json={
        'applicantName': 'NeedMore User',
        'applicantEmail': 'needmore@example.com',
        'companyName': 'NeedMore Corp',
        'applicationType': 'Recordation',
        'description': 'Need more info application'
    }, headers=auth_headers)
    needmore_id = needmore_resp.json()['id']
    client.post(f'/applications/{needmore_id}/submit/', headers=auth_headers)
    reviewer_client.post(f'/applications/{needmore_id}/start-review/', headers=reviewer_auth_headers)
    reviewer_client.post(f'/applications/{needmore_id}/decision/', json={
        'decision': 'NEED_MORE_INFO',
        'comment': 'Need more info'
    }, headers=reviewer_auth_headers)
    # Now test distribution
    response = client.get('/dashboard/distribution/', headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    # Should have 6 entries (all statuses except maybe one if count is zero, but we have one of each)
    # Actually, we have one of each status, so 6 entries
    statuses_seen = [item['status'] for item in data]
    assert 'DRAFT' in statuses_seen
    assert 'SUBMITTED' in statuses_seen
    assert 'UNDER_REVIEW' in statuses_seen
    assert 'NEED_MORE_INFO' in statuses_seen
    assert 'APPROVED' in statuses_seen
    assert 'REJECTED' in statuses_seen
    # Check that each has the correct color
    color_map = {
        'DRAFT': '#6B7280',
        'SUBMITTED': '#3B82F6',
        'UNDER_REVIEW': '#EAB308',
        'NEED_MORE_INFO': '#F97316',
        'APPROVED': '#22C55E',
        'REJECTED': '#EF4444'
    }
    for item in data:
        assert item['color'] == color_map[item['status']]
        assert item['count'] >= 1  # At least one of each

@pytest.mark.django_db
def test_dashboard_recent(client, auth_headers):
    # Create 7 applications to test that we only get the 5 most recent
    for i in range(7):
        client.post('/applications/', json={
            'applicantName': f'User {i}',
            'applicantEmail': f'user{i}@example.com',
            'companyName': f'Company {i}',
            'applicationType': 'Recordation',
            'description': f'Application {i}'
        }, headers=auth_headers)
    response = client.get('/dashboard/recent/', headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 5  # Should only return the 5 most recent
    # Check that they are ordered by created_at descending (newest first)
    # The first item should be User 6 (the last one we created)
    assert data[0]['applicantName'] == 'User 6'
    assert data[1]['applicantName'] == 'User 5'
    assert data[2]['applicantName'] == 'User 4'
    assert data[3]['applicantName'] == 'User 3'
    assert data[4]['applicantName'] == 'User 2'