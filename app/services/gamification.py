from datetime import datetime
from sqlalchemy.orm import Session
from typing import Tuple

from app import crud
from app.models import Task


def get_base_points(priority: int) -> int:
    """
    Получить базовые баллы за задачу в зависимости от приоритета.

    Приоритет:
    - 1-2: 5 баллов (низкий)
    - 3-4: 10 баллов (средний)
    - 5: 15 баллов (высокий)
    """
    if priority >= 5:
        return 15
    elif priority >= 3:
        return 10
    else:
        return 5


def calculate_points(task: Task) -> Tuple[int, str]:
    """
    Расчет баллов за выполнение задачи.

    Формула: points = base_points * bonus
    - base_points = 5, 10 или 15 (в зависимости от приоритета)
    - bonus = множитель за досрочное выполнение

    Бонус за досрочное выполнение:
    - В день дедлайна: x1 (без бонуса)
    - За 1 день до дедлайна: x1.5
    - За 2 дня до дедлайна: x2
    - За 3 дня и более: x2.5

    Штраф за просрочку:
    - За каждый день просрочки: -5 баллов
    """
    now = datetime.now()
    base_points = get_base_points(task.priority)

    # Досрочное выполнение (раньше дедлайна)
    if now < task.deadline:
        days_early = (task.deadline - now).days

        if days_early >= 3:
            bonus = 2.5
            bonus_text = "x2.5 (3+ дня)"
        elif days_early == 2:
            bonus = 2.0
            bonus_text = "x2 (2 дня)"
        elif days_early == 1:
            bonus = 1.5
            bonus_text = "x1.5 (1 день)"
        else:
            bonus = 1.0
            bonus_text = "x1 (в день дедлайна)"

        points = int(base_points * bonus)
        reason = f"Досрочное выполнение: {base_points} × {bonus_text} = {points} баллов"

    # Выполнение вовремя (в день дедлайна, в тот же день)
    elif now.date() == task.deadline.date():
        points = base_points
        reason = f"Выполнение вовремя: {base_points} баллов"

    # Просрочка (штраф)
    else:
        days_late = (now - task.deadline).days
        penalty = days_late * 5  # штраф 5 баллов за день
        points = max(base_points - penalty, 0)  # не ниже 0

        if points == 0:
            reason = f"Просрочка на {days_late} дней: 0 баллов (минимальный порог)"
        else:
            reason = f"Просрочка на {days_late} дней: {base_points} - {penalty} = {points} баллов"

    return points, reason


def award_points_for_task(db: Session, task: Task, user_id: int) -> Tuple[int, str]:
    """
    Начислить баллы пользователю за выполненную задачу.
    """
    points, reason = calculate_points(task)

    # Обновляем баллы пользователя в БД
    crud.update_points(user_id, points, db)

    return points, reason


def get_user_level(points: int) -> int:
    """
    Рассчитать уровень пользователя на основе баллов.

    Уровни:
    - 0-99: 1 уровень
    - 100-299: 2 уровень
    - 300-599: 3 уровень
    - 600-999: 4 уровень
    - 1000+: 5 уровень
    """
    if points >= 1000:
        return 5
    elif points >= 600:
        return 4
    elif points >= 300:
        return 3
    elif points >= 100:
        return 2
    else:
        return 1


def get_next_level_points(points: int) -> int:
    """
    Сколько баллов нужно до следующего уровня.
    """
    levels_threshold = {
        1: 100,
        2: 300,
        3: 600,
        4: 1000,
        5: None  # Максимальный уровень
    }

    current_level = get_user_level(points)
    next_threshold = levels_threshold.get(current_level + 1)

    if next_threshold is None:
        return 0  # Достигнут максимальный уровень

    return max(0, next_threshold - points)


def get_points_summary(priority: int) -> dict:
    """
    Получить сводку по баллам для задачи с указанным приоритетом.
    """
    base_points = get_base_points(priority)

    return {
        "priority": priority,
        "base_points": base_points,
        "bonus": {
            "в день дедлайна": base_points,
            "за 1 день до": int(base_points * 1.5),
            "за 2 дня до": int(base_points * 2),
            "за 3+ дня до": int(base_points * 2.5)
        },
        "penalty_per_day": 5
    }