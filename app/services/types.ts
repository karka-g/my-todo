// app/services/types.ts

// ===== AUTH =====
export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  username: string;
  created_at: string;
}

// ===== TASKS =====
export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: number;        // 1=низкий, 2=средний, 3=высокий
  deadline: string;        // ISO формат "2024-12-31T23:59:59"
  is_completed: boolean;
  created_at: string;
  completed_at?: string;
  user_id: number;
}

export interface CreateTaskDTO {
  title: string;
  description?: string;
  priority?: number;
  deadline?: string;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  priority?: number;
  deadline?: string;
  is_completed?: boolean;
}

// ===== ATTACHMENTS =====
export interface Attachment {
  id: number;
  filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  task_id: number;
  uploaded_at: string;
}