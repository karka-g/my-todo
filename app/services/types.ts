// app/services/types.ts

// ===== AUTH & USERS =====
export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface CreateUser {
  username: string;
}

export interface DeleteUser {
  id: number;
}

export interface GetUserInfo {
  id: number;
  username: string;
  points: number;
}

export interface UpdateUsername {
  new_username: string;
}

// ===== TASKS =====
export interface TaskCreate {
  title: string;
  description?: string;
  priority: number;
  deadline: string;  // ISO datetime string
}

export interface DeleteTask {
  id: number;
}

export interface GetTaskInfo {
  id: number;
  title: string;
  description?: string;
  priority: number;
  deadline: string;
  is_completed: boolean;
  created_at: string;
  completed_at?: string | null;  // ← добавить эту строку
}

export interface TaskUpdate {
  new_title?: string;
  new_description?: string;
  new_priority?: number;
  new_deadline?: string;  // ISO datetime string
  is_completed?: boolean;
}

// ===== ATTACHMENTS =====
export interface AttachmentBase {
  filename: string;
  file_size: number;
  file_type: string;
}

export interface AttachmentCreate extends AttachmentBase {
  task_id: number;
}

export interface AttachmentResponse extends AttachmentBase {
  id: number;
  file_path: string;
  uploaded_at: string;
  task_id: number;
}

// ===== RESPONSES =====
export interface Message {
  message: string;
}

export interface ArchiveResponse {
  message: string;
  deleted_count: number;
}