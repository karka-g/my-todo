from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app import schemas, crud
from app.database import get_db
from app.dependencies import get_current_user

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=schemas.GetUserInfo)
async def get_current_user_info(
        token_data: dict = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    user_id = token_data.get("user_id")
    user = crud.get_user_by_id(user_id, db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user.id,
        "username": user.name,
        "points": user.points
    }


@router.get("/{user_id}", response_model=schemas.GetUserInfo)
async def get_user(
        user_id: int,
        db: Session = Depends(get_db)
):
    user = crud.get_user_by_id(user_id, db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user.id,
        "username": user.name,
        "points": user.points
    }


@router.put("/{user_id}/username", response_model=schemas.GetUserInfo)
async def update_username(
        user_id: int,
        username_data: schemas.UpdateUsername,
        db: Session = Depends(get_db)
):
    user = crud.get_user_by_id(user_id, db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    updated_user = crud.update_username(user_id, username_data.new_username, db)
    return {
        "id": updated_user.id,
        "username": updated_user.name,
        "points": updated_user.points
    }


@router.delete("/{user_id}")
async def delete_user(
        user_id: int,
        db: Session = Depends(get_db)
):
    user = crud.get_user_by_id(user_id, db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    crud.delete_user(user_id, db)
    return {"message": "User deleted successfully"}