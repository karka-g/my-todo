from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
import shutil
from datetime import datetime
from typing import List

from app.database import get_db
from app.dependencies import get_current_user
from app import crud, schemas
from app.core.config import settings

router = APIRouter(prefix="/attachments", tags=["attachments"])


@router.post("/upload/{task_id}", response_model=schemas.AttachmentResponse)
async def upload_attachment(
        task_id: int,
        file: UploadFile = File(...),
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
):
    """
    Загрузить файл и прикрепить к задаче
    """
    # Проверяем, что задача существует и принадлежит пользователю
    task = crud.get_task(task_id, db)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Задача не найдена"
        )
    if task.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="У вас нет доступа к этой задаче"
        )

    # Проверяем размер файла
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)

    if file_size > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Файл слишком большой. Максимальный размер: {settings.MAX_FILE_SIZE} байт"
        )

    # Проверяем тип файла
    if file.content_type not in settings.ALLOWED_FILE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Тип файла {file.content_type} не поддерживается"
        )

    # Создаём директорию для uploads, если её нет
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    # Генерируем уникальное имя файла чтобы избежать коллизий
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_filename = f"{timestamp}_{task_id}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

    # Сохраняем файл
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Не удалось сохранить файл: {str(e)}"
        )

    # Создаём запись в БД
    attachment_data = schemas.AttachmentCreate(
        filename=file.filename,
        file_size=file_size,
        file_type=file.content_type,
        task_id=task_id
    )

    db_attachment = crud.create_attachment(
        attachment_data=attachment_data,
        file_path=safe_filename,
        session=db
    )

    return db_attachment


@router.get("/task/{task_id}", response_model=List[schemas.AttachmentResponse])
async def get_task_attachments(
        task_id: int,
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
):
    """
    Получить все вложения для задачи
    """
    # Проверяем, что задача существует и принадлежит пользователю
    task = crud.get_task(task_id, db)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Задача не найдена"
        )
    if task.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="У вас нет доступа к этой задаче"
        )

    attachments = crud.get_attachments_by_task(task_id, db)
    return attachments


@router.get("/download/{attachment_id}")
async def download_attachment(
        attachment_id: int,
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
):
    """
    Скачать файл вложения
    """
    attachment = crud.get_attachment(attachment_id, db)
    if not attachment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Вложение не найдено"
        )

    # Проверяем, что задача принадлежит пользователю
    task = crud.get_task(attachment.task_id, db)
    if not task or task.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="У вас нет доступа к этому файлу"
        )

    # Полный путь к файлу
    file_path = os.path.join(settings.UPLOAD_DIR, attachment.file_path)

    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Файл не найден на сервере"
        )

    return FileResponse(
        path=file_path,
        filename=attachment.filename,
        media_type=attachment.file_type
    )


@router.delete("/{attachment_id}")
async def delete_attachment(
        attachment_id: int,
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
):
    """
    Удалить вложение
    """
    attachment = crud.get_attachment(attachment_id, db)
    if not attachment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Вложение не найдено"
        )

    # Проверяем, что задача принадлежит пользователю
    task = crud.get_task(attachment.task_id, db)
    if not task or task.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="У вас нет доступа к этому вложению"
        )

    # Удаляем физический файл
    file_path = os.path.join(settings.UPLOAD_DIR, attachment.file_path)
    if os.path.exists(file_path):
        os.remove(file_path)

    # Удаляем запись из БД
    crud.delete_attachment(attachment_id, db)

    return {"message": "Вложение успешно удалено"}


@router.delete("/task/{task_id}/all")
async def delete_all_task_attachments(
        task_id: int,
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
):
    """
    Удалить все вложения задачи
    """
    # Проверяем, что задача существует и принадлежит пользователю
    task = crud.get_task(task_id, db)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Задача не найдена"
        )
    if task.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="У вас нет доступа к этой задаче"
        )

    # Получаем все вложения
    attachments = crud.get_attachments_by_task(task_id, db)

    # Удаляем физические файлы
    for attachment in attachments:
        file_path = os.path.join(settings.UPLOAD_DIR, attachment.file_path)
        if os.path.exists(file_path):
            os.remove(file_path)

    # Удаляем записи из БД
    count = crud.delete_attachments_by_task(task_id, db)

    return {"message": f"Удалено {count} вложений"}