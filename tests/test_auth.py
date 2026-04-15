import unittest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import get_db
from app.models import Base


# ТЕСТОВАЯ БД (отдельная от основной)
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# создаём таблицы
Base.metadata.create_all(bind=engine)


# dependency override
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


class TestAuthRouter(unittest.TestCase):

    def setUp(self):
        self.client = TestClient(app)

        # чистим таблицы перед каждым тестом
        db = TestingSessionLocal()
        db.query(Base.metadata.tables["users"]).delete()
        db.commit()
        db.close()

    def test_register_success(self):
        response = self.client.post("/auth/register", json={
            "username": "testuser"
        })

        self.assertEqual(response.status_code, 201)

        data = response.json()
        self.assertEqual(data["username"], "testuser")
        self.assertEqual(data["points"], 0)
        self.assertEqual(data["id"], 1)

    def test_register_duplicate(self):
        self.client.post("/auth/register", json={"username": "testuser"})

        response = self.client.post("/auth/register", json={
            "username": "testuser"
        })

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["detail"], "Имя пользователя уже существует")

    def test_login_success(self):
        self.client.post("/auth/register", json={"username": "testuser"})

        response = self.client.post("/auth/login", json={
            "username": "testuser"
        })

        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertEqual(data["access_token"], "token_1")
        self.assertEqual(data["token_type"], "bearer")
        self.assertEqual(data["user_id"], 1)
        self.assertEqual(data["username"], "testuser")

    def test_login_user_not_found(self):
        response = self.client.post("/auth/login", json={
            "username": "nosuchuser"
        })

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()["detail"], "Пользователь не найден")

    def test_get_all_users_empty(self):
        response = self.client.get("/auth/users")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])

    def test_get_all_users_with_data(self):
        self.client.post("/auth/register", json={"username": "user1"})
        self.client.post("/auth/register", json={"username": "user2"})

        response = self.client.get("/auth/users")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 2)

    def test_check_username_available(self):
        response = self.client.get("/auth/check/newuser")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["available"])

    def test_check_username_taken(self):
        self.client.post("/auth/register", json={"username": "testuser"})

        response = self.client.get("/auth/check/testuser")

        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.json()["available"])


if __name__ == "__main__":
    unittest.main()