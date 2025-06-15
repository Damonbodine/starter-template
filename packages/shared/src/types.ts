export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
  success: boolean;
}

export type Theme = 'light' | 'dark';

export interface AppConfig {
  theme: Theme;
  language: string;
  notifications: boolean;
}