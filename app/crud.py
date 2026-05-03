from sqlalchemy.orm import Session
from datetime import datetime

from app.models import User, Task, Attachment
from sqlalchemy import select
from app import schemas

from typing import List, Optional
from app.schemas import AttachmentCreate


def get_user_by_name(name: str, session) -> User | None:
    statement = select(User).where(User.name == name)
    db_object = session.scalars(statement).first()
    return db_object


def get_user_by_id(user_id: int, session) -> User | None:
    statement = select(User).where(User.id == user_id)
    db_object = session.scalars(statement).first()
    return db_object


def get_all_users(db: Session, skip: int = 0, limit: int = 100) -> list[type[User]]:
    return db.query(User).offset(skip).limit(limit).all()


def create_user(user: schemas.CreateUser, session) -> User:
    if not user.username or not user.username.strip():
        raise ValueError("Имя пользователя не может быть пустым")
    db_user = User(name=user.username)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def update_username(user_id: int, new_name: str, session) -> list[User] | None:
    db_user = get_user_by_id(user_id, session)
    if db_user:
        db_user.name = new_name
        session.commit()
        session.refresh(db_user)
    return db_user


def update_points(user_id: int, points_to_add: int, session) -> User | None:
    db_user = get_user_by_id(user_id, session)
    if db_user:
        db_user.points += points_to_add
        session.commit()
        session.refresh(db_user)
    return db_user


def delete_user(user_id: int, session) -> User | None:
    statement = select(User).where(User.id == user_id)
    db_object = session.scalars(statement).first()
    if db_object is None:
        return None
    session.delete(db_object)
    session.commit()
    return db_object


def get_task(task_id: int, session):
    statement = select(Task).where(Task.id == task_id)
    db_object = session.scalars(statement).first()
    return db_object


def get_tasks(user_id: int, session, include_archived: bool = False) -> list[Task]:
    """
    Получить задачи пользователя.

    Args:
        user_id: ID пользователя
        session: Сессия БД
        include_archived: Если True - показывает и архивные задачи тоже

    Returns:
        Список активных задач (не завершённых и не в архиве)
        Или все задачи пользователя, если include_archived=True
    """
    query = session.query(Task).filter(Task.user_id == user_id)

    if not include_archived:
        query = query.filter(
            Task.is_completed == False,
            Task.is_archived == False
        )
    query = query.order_by(Task.priority.desc(), Task.deadline.asc())

    return query.all()


def get_active_tasks(user_id: int, session) -> list[Task]:
    return get_tasks(user_id, session, include_archived=False)


def get_archived_tasks(user_id: int, session) -> list[Task]:
    return session.query(Task).filter(
        Task.user_id == user_id,
        Task.is_archived == True
    ).order_by(Task.completed_at.desc()).all()


def create_task(task: schemas.TaskCreate, user_id: int, session):
    db_task = Task(title=task.title, description=task.description, priority=task.priority, deadline=task.deadline,
                   user_id=user_id)
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task


def update_title(task_id: int, new_title: str, session):
    db_task = get_task(task_id, session)
    if db_task:
        db_task.title = new_title
        session.commit()
        session.refresh(db_task)
    return db_task


def update_description(task_id: int, new_description: str, session):
    db_task = get_task(task_id, session)
    if db_task:
        db_task.description = new_description
        session.commit()
        session.refresh(db_task)
    return db_task


def update_priority(task_id: int, new_priority: int, session):
    db_task = get_task(task_id, session)
    if db_task:
        db_task.priority = new_priority
        session.commit()
        session.refresh(db_task)
    return db_task


def update_deadline(task_id: int, new_deadline: datetime, session):
    db_task = get_task(task_id, session)
    if db_task:
        db_task.deadline = new_deadline
        session.commit()
        session.refresh(db_task)
    return db_task


def delete_task(task_id: int, session) -> Task | None:
    statement = select(Task).where(Task.id == task_id)
    db_object = session.scalars(statement).first()
    if db_object is None:
        return None
    session.delete(db_object)
    session.commit()
    return db_object


def archive_completed_tasks(db: Session, user_id: int):
    tasks = db.query(Task).filter(
        Task.user_id == user_id,
        Task.is_completed == True,
        Task.is_archived == False
    ).all()

    for task in tasks:
        task.is_archived = True

    db.commit()
    return len(tasks)


def complete_task(task_id: int, session) -> Task | None:
    """Отметить задачу как выполненную"""
    db_task = get_task(task_id, session)
    if db_task and not db_task.is_completed:
        db_task.is_completed = True
        db_task.completed_at = datetime.now()
        # Задача НЕ автоматически архивируется здесь,
        # это делает отдельная функция archive_completed_tasks
        session.commit()
        session.refresh(db_task)
    return db_task


def create_attachment(
        attachment_data: AttachmentCreate,
        file_path: str,
        session
) -> Attachment:
    db_attachment = Attachment(
        filename=attachment_data.filename,
        file_path=file_path,
        file_size=attachment_data.file_size,
        file_type=attachment_data.file_type,
        task_id=attachment_data.task_id
    )
    session.add(db_attachment)
    session.commit()
    session.refresh(db_attachment)
    return db_attachment


def get_attachments_by_task(task_id: int, session: Session) -> List[type[Attachment]]:
    return session.query(Attachment).filter(Attachment.task_id == task_id).all()


def get_attachment(attachment_id: int, session) -> Optional[Attachment]:
    statement = select(Attachment).where(Attachment.id == attachment_id)
    db_object = session.scalars(statement).first()
    return db_object


def delete_attachment(attachment_id: int, session) -> Attachment | None:
    statement = select(Attachment).where(Attachment.id == attachment_id)
    db_object = session.scalars(statement).first()
    if db_object is None:
        return None
    session.delete(db_object)
    session.commit()
    return db_object


def delete_attachments_by_task(task_id: int, session: Session) -> int:
    attachments = get_attachments_by_task(task_id, session)
    count = len(attachments)
    for attachment in attachments:
        session.delete(attachment)
    session.commit()
    return count
