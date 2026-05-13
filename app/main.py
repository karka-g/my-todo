import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.routers import auth, users, tasks, attachments
from app.database import engine
from app.models import Base
from app.core.config import settings

# Создаём таблицы в БД
Base.metadata.create_all(bind=engine)

# Создаём папку для uploads, если её нет
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

app = FastAPI(
    title="MY TODO API",
    description='API для мобильного приложения MY TODO',
    version="1.0"
)

# Разрешаем запросы с фронта
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Монтируем статические файлы (для доступа к загруженным файлам)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Подключаем роутеры
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(tasks.router)
app.include_router(attachments.router)


@app.get("/")
async def root():
    return {
        "message": "Добро пожаловать в MY TODO API",
        "version": "1.0",
        "status": "работает"
    }


@app.get("/healthcheck")
async def healthcheck():
    return {"status": "ok"}


@app.get("/info")
async def info():
    return {
        "endpoints": {
            "auth": {
                "register": "POST /auth/register",
                "login": "POST /auth/login",
                "users": "GET /auth/users",
                "check": "GET /auth/check/{username}"
            },
            "users": {
                "get_me": "GET /users/me",
                "get_user": "GET /users/{user_id}",
                "update_username": "PUT /users/{user_id}/username",
                "delete_user": "DELETE /users/{user_id}"
            },
            "tasks": {
                "create": "POST /tasks",
                "get_all": "GET /tasks",
                "get_task": "GET /tasks/{task_id}",
                "update": "PUT /tasks/{task_id}",
                "delete": "DELETE /tasks/{task_id}",
                "complete": "POST /tasks/{task_id}/complete",
                "archive": "POST /tasks/archive"
            },
            "attachments": {
                "upload": "POST /attachments/upload/{task_id}",
                "get_task_attachments": "GET /attachments/task/{task_id}",
                "download": "GET /attachments/download/{attachment_id}",
                "delete_one": "DELETE /attachments/{attachment_id}",
                "delete_all": "DELETE /attachments/task/{task_id}/all"
            }
        },
        "documentation": "/docs"
    }


if __name__ == "__main__":
    uvicorn.run(
        app,
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
