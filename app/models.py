from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy import String, Integer, DateTime, Boolean, ForeignKey
from typing import Optional
from sqlalchemy.orm import relationship
from datetime import datetime




class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(67))
    points: Mapped[int] = mapped_column(Integer(), default=0)
    created_at: Mapped[DateTime] = mapped_column(DateTime)

    tasks = relationship("Task", back_populates="user")



class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(200))
    priority: Mapped[int] = mapped_column(Integer, default=5)
    deadline: Mapped[DateTime] = mapped_column(DateTime,nullable=True)
    is_completed: Mapped[bool] = mapped_column(Boolean,default=False)
    is_archived: Mapped[bool] = mapped_column(Boolean,default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime,  default=datetime.now, nullable=False)
    completed_at: Mapped[DateTime] = mapped_column(DateTime, nullable=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    user = relationship("User", back_populates="tasks")



