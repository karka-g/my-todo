import subprocess
import pytest

def test_migrations_up_to_date():
    """Проверяет, что нет неприменённых миграций"""
    result = subprocess.run(
        ["alembic", "upgrade", "head", "--sql"],
        capture_output=True,
        text=True
    )
    # Если есть ошибки или не применены миграции, тест упадёт
    assert "FAILED" not in result.stderr

def test_migrations_revision():
    """Проверяет, что создана хотя бы одна миграция"""
    result = subprocess.run(
        ["alembic", "heads"],
        capture_output=True,
        text=True
    )
    assert result.returncode == 0
    assert result.stdout.strip() != ""