import unittest
from fastapi.testclient import TestClient
from app.main import app

class TestMainAPI(unittest.TestCase):

    def setUp(self):
        self.client = TestClient(app)

    def test_root_status(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)

    def test_root_data(self):
        response = self.client.get("/")
        data = response.json()
        self.assertEqual(data["message"], "Welcome to MY TODO API")
        self.assertEqual(data["version"], "1.0")
        self.assertEqual(data["status"], "running")

    def test_healthcheck_status(self):
        response = self.client.get("/healthcheck")
        self.assertEqual(response.status_code, 200)

    def test_healthcheck_data(self):
        response = self.client.get("/healthcheck")
        self.assertEqual(response.json()["status"], "ok")

    def test_info_status(self):
        response = self.client.get("/info")
        self.assertEqual(response.status_code, 200)

    def test_info_contains_endpoints(self):
        response = self.client.get("/info")
        data = response.json()
        self.assertIn("endpoints", data)
        self.assertIn("users", data["endpoints"])
        self.assertIn("tasks", data["endpoints"])

    def test_nonexistent_endpoint(self):
        response = self.client.get("/nonexistent")
        self.assertEqual(response.status_code, 404)

if __name__ == '__main__':
    unittest.main()