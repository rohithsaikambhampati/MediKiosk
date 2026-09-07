def test_fact_creation_and_doctor_verification(client, test_patient, auth_headers_doctor):
    # 1. Create clinical fact (extracted from conversation/kiosk)
    fact_payload = {
        "patient_id": test_patient.id,
        "fact_type": "SYMPTOM",
        "value": "Chest heaviness",
        "normalized_value": "Exertional Angina",
        "confidence": 0.85,
        "source_type": "AI_EXTRACTED",
        "verification_status": "NEEDS_VERIFICATION",
    }
    fact_resp = client.post("/api/v1/facts", json=fact_payload)
    assert fact_resp.status_code == 201
    fact_id = fact_resp.json()["data"]["id"]
    assert fact_resp.json()["data"]["verification_status"] == "NEEDS_VERIFICATION"

    # 2. Doctor verifies fact with DOCTOR_VERIFIED status and 1.0 confidence
    verif_payload = {
        "reviewed_by": "Dr. Test Specialist",
        "new_value": "Moderate sub-sternal chest heaviness",
        "reason": "Confirmed upon clinical interrogation",
    }
    verif_resp = client.post(f"/api/v1/verification/facts/{fact_id}/verify", json=verif_payload, headers=auth_headers_doctor)
    assert verif_resp.status_code == 200
    assert verif_resp.json()["data"]["new_status"] == "DOCTOR_VERIFIED"

    # 3. Verify fact now reflects DOCTOR_VERIFIED status and 1.0 confidence
    get_fact = client.get(f"/api/v1/facts/{fact_id}")
    assert get_fact.status_code == 200
    assert get_fact.json()["data"]["verification_status"] == "DOCTOR_VERIFIED"
    assert get_fact.json()["data"]["confidence"] == 1.0
