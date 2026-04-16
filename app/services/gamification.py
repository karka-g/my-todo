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
    days_diff = (task.deadline.date() - now.date()).days

    # Досрочно (раньше дедлайна)
    if days_diff > 0:
        if days_diff >= 3:
            points = base * 2
            bonus = "x2"
        elif days_diff == 2:
            points = int(base * 1.5)
            bonus = "x1.5"
        else:  # 1 день
            points = base
            bonus = "x1"
        return points, f"Досрочно (за {days_diff} дн): {base} × {bonus} = {points} баллов"

    # Вовремя
    elif days_diff == 0:
        return base, f"Вовремя: {base} баллов"

    # Кринж
    else:
        days_late = abs(days_diff)
        penalty = days_late * 5
        points = max(base - penalty, 0)
        return points, f"Просрочка на {days_late} дн: {base} - {penalty} = {points} баллов"


def award_points_for_task(db: Session, task: Task, user_id: int):
    points, reason = calculate_points(task)
    crud.update_points(user_id, points, db)
    return points, reason