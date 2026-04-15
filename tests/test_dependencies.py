# tests/test_dependencies.py
import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from app.dependencies import get_current_user
from app.database import SessionLocal
from app.crud import create_user
from app.schemas import CreateUser


def test_get_current_user_valid_token():
    """Тест получения пользователя по валидному токену"""
    db = SessionLocal()

    # Создаём тестового пользователя
    user = create_user(CreateUser(username="test_auth"), db)

    # Создаём правильный объект HTTPAuthorizationCredentials
    # (это объект, который приходит от FastAPI)
    credentials = HTTPAuthorizationCredentials(
        scheme="Bearer",
        credentials=f"token_{user.id}"
    )

    # Проверяем
    current_user = get_current_user(credentials, db)
    assert current_user.id == user.id
    assert current_user.name == "test_auth"

    # Очистка
    from app.crud import delete_user
    delete_user(user.id, db)
    db.close()


def test_get_current_user_invalid_token_format():
    """Тест с неверным форматом токена"""
    db = SessionLocal()

    credentials = HTTPAuthorizationCredentials(
        scheme="Bearer",
        credentials="invalid_token"  # не начинается с "token_"
    )

    with pytest.raises(HTTPException) as exc_info:
        get_current_user(credentials, db)

    assert exc_info.value.status_code == 401
    assert "Invalid token format" in str(exc_info.value.detail)

    db.close()


def test_get_current_user_token_without_id():
    """Тест с токеном, у которого нет ID после подчёркивания"""
    db = SessionLocal()

    credentials = HTTPAuthorizationCredentials(
        scheme="Bearer",
        credentials="token_"  # нет ID
    )

    with pytest.raises(HTTPException) as exc_info:
        get_current_user(credentials, db)

    assert exc_info.value.status_code == 401
    assert "Invalid token" in str(exc_info.value.detail)

    db.close()


def test_get_current_user_nonexistent_user():
    """Тест с токеном, указывающим на несуществующего пользователя"""
    db = SessionLocal()

    credentials = HTTPAuthorizationCredentials(
        scheme="Bearer",
        credentials="token_99999"  # пользователя с ID 99999 нет
    )

    with pytest.raises(HTTPException) as exc_info:
        get_current_user(credentials, db)

    assert exc_info.value.status_code == 401
    assert "User not found" in str(exc_info.value.detail)

    db.close()