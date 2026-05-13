import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {
  ArchiveResponse, // ← было User
  AttachmentResponse, // ← было UpdateTaskDTO
  GetTaskInfo,
  GetUserInfo, // ← было Task
  LoginResponse,
  TaskCreate, // ← было CreateTaskDTO
  TaskUpdate
} from './types';

// ДЛЯ ANDROID ЭМУЛЯТОРА:
// const API_BASE_URL = 'http://10.0.2.2:8000';
const API_BASE_URL = 'http://localhost:8000'; 


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Добавляем токен к каждому запросу
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  console.log('Токен в запросе:', token); // ← добавить эту строку
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
  api.get<GetTaskInfo[]>('/tasks');  // ← исправлено

export const createTask = (data: TaskCreate) =>   // ← исправлено
  api.post<GetTaskInfo>('/tasks', data);          // ← исправлено

export const updateTask = (id: number, data: TaskUpdate) =>   // ← исправлено
  api.put<GetTaskInfo>(`/tasks/${id}`, data);                 // ← исправлено

export const deleteTask = (id: number) => 
  api.delete<{ message: string }>(`/tasks/${id}`);

export const completeTask = (id: number) => 
  api.post<GetTaskInfo>(`/tasks/${id}/complete`);  // ← исправлено

export const archiveTasks = () => 
  api.post<ArchiveResponse>('/tasks/archive');  // ← исправлено

// ============= USERS =============
export const getMe = () => 
  api.get<GetUserInfo>('/users/me');  // ← исправлено

export const updateUsername = (userId: number, newUsername: string) => 
  api.put<GetUserInfo>(`/users/${userId}/username`, { new_username: newUsername });  // ← исправлено

export const deleteUser = (userId: number) => 
  api.delete<{ message: string }>(`/users/${userId}`);

// ============= ATTACHMENTS =============
export const uploadAttachment = (taskId: number, file: any) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post<AttachmentResponse>(`/attachments/upload/${taskId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getTaskAttachments = (taskId: number) => 
  api.get<AttachmentResponse[]>(`/attachments/task/${taskId}`);

export const deleteAttachment = (attachmentId: number) => 
  api.delete<{ message: string }>(`/attachments/${attachmentId}`);

export const getArchivedTasks = (userId: number) => 
  api.get('/tasks/archive', { params: { user_id: userId } });