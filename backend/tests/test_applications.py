from fastapi import status

def get_auth_headers(client, email, password, name="Test User"):
    client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "full_name": name}
    )
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password}
    )
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_create_and_read_application(client):
    headers = get_auth_headers(client, "apptest@placepilot.ai", "password123")
    
    # Create application
    create_response = client.post(
        "/api/v1/applications",
        headers=headers,
        json={
            "company_name": "Microsoft",
            "role": "SDE Intern",
            "job_description": "C#, Azure, Cloud computing",
            "package_ctc": "80,000",
            "location": "Redmond, WA",
            "job_type": "Internship",
            "application_source": "LinkedIn",
            "current_stage": "Applied",
            "personal_readiness": 75
        }
    )
    assert create_response.status_code == status.HTTP_201_CREATED
    app_id = create_response.json()["id"]
    
    # Read applications list
    list_response = client.get("/api/v1/applications", headers=headers)
    assert list_response.status_code == status.HTTP_200_OK
    apps = list_response.json()
    assert len(apps) >= 1
    assert apps[0]["company_name"] == "Microsoft"
    
    # Read specific application
    get_response = client.get(f"/api/v1/applications/{app_id}", headers=headers)
    assert get_response.status_code == status.HTTP_200_OK
    assert get_response.json()["role"] == "SDE Intern"

def test_update_application_stage(client):
    headers = get_auth_headers(client, "stageupdate@placepilot.ai", "password123")
    
    # Create app
    app_id = client.post(
        "/api/v1/applications",
        headers=headers,
        json={"company_name": "Netflix", "role": "Senior Engineer"}
    ).json()["id"]
    
    # Update stage to Online Assessment
    update_response = client.put(
        f"/api/v1/applications/{app_id}",
        headers=headers,
        json={"current_stage": "Online Assessment"}
    )
    assert update_response.status_code == status.HTTP_200_OK
    assert update_response.json()["current_stage"] == "Online Assessment"
    
    # Read events to check if "Stage Changed" was logged
    events_response = client.get(f"/api/v1/applications/{app_id}/events", headers=headers)
    assert events_response.status_code == status.HTTP_200_OK
    events = events_response.json()
    # At least "Application Created" and "Stage Changed" should exist
    assert len(events) >= 2
    event_types = [e["event_type"] for e in events]
    assert "Stage Changed" in event_types

def test_application_ownership_security(client):
    user1_headers = get_auth_headers(client, "user1@placepilot.ai", "password123")
    user2_headers = get_auth_headers(client, "user2@placepilot.ai", "password123")
    
    # User 1 creates an application
    app_id = client.post(
        "/api/v1/applications",
        headers=user1_headers,
        json={"company_name": "Google", "role": "SWE"}
    ).json()["id"]
    
    # User 2 tries to read it
    get_response = client.get(f"/api/v1/applications/{app_id}", headers=user2_headers)
    assert get_response.status_code == status.HTTP_403_FORBIDDEN
    
    # User 2 tries to update it
    update_response = client.put(
        f"/api/v1/applications/{app_id}",
        headers=user2_headers,
        json={"company_name": "Evil Corp"}
    )
    assert update_response.status_code == status.HTTP_403_FORBIDDEN
    
    # User 2 tries to delete it
    delete_response = client.delete(f"/api/v1/applications/{app_id}", headers=user2_headers)
    assert delete_response.status_code == status.HTTP_403_FORBIDDEN

def test_delete_application(client):
    headers = get_auth_headers(client, "deleteapp@placepilot.ai", "password123")
    
    # Create app
    app_id = client.post(
        "/api/v1/applications",
        headers=headers,
        json={"company_name": "Uber", "role": "Driver SDE"}
    ).json()["id"]
    
    # Delete app
    delete_response = client.delete(f"/api/v1/applications/{app_id}", headers=headers)
    assert delete_response.status_code == status.HTTP_200_OK
    
    # Verify app is deleted
    get_response = client.get(f"/api/v1/applications/{app_id}", headers=headers)
    assert get_response.status_code == status.HTTP_404_NOT_FOUND
