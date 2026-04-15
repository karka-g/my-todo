import unittest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import get_db
from app.models import Base, User
from app.dependencies import get_current_user


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

Base.metadata.create_all(bind=engine)


class FakeUser:
    def __init__(self, user_id=1):
        self.user_id = user_id
        self.id = user_id


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


def override_get_user():
    return FakeUser(1)


app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[get_current_user] = override_get_user


class TestUsersRouter(unittest.TestCase):

    def setUp(self):
        self.client = TestClient(app)

        db = TestingSessionLocal()

        # очистка таблицы users
        db.query(User).delete()

        # создаём тестового пользователя (id=1)
        user = User(id=1, name="testuser", points=100)
        db.add(user)

        # второй пользователь
        user2 = User(id=2, name="otheruser", points=50)
        db.add(user2)

        db.commit()
        db.close()

    def test_get_user_by_id_success(self):
        response = self.client.get("/users/2")

        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(data["id"], 2)
        self.assertEqual(data["username"], "otheruser")

    def test_get_user_by_id_not_found(self):
        response = self.client.get("/users/999")

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()["detail"], "User not found")

    def test_update_username(self):
        response = self.client.put("/users/1/username", json={
            "new_username": "updated_name"
        })

        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertEqual(data["username"], "updated_name")
        self.assertEqual(data["id"], 1)

    def test_update_username_user_not_found(self):
        response = self.client.put("/users/999/username", json={
            "new_username": "x"
        })

        self.assertEqual(response.status_code, 404)

    def test_delete_user(self):
        response = self.client.delete("/users/2")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["message"], "User deleted successfully")

    def test_delete_user_not_found(self):
        response = self.client.delete("/users/999")

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()["detail"], "User not found")


if __name__ == "__main__":
    unittest.main()