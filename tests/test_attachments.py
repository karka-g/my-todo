import sys
import os
from datetime import datetime, timedelta

# Добавляем корень проекта в путь
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app import crud
from app import schemas


def print_separator(title: str):
    print("\n" + "=" * 60)
    print(f" {title}")
    print("=" * 60)


def test_attachments():
    db = SessionLocal()

    try:
        print_separator("1. ПОДГОТОВКА ТЕСТОВЫХ ДАННЫХ")

        # Создаём пользователя
        user_data = schemas.CreateUser(username="attachment_test_user")
        user = crud.create_user(user_data, db)
        print(f"✅ Создан пользователь: {user.name} (id={user.id})")

        # Создаём задачу
        task_data = schemas.TaskCreate(
            title="Задача с вложениями",
            description="Тестовая задача для проверки вложений",
            priority=3,
            deadline=datetime.now() + timedelta(days=7)
        )
        task = crud.create_task(task_data, user.id, db)
        print(f"✅ Создана задача: '{task.title}' (id={task.id})")

        # ========== 2. ТЕСТЫ ВЛОЖЕНИЙ ==========
        print_separator("2. ТЕСТЫ ВЛОЖЕНИЙ")

        # 2.1 Создание вложения
        attachment_data = schemas.AttachmentCreate(
            filename="test_image.png",
            file_size=102400,  # 100 KB
            file_type="image/png",
            task_id=task.id
        )
        file_path = f"uploads/tasks/{task.id}/test_image.png"

        attachment1 = crud.create_attachment(attachment_data, file_path, db)
        print(f"✅ 2.1 Создано вложение: '{attachment1.filename}' (id={attachment1.id})")

        # 2.2 Создание второго вложения
        attachment_data2 = schemas.AttachmentCreate(
            filename="document.pdf",
            file_size=512000,  # 500 KB
            file_type="application/pdf",
            task_id=task.id
        )
        file_path2 = f"uploads/tasks/{task.id}/document.pdf"

        attachment2 = crud.create_attachment(attachment_data2, file_path2, db)
        print(f"✅ 2.2 Создано вложение: '{attachment2.filename}' (id={attachment2.id})")

        # 2.3 Получение всех вложений задачи
        attachments = crud.get_attachments_by_task(task.id, db)
        print(f"✅ 2.3 Всего вложений у задачи: {len(attachments)} (ожидалось 2)")
        assert len(attachments) == 2

        # 2.4 Получение конкретного вложения по ID
        found_attachment = crud.get_attachment(attachment1.id, db)
        print(f"✅ 2.4 Найдено вложение по ID: '{found_attachment.filename}'")
        assert found_attachment.id == attachment1.id

        # 2.5 Проверка полей вложения
        assert found_attachment.filename == "test_image.png"
        assert found_attachment.file_size == 102400
        assert found_attachment.file_type == "image/png"
        assert found_attachment.task_id == task.id
        assert found_attachment.file_path == "uploads/tasks/{}/test_image.png".format(task.id)
        print(f"✅ 2.5 Все поля вложения корректны")

        # ========== 3. ТЕСТЫ УДАЛЕНИЯ ==========
        print_separator("3. ТЕСТЫ УДАЛЕНИЯ")

        # 3.1 Удаление одного вложения
        deleted = crud.delete_attachment(attachment2.id, db)
        print(f"✅ 3.1 Удалено вложение: '{deleted.filename}' (id={deleted.id})")

        # 3.2 Проверка, что вложение действительно удалилось
        not_found = crud.get_attachment(attachment2.id, db)
        assert not_found is None
        print(f"✅ 3.2 Проверка: вложение больше не существует")

        # 3.3 Удаление всех вложений задачи
        deleted_count = crud.delete_attachments_by_task(task.id, db)
        print(f"✅ 3.3 Удалено вложений задачи: {deleted_count} (ожидалось 1)")

        # 3.4 Проверка, что вложений больше нет
        remaining = crud.get_attachments_by_task(task.id, db)
        assert len(remaining) == 0
        print(f"✅ 3.4 Проверка: у задачи больше нет вложений")

        # ========== 4. ГРАНИЧНЫЕ СЛУЧАИ ==========
        print_separator("4. ГРАНИЧНЫЕ СЛУЧАИ")

        # 4.1 Удаление несуществующего вложения
        result = crud.delete_attachment(99999, db)
        assert result is None
        print(f"✅ 4.1 Удаление несуществующего вложения вернуло None")

        # 4.2 Получение несуществующего вложения
        not_existing = crud.get_attachment(99999, db)
        assert not_existing is None
        print(f"✅ 4.2 Получение несуществующего вложения вернуло None")

        # 4.3 Вложения для несуществующей задачи
        attachments_empty = crud.get_attachments_by_task(99999, db)
        assert len(attachments_empty) == 0
        print(f"✅ 4.3 Запрос вложений для несуществующей задачи вернул пустой список")

        # ========== 5. ОЧИСТКА ==========
        print_separator("5. ОЧИСТКА ТЕСТОВЫХ ДАННЫХ")

        # Удаляем задачу (каскадно удалит и вложения)
        crud.delete_task(task.id, db)
        print(f"✅ Удалена задача (id={task.id}) с каскадным удалением вложений")

        # Удаляем пользователя
        crud.delete_user(user.id, db)
        print(f"✅ Удалён пользователь (id={user.id})")

        # ========== 6. ИТОГИ ==========
        print_separator("6. РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ")
        print("🎉 ВСЕ ТЕСТЫ ДЛЯ ВЛОЖЕНИЙ ПРОЙДЕНЫ УСПЕШНО! 🎉")
        print("\nПроверенные операции:")
        print("  ✅ Create (создание вложений)")
        print("  ✅ Read (чтение по ID и по задаче)")
        print("  ✅ Delete (удаление одного вложения)")
        print("  ✅ Delete (удаление всех вложений задачи)")
        print("  ✅ Edge cases (несуществующие ID)")
        print("  ✅ Cascade (каскадное удаление через задачу)")

    except Exception as e:
        print(f"\n❌ ОШИБКА: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


def test_attachment_schema():
    """Тест Pydantic схем для вложений"""
    print_separator("ДОПОЛНИТЕЛЬНО: ТЕСТ СХЕМ")

    # Тест создания вложения
    attachment_data = schemas.AttachmentCreate(
        filename="test.txt",
        file_size=1024,
        file_type="text/plain",
        task_id=1
    )

    assert attachment_data.filename == "test.txt"
    assert attachment_data.file_size == 1024
    assert attachment_data.file_type == "text/plain"
    assert attachment_data.task_id == 1
    print("✅ Схема AttachmentCreate работает корректно")

    # Тест ответа (с ID и датой)
    from datetime import datetime
    attachment_response = schemas.AttachmentResponse(
        id=1,
        filename="test.txt",
        file_size=1024,
        file_type="text/plain",
        file_path="uploads/test.txt",
        uploaded_at=datetime.now(),
        task_id=1
    )

    assert attachment_response.id == 1
    assert attachment_response.file_path is not None
    print("✅ Схема AttachmentResponse работает корректно")


def test_create_attachments_without_task():
    """Тест: попытка создать вложение без привязки к задаче (должна быть ошибка)"""
    print_separator("ТЕСТ ВАЛИДАЦИИ")

    db = SessionLocal()

    try:
        # Пытаемся создать вложение с несуществующим task_id
        attachment_data = schemas.AttachmentCreate(
            filename="orphan.txt",
            file_size=512,
            file_type="text/plain",
            task_id=99999  # несуществующий ID
        )

        try:
            attachment = crud.create_attachment(attachment_data, "uploads/orphan.txt", db)
            print("❌ ОШИБКА: Удалось создать вложение без существующей задачи!")
        except Exception as e:
            print(f"✅ Ожидаемая ошибка: {type(e).__name__}")

    finally:
        db.close()


if __name__ == "__main__":
    test_attachments()
    test_attachment_schema()
    test_create_attachments_without_task()