from fastapi import status

def get_auth_headers(client, email, password):
    client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "full_name": "AI Tester"}
    )
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password}
    )
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_prepare_me_strategy_generator(client):
    headers = get_auth_headers(client, "aitest@placepilot.ai", "password123")
    
    # 1. Create a dummy application
    app_res = client.post(
        "/api/v1/applications",
        headers=headers,
        json={
            "company_name": "Apple",
            "role": "SDE-1 CoreOS",
            "job_description": "We are seeking C/C++ developers with strong OS principles, concurrency memory models.",
            "current_stage": "Technical Interview"
        }
    )
    assert app_res.status_code == status.HTTP_201_CREATED
    app_id = app_res.json()["id"]
    
    # 2. Trigger Prepare Me endpoint
    prep_res = client.post(
        f"/api/v1/applications/{app_id}/prepare",
        headers=headers
    )
    assert prep_res.status_code == status.HTTP_200_OK
    data = prep_res.json()
    assert "id" in data
    assert "ai_insight" in data
    assert "today_mission" in data
    assert len(data["tasks"]) > 0
    assert data["tasks"][0]["ai_generated"] is True

def test_resume_jd_matcher(client):
    headers = get_auth_headers(client, "resumetest@placepilot.ai", "password123")
    
    # Trigger Resume JD Matcher
    match_res = client.post(
        "/api/v1/resume/match",
        headers=headers,
        json={
            "resume_text": "Experienced Python Backend developer. Strong experience with SQL, REST APIs, Git.",
            "jd_text": "Looking for a Python Developer. Must have Django, PostgreSQL, Docker, and Kubernetes skills."
        }
    )
    assert match_res.status_code == status.HTTP_200_OK
    data = match_res.json()
    assert "match_percentage" in data
    assert "matched_skills" in data
    assert "missing_skills" in data
    assert "explanation" in data

def test_mock_interview_session(client):
    headers = get_auth_headers(client, "mockstudent@placepilot.ai", "password123")
    
    # 1. Create application
    app_res = client.post(
        "/api/v1/applications",
        headers=headers,
        json={
            "company_name": "Google",
            "role": "SDE-1",
            "job_description": "Algorithms and Systems design roles.",
            "current_stage": "Technical Interview"
        }
    )
    app_id = app_res.json()["id"]

    # 2. Start mock interview
    start_res = client.post(
        "/api/v1/mock-interviews/start",
        headers=headers,
        json={"application_id": app_id}
    )
    assert start_res.status_code == status.HTTP_200_OK
    start_data = start_res.json()
    session_id = start_data["session_id"]
    assert start_data["question_number"] == 1
    assert start_data["total_questions"] == 3
    assert len(start_data["question"]) > 10

    # 3. Answer question 1
    ans1_res = client.post(
        f"/api/v1/mock-interviews/{session_id}/answer",
        headers=headers,
        json={"answer_text": "I would use a hash map and a doubly linked list for LRU Cache."}
    )
    assert ans1_res.status_code == status.HTTP_200_OK
    ans1_data = ans1_res.json()
    assert ans1_data["completed"] is False
    assert ans1_data["question_number"] == 2

    # 4. Answer question 2
    ans2_res = client.post(
        f"/api/v1/mock-interviews/{session_id}/answer",
        headers=headers,
        json={"answer_text": "I would handle concurrency using a mutex or a read-write lock."}
    )
    ans2_data = ans2_res.json()
    assert ans2_data["completed"] is False
    assert ans2_data["question_number"] == 3

    # 5. Answer question 3 (ends session and evaluates)
    ans3_res = client.post(
        f"/api/v1/mock-interviews/{session_id}/answer",
        headers=headers,
        json={"answer_text": "I communicate actively with stakeholders and write tests."}
    )
    assert ans3_res.status_code == status.HTTP_200_OK
    ans3_data = ans3_res.json()
    assert ans3_data["completed"] is True
    assert "scorecard" in ans3_data
    scorecard = ans3_data["scorecard"]
    assert "technical_score" in scorecard
    assert "strengths" in scorecard
    assert len(scorecard["strengths"]) > 0

