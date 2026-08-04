from fastapi.testclient import TestClient
from app.main import app


def test_health_endpoint():
    """Test the /health endpoint returns 200 OK and Healthy status."""
    with TestClient(app) as client:
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "Healthy"}


def test_root_endpoint():
    """Test the / root endpoint returns 200 OK and app details."""
    with TestClient(app) as client:
        response = client.get("/")
        assert response.status_code == 200
        assert response.json() == {
            "app": "C3 Cafe POS",
            "version": "1.0.0",
            "status": "Running",
        }
