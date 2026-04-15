from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app import schemas, crud
from app.database import get_db
from app.dependencies import get_current_user

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("/", response_model=schemas.GetTaskInfo, status_code=201)
async def create_task(
        task: schemas.TaskCreate,
        db: Session = Depends(get_db),
        token_data: dict = Depends(get_current_user)
):
    user_id = token_data.get("user_id")
    new_task = crud.create_task(task, user_id, db)
    return {
        "id": new_task.id,
        "title": new_task.title,
        "description": new_task.description,
        "priority": new_task.priority,
        "deadline": new_task.deadline,
        "is_completed": new_task.is_completed,
        "created_at": new_task.created_at
    }


@router.get("/", response_model=List[schemas.GetTaskInfo])
async def get_tasks(
        include_archived: Optional[bool] = False,
        db: Session = Depends(get_db),
        token_data: dict = Depends(get_current_user)
):
    user_id = token_data.get("user_id")
    tasks = crud.get_tasks(user_id, db, include_archived)

    return [
        {
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "priority": t.priority,
            "deadline": t.deadline,
            "is_completed": t.is_completed,
            "created_at": t.created_at
        }
        for t in tasks
    ]


@router.get("/{task_id}", response_model=schemas.GetTaskInfo)
async def get_task(
        task_id: int,
        db: Session = Depends(get_db),
        token_data: dict = Depends(get_current_user)
):
    task = crud.get_task(task_id, db)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "priority": task.priority,
        "deadline": task.deadline,
        "is_completed": task.is_completed,
        "created_at": task.created_at
    }


@router.put("/{task_id}", response_model=schemas.GetTaskInfo)
async def update_task(
        task_id: int,
        task_update: schemas.TaskUpdate,
        db: Session = Depends(get_db)
):
    task = crud.get_task(task_id, db)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task_update.new_title:
        task = crud.update_title(task_id, task_update.new_title, db)
    if task_update.new_description:
        task = crud.update_description(task_id, task_update.new_description, db)
    if task_update.new_priority:
        task = crud.update_priority(task_id, task_update.new_priority, db)
    if task_update.new_deadline:
        task = crud.update_deadline(task_id, task_update.new_deadline, db)

    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "priority": task.priority,
        "deadline": task.deadline,
        "is_completed": task.is_completed,
        "created_at": task.created_at
    }


@router.delete("/{task_id}")
async def delete_task(
        task_id: int,
        db: Session = Depends(get_db)
):
    task = crud.get_task(task_id, db)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    crud.delete_task(task_id, db)
    return {"message": "Task deleted successfully"}


@router.post("/{task_id}/complete")
async def complete_task(
        task_id: int,
        db: Session = Depends(get_db)
):
    task = crud.get_task(task_id, db)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task.is_completed:
        raise HTTPException(status_code=400, detail="Task already completed")

    # Отмечаем как выполненную
    from app import schemas
    update_data = schemas.TaskUpdate(is_completed=True)

    # TODO: начислить баллы через gamification
    points_earned = 10 * task.priority

    return {
        "message": "Task completed",
        "points_earned": points_earned
    }


@router.post("/archive")
async def archive_tasks(
        db: Session = Depends(get_db),
        token_data: dict = Depends(get_current_user)
):
    user_id = token_data.get("user_id")
    archived_count = crud.archive_completed_tasks(db, user_id)
    return {"message": f"Archived {archived_count} tasks"}