from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from typing import Dict

from app import schemas, crud
from app.database import get_db

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=schemas.GetUserInfo, status_code=status.HTTP_201_CREATED)
async def register(user: schemas.CreateUser, db: Session = Depends(get_db)):
    existing_user = crud.get_user_by_name(user.username, db)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Имя пользователя уже существует"
        )
    new_user = crud.create_user(user, db)

    return {
        "id": new_user.id,
        "username": new_user.name,
        "points": new_user.points
    }

@router.post("/login")
async def login(user: schemas.CreateUser, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_name(user.username, db)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден"
        )

    return {
        "access_token": f"token_{db_user.id}",
        "token_type": "bearer",
        "user_id": db_user.id,
        "username": db_user.name
    }


@router.get("/users")
async def get_all_users(db: Session = Depends(get_db)):
    users = crud.get_all_users(db)
    return [
        {"id": u.id, "username": u.name, "points": u.points}
        for u in users
    ]


@router.get("/check/{username}")
async def check_username(username: str, db: Session = Depends(get_db)):
    user = crud.get_user_by_name(username, db)
    if user:
        return {"available": False, "message": "Имя пользователя уже занято"}
    return {"available": True, "message": "Доступное имя пользователя"}