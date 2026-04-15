import unittest
from unittest.mock import MagicMock
from datetime import datetime, timedelta

from app.services import gamification
from app.models import Task


class TestGamification(unittest.TestCase):

    def create_task(self, priority=3, deadline=None):
        task = MagicMock(spec=Task)
        task.priority = priority
        task.deadline = deadline
        return task


    def test_base_points_low(self):
        self.assertEqual(gamification.get_base_points(1), 5)
        self.assertEqual(gamification.get_base_points(2), 5)

    def test_base_points_medium(self):
        self.assertEqual(gamification.get_base_points(3), 10)
        self.assertEqual(gamification.get_base_points(4), 10)

    def test_base_points_high(self):
        self.assertEqual(gamification.get_base_points(5), 15)
        self.assertEqual(gamification.get_base_points(10), 15)


    def test_calculate_points_no_deadline(self):
        task = self.create_task(priority=3, deadline=None)
        points, reason = gamification.calculate_points(task)

        self.assertEqual(points, 10)
        self.assertIn("баллов", reason)

    def test_calculate_points_today(self):
        task = self.create_task(
            priority=3,
            deadline=datetime.now()
        )

        points, reason = gamification.calculate_points(task)

        self.assertEqual(points, 10)
        self.assertIn("Вовремя", reason)

    def test_calculate_points_early(self):
        task = self.create_task(
            priority=3,
            deadline=datetime.now() + timedelta(days=2)
        )

        points, reason = gamification.calculate_points(task)

        self.assertEqual(points, 10)
        self.assertIn("Досрочно", reason)

    def test_calculate_points_late(self):
        task = self.create_task(
            priority=3,
            deadline=datetime.now() - timedelta(days=2)
        )

        points, reason = gamification.calculate_points(task)

        self.assertEqual(points, 0)
        self.assertIn("Просрочено", reason)


    def test_award_points_calls_crud(self):
        task = self.create_task(priority=3)

        db = MagicMock()

        # подменяем crud.update_points
        gamification.crud.update_points = MagicMock()

        points, reason = gamification.award_points_for_task(db, task, user_id=1)

        gamification.crud.update_points.assert_called_once()
        self.assertIsInstance(points, int)
        self.assertIsInstance(reason, str)


if __name__ == "__main__":
    unittest.main()