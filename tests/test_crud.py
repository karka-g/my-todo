from app.database import SessionLocal  # SessionLocal, не Session
from app.crud import create_user, get_user_by_name
from app.schemas import CreateUser


def test_create_user():
    # Создаём сессию
    db = SessionLocal()

    try:
        # Создаём пользователя (правильный синтаксис)
        user = create_user(
            user=CreateUser(username="test_user"),
            session=db
        )
        print(f"✅ Создан пользователь: {user.name} (id={user.id})")

        # Ищем пользователя
        found = get_user_by_name(
            name="test_user",
            session=db
        )
        print(f"✅ Найден пользователь: {found.name} (id={found.id})")

    except Exception as e:
        print(f"❌ Ошибка: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    test_create_user()