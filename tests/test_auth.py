import unittest
from fastapi.testclient import TestClient
from app.main import app
from app.routers import auth

class TestAuthRouter(unittest.TestCase):

    def setUp(self):
        auth.fake_users_db.clear()
        auth.current_id = 1
        self.client = TestClient(app)

    def test_register_success(self):
        response = self.client.post("/auth/register", json={"username": "testuser"})
        self.assertEqual(response.status_code, 201)  # меняем с 200 на 201
        data = response.json()
        self.assertEqual(data["username"], "testuser")
        self.assertEqual(data["points"], 0)
        self.assertEqual(data["id"], 1)

    def test_register_duplicate(self):
        self.client.post("/auth/register", json={"username": "testuser"})
        response = self.client.post("/auth/register", json={"username": "testuser"})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["detail"], "Username already exists")

    def test_register_empty_username(self):
        response = self.client.post("/auth/register", json={"username": ""})
        self.assertEqual(response.status_code, 201)

    def test_login_success(self):
        self.client.post("/auth/register", json={"username": "testuser"})
        response = self.client.post("/auth/login", json={"username": "testuser"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["access_token"], "token_1")
        self.assertEqual(data["token_type"], "bearer")
        self.assertEqual(data["user_id"], 1)
        self.assertEqual(data["username"], "testuser")

    def test_login_user_not_found(self):
        response = self.client.post("/auth/login", json={"username": "nosuchuser"})
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()["detail"], "User not found")

    def test_get_all_users_empty(self):
        response = self.client.get("/auth/users")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])

    def test_get_all_users_with_data(self):
        self.client.post("/auth/register", json={"username": "user1"})
        self.client.post("/auth/register", json={"username": "user2"})

        response = self.client.get("/auth/users")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 2)

    def test_check_username_available(self):
        response = self.client.get("/auth/check/newuser")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["available"])

    def test_check_username_taken(self):
        self.client.post("/auth/register", json={"username": "testuser"})
        response = self.client.get("/auth/check/testuser")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertFalse(data["available"])


if __name__ == "__main__":
    unittest.main()