def test_register_and_login_flow(client):
    # 1. Register new doctor
    reg_payload = {
        "name": "Dr. Ramesh Sharma",
        "email": "sharma@example.com",
        "password": "securepassword123",
        "role": "DOCTOR",
    }
    response = client.post("/api/v1/auth/register", json=reg_payload)
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["data"]["email"] == "sharma@example.com"
    assert data["data"]["role"] == "DOCTOR"

    # 2. Login with credentials
    login_payload = {
        "email": "sharma@example.com",
        "password": "securepassword123",
    }
    login_resp = client.post("/api/v1/auth/login", json=login_payload)
    assert login_resp.status_code == 200
    login_data = login_resp.json()
    assert login_data["success"] is True
    token = login_data["data"]["access_token"]
    assert token is not None

    # 3. Access current user profile with token
    headers = {"Authorization": f"Bearer {token}"}
    me_resp = client.get("/api/v1/auth/me", headers=headers)
    assert me_resp.status_code == 200
    assert me_resp.json()["data"]["email"] == "sharma@example.com"


def test_login_invalid_password(client):
    login_payload = {
        "email": "dr.nonexistent@medikiosk.org",
        "password": "wrongpassword",
    }
    resp = client.post("/api/v1/auth/login", json=login_payload)
    assert resp.status_code == 401
    assert resp.json()["success"] is False
