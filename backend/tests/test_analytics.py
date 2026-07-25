from fastapi import status

def get_auth_headers(client, email, password):
    client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "full_name": "Analytics Tester"}
    )
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password}
    )
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_analytics_kpi_and_reports(client):
    headers = get_auth_headers(client, "statstudent@placepilot.ai", "password123")
    
    # 1. Create a dummy application
    client.post(
        "/api/v1/applications",
        headers=headers,
        json={
            "company_name": "Netflix",
            "role": "SDE-2 Streaming Backend",
            "job_description": "Microservices streaming optimizations.",
            "current_stage": "Technical Interview"
        }
    )

    # 2. Get KPI summary
    kpi_res = client.get("/api/v1/analytics/kpi", headers=headers)
    assert kpi_res.status_code == status.HTTP_200_OK
    kpi_data = kpi_res.json()
    assert kpi_data["total_applications"] == 1
    assert kpi_data["active_applications"] == 1
    assert "weakest_topics" in kpi_data

    # 3. Generate Weekly Progress Report
    gen_res = client.post("/api/v1/analytics/report", headers=headers)
    assert gen_res.status_code == status.HTTP_200_OK
    report_data = gen_res.json()
    assert "id" in report_data
    assert "report_text" in report_data
    assert "biggest_improvement" in report_data

    # 4. List Weekly Reports
    list_res = client.get("/api/v1/analytics/report", headers=headers)
    assert list_res.status_code == status.HTTP_200_OK
    assert len(list_res.json()) >= 1
