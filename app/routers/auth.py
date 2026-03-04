from fastapi import APIRouter, HTTPException, status
from typing import Dict

from app import schemas

router = APIRouter(prefix="/auth", tags=["auth"])

# Временное хранилище пользователей (позже БД)
fake_users_db: Dict[int, schemas.GetUserInfo] = {}
current_id = 1


@router.post(
    "/register",
    response_model=schemas.GetUserInfo,
    status_code=status.HTTP_201_CREATED
)
async def register(user: schemas.CreateUser):
    """
    Регистрация нового пользователя.

    username: имя пользователя

    Возвращает:
    1. ID пользователя
    2. Имя пользователя
    3. Количество баллов (0 при регистрации)
    """
    global current_id

    for existing_user in fake_users_db.values():
        if existing_user.username == user.username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists"
            )

    new_user = schemas.GetUserInfo(
        id=current_id,
        username=user.username,
        points=0
    )

    fake_users_db[current_id] = new_user
    current_id += 1

    return new_user

@router.post("/login")
async def login(user: schemas.CreateUser):
    """
    Вход в систему.

    username: имя пользователя

    Возвращает:
    1. Токен доступа
    2. ID пользователя
    3. Имя пользователя
    """
    for user_id, existing_user in fake_users_db.items():
        if existing_user.username == user.username:
            return {
                "access_token": f"token_{user_id}",
                "token_type": "bearer",
                "user_id": user_id,
                "username": existing_user.username
            }

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="User not found"
    )

@router.get("/users")
async def get_all_users():
    return list(fake_users_db.values())

@router.get("/check/{username}")
async def check_username(username: str):
    for user in fake_users_db.values():
        if user.username == username:
            return {"available": False, "message": "Username already taken"}

    return {"available": True, "message": "Username is available"}