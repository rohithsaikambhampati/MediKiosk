def test_health_endpoint(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["ok", "degraded"]
    assert data["database"] == "ok"
    assert data["storage"] == "ok"
    assert data["ai_provider"] == "mock"
    assert data["ocr_provider"] == "mock"
    assert data["environment"] == "demo"


def test_ready_endpoint(client):
    response = client.get("/api/v1/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["status"] == "ready"
