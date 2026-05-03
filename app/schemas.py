from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CreateUser(BaseModel):
    username: str


class DeleteUser(BaseModel):
    id: int


class GetUserInfo(BaseModel):
    id: int
    username: str
    points: int

    class Config:
        from_attributes = True


class UpdateUsername(BaseModel):
    new_username: str


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: int
    deadline: datetime


class DeleteTask(BaseModel):
    id: int


class GetTaskInfo(BaseModel):
    id: int
    title: str
    description: Optional[str]
    priority: int
    deadline: datetime
    is_completed: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TaskUpdate(BaseModel):
    new_title: Optional[str] = None
    new_description: Optional[str] = None
    new_priority: Optional[int] = None
    new_deadline: Optional[datetime] = None
    is_completed: Optional[bool] = None

    class Config:
        extra = "forbid"


class AttachmentBase(BaseModel):
    filename: str
    file_size: int
    file_type: str


class AttachmentCreate(AttachmentBase):
    task_id: int


class AttachmentResponse(AttachmentBase):
    id: int
    file_path: str
    uploaded_at: datetime
    task_id: int

    class Config:
        from_attributes = True
