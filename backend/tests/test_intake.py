def test_intake_full_lifecycle(client, test_patient):
    # 1. Start intake session
    intake_payload = {
        "patient_id": test_patient.id,
        "language": "hi",
    }
    start_resp = client.post("/api/v1/intake/start", json=intake_payload)
    assert start_resp.status_code == 201
    intake_data = start_resp.json()["data"]
    intake_id = intake_data["id"]
    assert intake_data["status"] == "IN_PROGRESS"

    # 2. Record consent
    consent_payload = {
        "intake_id": intake_id,
        "patient_id": test_patient.id,
        "consent": {
            "voice_consent": True,
            "document_consent": True,
            "ai_processing_consent": True,
            "hospital_sharing_consent": True,
            "abha_consent": True,
        }
    }
    consent_resp = client.post("/api/v1/intake/consent", json=consent_payload)
    assert consent_resp.status_code == 201
    assert consent_resp.json()["data"]["voice_consent"] is True

    # 3. Add conversational message
    msg_payload = {
        "content": "मुझे सीने में भारीपन लग रहा है",
        "language": "hi",
        "source": "VOICE",
    }
    chat_resp = client.post(f"/api/v1/conversations/{intake_id}/messages", json=msg_payload)
    assert chat_resp.status_code == 201
    assert "user_message" in chat_resp.json()["data"]
    assert "assistant_message" in chat_resp.json()["data"]

    # 4. Finalize intake session -> Generates queue ticket & risk scoring
    fin_resp = client.post(f"/api/v1/intake/{intake_id}/finalize")
    assert fin_resp.status_code == 200
    fin_data = fin_resp.json()["data"]
    assert fin_data["status"] == "COMPLETED"
    assert fin_data["token_number"] is not None
