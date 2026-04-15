from datetime import datetime
from sqlalchemy.orm import Session
from typing import Tuple

from app import crud
from app.models import Task


def get_base_points(priority: int) -> int:
    if priority >= 5:
        return 15
    elif priority >= 3:
        return 10
    else:
        return 5


def calculate_points(task: Task) -> Tuple[int, str]:
    base = get_base_points(task.priority)

    if not task.deadline:
        return base, f"{base} баллов"

    now = datetime.now()

    if now < task.deadline:
        return base, f"Досрочно: {base} баллов"

    elif now.date() == task.deadline.date():
        return base, f"Вовремя: {base} баллов"

    else:
        return 0, "Просрочено: 0 баллов"


def award_points_for_task(db: Session, task: Task, user_id: int):
    points, reason = calculate_points(task)
    crud.update_points(user_id, points, db)
    return points, reason