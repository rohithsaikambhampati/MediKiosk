def test_create_and_get_patient(client):
    patient_payload = {
        "hospital_id": "MRN-204918",
        "name": "Sita Devi",
        "gender": "female",
        "age": 62,
        "phone": "+91-98111-22334",
        "abha_reference": "91-4412-9012-7721",
        "preferred_language": "hi",
    }
    resp = client.post("/api/v1/patients", json=patient_payload)
    assert resp.status_code == 201
    patient = resp.json()["data"]
    assert patient["name"] == "Sita Devi"
    assert patient["hospital_id"] == "MRN-204918"

    # Fetch by ID
    get_resp = client.get(f"/api/v1/patients/{patient['id']}")
    assert get_resp.status_code == 200
    assert get_resp.json()["data"]["abha_reference"] == "91-4412-9012-7721"


def test_search_patient(client, test_patient):
    resp = client.get("/api/v1/patients?query=Ramesh")
    assert resp.status_code == 200
    patients = resp.json()["data"]
    assert len(patients) >= 1
    assert patients[0]["hospital_id"] == "MRN-102948"
