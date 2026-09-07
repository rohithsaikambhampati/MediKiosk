def test_queue_workflow_and_actions(client, test_patient):
    # 1. Enqueue patient
    queue_payload = {
        "token_number": "#102",
        "patient_id": test_patient.id,
        "priority": "HIGH_PRIORITY",
        "status": "AWAITING_TRIAGE",
    }
    resp = client.post("/api/v1/queue", json=queue_payload)
    assert resp.status_code == 201
    queue_item = resp.json()["data"]
    item_id = queue_item["id"]
    assert queue_item["token_number"] == "#102"
    assert queue_item["priority"] == "HIGH_PRIORITY"

    # 2. Escalate queue item
    esc_resp = client.post(f"/api/v1/queue/{item_id}/escalate", json={"priority": "IMMEDIATE"})
    assert esc_resp.status_code == 200
    assert esc_resp.json()["data"]["status"] == "ESCALATED"
    assert esc_resp.json()["data"]["priority"] == "IMMEDIATE"

    # 3. Update status to READY_FOR_DOCTOR
    call_resp = client.patch(f"/api/v1/queue/{item_id}", json={"status": "READY_FOR_DOCTOR"})
    assert call_resp.status_code == 200
    assert call_resp.json()["data"]["status"] == "READY_FOR_DOCTOR"
