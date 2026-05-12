import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Attachment, CreateTaskDTO, LoginResponse, Task, UpdateTaskDTO, User } from './types';

// ДЛЯ ANDROID ЭМУЛЯТОРА:
const API_BASE_URL = 'http://10.0.2.2:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Добавляем токен к каждому запросу
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============= AUTH =============
export const register = (username: string) => 
  api.post<LoginResponse>('/auth/register', { username });

export const login = (username: string) => 
  api.post<LoginResponse>('/auth/login', { username });

export const checkUsername = (username: string) => 
  api.get<{ exists: boolean }>(`/auth/check/${username}`);

// ============= TASKS =============
export const getTasks = () => 
  api.get<Task[]>('/tasks');

export const createTask = (data: CreateTaskDTO) => 
  api.post<Task>('/tasks', data);

export const updateTask = (id: number, data: UpdateTaskDTO) => 
  api.put<Task>(`/tasks/${id}`, data);

export const deleteTask = (id: number) => 
  api.delete<{ message: string }>(`/tasks/${id}`);

export const completeTask = (id: number) => 
  api.post<Task>(`/tasks/${id}/complete`);

export const archiveTasks = () => 
  api.post<{ message: string; deleted_count: number }>('/tasks/archive');

// ============= USERS =============
export const getMe = () => 
  api.get<User>('/users/me');

export const updateUsername = (userId: number, newUsername: string) => 
  api.put<User>(`/users/${userId}/username`, { new_username: newUsername });

export const deleteUser = (userId: number) => 
  api.delete<{ message: string }>(`/users/${userId}`);

// ============= ATTACHMENTS =============
export const uploadAttachment = (taskId: number, file: any) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post<Attachment>(`/attachments/upload/${taskId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getTaskAttachments = (taskId: number) => 
  api.get<Attachment[]>(`/attachments/task/${taskId}`);

export const deleteAttachment = (attachmentId: number) => 
  api.delete<{ message: string }>(`/attachments/${attachmentId}`);