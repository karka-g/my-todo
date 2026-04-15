import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, users, tasks
from app.database import Base, engine

Base.metadata.create_all(bind=engine)

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

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(tasks.router)

@app.get("/")
async def root():
    return {
        "message": "Welcome to MY TODO API",
        "version": "1.0",
        "status": "running"
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
            }
        },
        "documentation": "/docs"
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)