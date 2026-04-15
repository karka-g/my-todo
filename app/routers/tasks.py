from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app import schemas, crud
from app.database import get_db
from app.dependencies import get_current_user
from app.services import gamification

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("/", response_model=schemas.GetTaskInfo)
async def create_task(
        task: schemas.TaskCreate,
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
):
    return crud.create_task(task, current_user.id, db)


@router.get("/", response_model=List[schemas.GetTaskInfo])
async def get_tasks(
        include_archived: Optional[bool] = False,
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
):
    return crud.get_tasks(current_user.id, db, include_archived)


@router.get("/{task_id}", response_model=schemas.GetTaskInfo)
async def get_task(
        task_id: int,
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
):
    task = crud.get_task(task_id, db)

    if not task or task.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Task not found")

    return task


@router.put("/{task_id}", response_model=schemas.GetTaskInfo)
async def update_task(
        task_id: int,
        task_update: schemas.TaskUpdate,
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
):
    task = crud.get_task(task_id, db)

    if not task or task.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Task not found")

    if task_update.new_title:
        task = crud.update_title(task_id, task_update.new_title, db)
    if task_update.new_description:
        task = crud.update_description(task_id, task_update.new_description, db)
    if task_update.new_priority:
        task = crud.update_priority(task_id, task_update.new_priority, db)
    if task_update.new_deadline:
        task = crud.update_deadline(task_id, task_update.new_deadline, db)

    return task


@router.delete("/{task_id}")
async def delete_task(
        task_id: int,
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
):
    task = crud.get_task(task_id, db)

    if not task or task.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Task not found")

    crud.delete_task(task_id, db)
    return {"message": "Task deleted"}


@router.post("/{task_id}/complete")
async def complete_task(
        task_id: int,
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
):
    task = crud.get_task(task_id, db)

    if not task or task.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Task not found")

    if task.is_completed:
        raise HTTPException(status_code=400, detail="Task already completed")

    task = crud.complete_task(task_id, db)

    points, reason = gamification.award_points_for_task(
        db, task, current_user.id
    )

    return {
        "message": "Task completed",
        "points": points,
        "reason": reason
    }


@router.post("/archive")
async def archive_tasks(
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
):
    count = crud.archive_completed_tasks(db, current_user.id)
    return {"archived": count}