def test_doctor_and_nurse_role_access(
    client, test_patient, auth_headers_doctor, auth_headers_nurse, auth_headers_admin
):
    # 1. Doctor accesses unified patient workspace
    doc_resp = client.get(
        f"/api/v1/doctor/workspace/{test_patient.id}",
        headers=auth_headers_doctor
    )
    assert doc_resp.status_code == 200
    assert doc_resp.json()["data"]["name"] == "Ramesh Kumar"

    # 2. Nurse accesses assist requests / triage
    nurse_resp = client.get(
        "/api/v1/queue",
        headers=auth_headers_nurse
    )
    assert nurse_resp.status_code == 200

    # 3. Admin accesses system stats
    admin_resp = client.get(
        "/api/v1/admin/stats",
        headers=auth_headers_admin
    )
    assert admin_resp.status_code == 200
    assert "total_patients" in admin_resp.json()["data"]

    # 4. Unauthenticated access blocked
    unauth_resp = client.get(f"/api/v1/doctor/workspace/{test_patient.id}")
    assert unauth_resp.status_code == 401
