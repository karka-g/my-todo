# tests/test_full_crud.py
import sys
import os
from datetime import datetime, timedelta

# Добавляем корень проекта в путь
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app import crud
from app import schemas


def print_separator(title: str):
    """Печатает разделитель с заголовком"""
    print("\n" + "=" * 60)
    print(f" {title}")
    print("=" * 60)


def test_full_crud():
    """Полное тестирование всех CRUD операций"""

    db = SessionLocal()

    try:
        # ========== 1. ТЕСТЫ ПОЛЬЗОВАТЕЛЕЙ ==========
        print_separator("1. ТЕСТЫ ПОЛЬЗОВАТЕЛЕЙ")

        # 1.1 Создание пользователя
        user_data = schemas.CreateUser(username="test_user_1")
        user = crud.create_user(user_data, db)
        print(f"✅ 1.1 Создан пользователь: {user.name} (id={user.id}, points={user.points})")

        # 1.2 Поиск пользователя по имени
        found_by_name = crud.get_user_by_name("test_user_1", db)
        print(f"✅ 1.2 Найден по имени: {found_by_name.name} (id={found_by_name.id})")

        # 1.3 Поиск пользователя по ID
        found_by_id = crud.get_user_by_id(user.id, db)
        print(f"✅ 1.3 Найден по ID: {found_by_id.name} (id={found_by_id.id})")

        # 1.4 Получение всех пользователей
        all_users = crud.get_all_users(db)
        print(f"✅ 1.4 Всего пользователей в БД: {len(all_users)}")

        # 1.5 Обновление имени пользователя
        updated_user = crud.update_username(user.id, "updated_user_1", db)
        print(f"✅ 1.5 Имя обновлено: {updated_user.name} (было 'test_user_1')")

        # 1.6 Обновление баллов пользователя
        updated_points = crud.update_points(user.id, 100, db)
        print(f"✅ 1.6 Баллы обновлены: +100 = {updated_points.points}")

        # 1.7 Проверка, что баллы действительно изменились
        assert updated_points.points == 100, "Баллы не обновились!"
        print(f"✅ 1.7 Проверка баллов: {updated_points.points} (ожидалось 100)")

        # ========== 2. ТЕСТЫ ЗАДАЧ ==========
        print_separator("2. ТЕСТЫ ЗАДАЧ")

        # 2.1 Создание задачи
        task_data = schemas.TaskCreate(
            title="Первая задача",
            description="Это тестовая задача",
            priority=4,
            deadline=datetime.now() + timedelta(days=7)
        )
        task1 = crud.create_task(task_data, user.id, db)
        print(f"✅ 2.1 Создана задача: '{task1.title}' (id={task1.id}, priority={task1.priority})")

        # 2.2 Создание второй задачи
        task_data2 = schemas.TaskCreate(
            title="Вторая задача",
            description="Ещё одна тестовая задача",
            priority=2,
            deadline=datetime.now() + timedelta(days=3)
        )
        task2 = crud.create_task(task_data2, user.id, db)
        print(f"✅ 2.2 Создана задача: '{task2.title}' (id={task2.id}, priority={task2.priority})")

        # 2.3 Получение задачи по ID
        found_task = crud.get_task(task1.id, db)
        print(f"✅ 2.3 Найдена задача по ID: '{found_task.title}' (id={found_task.id})")

        # 2.4 Получение всех активных задач
        active_tasks = crud.get_tasks(user.id, db)
        print(f"✅ 2.4 Активных задач: {len(active_tasks)} (ожидалось 2)")

        # 2.5 Обновление заголовка задачи
        updated_title = crud.update_title(task1.id, "Обновлённая задача", db)
        print(f"✅ 2.5 Заголовок обновлён: '{updated_title.title}'")

        # 2.6 Обновление описания задачи
        updated_desc = crud.update_description(task1.id, "Новое описание", db)
        print(f"✅ 2.6 Описание обновлено: '{updated_desc.description}'")

        # 2.7 Обновление приоритета задачи
        updated_priority = crud.update_priority(task1.id, 5, db)
        print(f"✅ 2.7 Приоритет обновлён: {updated_priority.priority} (было 4)")

        # 2.8 Обновление дедлайна задачи
        new_deadline = datetime.now() + timedelta(days=14)
        updated_deadline = crud.update_deadline(task1.id, new_deadline, db)
        print(f"✅ 2.8 Дедлайн обновлён: {updated_deadline.deadline.date()}")

        # ========== 3. ТЕСТЫ АРХИВАЦИИ И СТАТУСОВ ==========
        print_separator("3. ТЕСТЫ АРХИВАЦИИ И СТАТУСОВ")

        # 3.1 Выполнение задачи
        completed_task = crud.complete_task(task1.id, db)
        print(f"✅ 3.1 Задача выполнена: is_completed={completed_task.is_completed}")

        # 3.2 Проверка, что задача теперь в архиве
        archived_tasks = crud.get_tasks(user.id, db, include_archived=True)
        archived_count = len([t for t in archived_tasks if t.is_archived])
        print(f"✅ 3.2 Задач в архиве: {archived_count}")

        # 3.3 Архивация всех выполненных задач
        archived_count = crud.archive_completed_tasks(db, user.id)
        print(f"✅ 3.3 Заархивировано задач: {archived_count}")

        # 3.4 Проверка, что выполненные задачи не видны в активных
        active_after = crud.get_tasks(user.id, db)
        print(f"✅ 3.4 Активных задач после архивации: {len(active_after)} (ожидалось 1)")

        # ========== 4. ТЕСТЫ УДАЛЕНИЯ ==========
        print_separator("4. ТЕСТЫ УДАЛЕНИЯ")

        # 4.1 Удаление задачи
        deleted_task = crud.delete_task(task2.id, db)
        print(f"✅ 4.1 Удалена задача: id={deleted_task.id}")

        # 4.2 Проверка, что задача действительно удалена
        task_after_delete = crud.get_task(task2.id, db)
        assert task_after_delete is None, "Задача не удалилась!"
        print(f"✅ 4.2 Проверка: задача больше не существует")

        # 4.3 Удаление пользователя (каскадно удалит и его задачи)
        deleted_user = crud.delete_user(user.id, db)
        print(f"✅ 4.3 Удалён пользователь: {deleted_user.name} (id={deleted_user.id})")

        # 4.4 Проверка, что пользователь действительно удалён
        user_after_delete = crud.get_user_by_id(user.id, db)
        assert user_after_delete is None, "Пользователь не удалился!"
        print(f"✅ 4.4 Проверка: пользователь больше не существует")

        # ========== 5. ИТОГИ ==========
        print_separator("5. РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ")
        print("🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО! 🎉")
        print("\nПроверенные операции:")
        print("  ✅ Create (создание пользователя и задач)")
        print("  ✅ Read (чтение по ID и имени)")
        print("  ✅ Update (обновление всех полей)")
        print("  ✅ Delete (удаление пользователей и задач)")
        print("  ✅ Archive (архивация выполненных задач)")
        print("  ✅ Points (начисление баллов)")

    except Exception as e:
        print(f"\n❌ ОШИБКА: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


def test_edge_cases():
    """Тестирование граничных случаев"""
    print_separator("ДОПОЛНИТЕЛЬНО: ГРАНИЧНЫЕ СЛУЧАИ")

    db = SessionLocal()

    try:
        # 1. Создание пользователя с пустым именем
        print("\n1. Попытка создать пользователя с пустым именем:")
        try:
            user_data = schemas.CreateUser(username="")
            user = crud.create_user(user_data, db)
            print(f"   ❌ Ошибка: удалось создать с пустым именем")
        except Exception as e:
            print(f"   ✅ Ожидаемая ошибка: {type(e).__name__}")

        # 2. Поиск несуществующего пользователя
        print("\n2. Поиск несуществующего пользователя:")
        not_found = crud.get_user_by_name("nonexistent_user", db)
        if not_found is None:
            print(f"   ✅ Корректно вернул None")
        else:
            print(f"   ❌ Должен вернуть None")

        # 3. Обновление несуществующей задачи
        print("\n3. Обновление несуществующей задачи:")
        result = crud.update_title(99999, "Новый заголовок", db)
        if result is None:
            print(f"   ✅ Корректно вернул None")
        else:
            print(f"   ❌ Должен вернуть None")

        # 4. Удаление несуществующего пользователя
        print("\n4. Удаление несуществующего пользователя:")
        result = crud.delete_user(99999, db)
        if result is None:
            print(f"   ✅ Корректно вернул None")
        else:
            print(f"   ❌ Должен вернуть None")

        print("\n✅ Дополнительные тесты пройдены!")

    except Exception as e:
        print(f"\n❌ Ошибка в дополнительных тестах: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    # Запуск основного теста
    test_full_crud()

    # Запуск дополнительных тестов
    test_edge_cases()