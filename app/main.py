import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import schemas

app = FastAPI(
    title="MY TODO API",
    description='API для мобильного приложения MY TODO',
    version="1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """ Проверка работы API """
    return {
        "message": "Welcome to MY TODO API",
        "version": "1.0",
        "status": "running"
    }


@app.get("/healthcheck")
async def healthcheck():
    """ Проверка состояния сервера """
    return {
        "status": "ok"
    }


@app.get("/info")
async def info():
    """ Информация о доступных эндпоинтах API """
    return {
        "endpoints": {
            "users": {
                "create": "POST /users",
                "delete": "DELETE /users/{id}",
                "get": "GET /users/{id}",
                "update_username": "PUT /users/{id}/username",
            },
            "tasks": {
                "create": "POST /tasks",
                "delete": "DELETE /tasks/{id}",
                "get": "GET /tasks/{id}",
                "get_all": "GET /tasks",
                "update": "PUT /tasks/{id}",
            }
        },
        "documentation": "/docs"
    }


if __name__ == "__main__":
    uvicorn.run(app)