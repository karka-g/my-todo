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


class TestTasksRouter(unittest.TestCase):

    def setUp(self):
        self.client = TestClient(app)

        db = TestingSessionLocal()

        # чистим таблицы
        db.query(Base.metadata.tables["tasks"]).delete()
        db.query(Base.metadata.tables["users"]).delete()

        # создаём пользователя
        user = User(id=1, name="test", points=0)
        db.add(user)

        db.commit()
        db.close()
    def test_create_task(self):
        response = self.client.post("/tasks/", json={
            "title": "Task 1",
            "description": "Desc",
            "priority": 3,
            "deadline": "2026-04-20T12:00:00"
        })

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["title"], "Task 1")
        self.assertEqual(data["priority"], 3)

    def test_get_tasks_empty(self):
        response = self.client.get("/tasks/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])

    def test_get_tasks_with_data(self):
        self.client.post("/tasks/", json={
            "title": "Task 1",
            "description": "Desc",
            "priority": 2,
            "deadline": "2026-04-20T12:00:00"
        })

        response = self.client.get("/tasks/")
        self.assertEqual(len(response.json()), 1)

    def test_get_task_success(self):
        create = self.client.post("/tasks/", json={
            "title": "Task 1",
            "description": "Desc",
            "priority": 2,
            "deadline": "2026-04-20T12:00:00"
        })

        task_id = create.json()["id"]

        response = self.client.get(f"/tasks/{task_id}")
        self.assertEqual(response.status_code, 200)

    def test_get_task_not_found(self):
        response = self.client.get("/tasks/999")
        self.assertEqual(response.status_code, 404)

    def test_update_task(self):
        create = self.client.post("/tasks/", json={
            "title": "Old",
            "description": "Old",
            "priority": 2,
            "deadline": "2026-04-20T12:00:00"
        })

        task_id = create.json()["id"]

        response = self.client.put(f"/tasks/{task_id}", json={
            "new_title": "New Title"
        })

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["title"], "New Title")

    def test_delete_task(self):
        create = self.client.post("/tasks/", json={
            "title": "ToDelete",
            "description": "Desc",
            "priority": 2,
            "deadline": "2026-04-20T12:00:00"
        })

        task_id = create.json()["id"]

        response = self.client.delete(f"/tasks/{task_id}")
        self.assertEqual(response.status_code, 200)

    def test_complete_task(self):
        create = self.client.post("/tasks/", json={
            "title": "Complete me",
            "description": "Desc",
            "priority": 3,
            "deadline": "2026-04-20T12:00:00"
        })

        task_id = create.json()["id"]

        response = self.client.post(f"/tasks/{task_id}/complete")

        self.assertEqual(response.status_code, 200)
        self.assertIn("points", response.json())
        self.assertIn("reason", response.json())

    def test_archive_tasks(self):
        self.client.post("/tasks/", json={
            "title": "Task 1",
            "description": "Desc",
            "priority": 2,
            "deadline": "2026-04-20T12:00:00"
        })

        response = self.client.post("/tasks/archive")

        self.assertEqual(response.status_code, 200)
        self.assertIn("archived", response.json())


if __name__ == "__main__":
    unittest.main()