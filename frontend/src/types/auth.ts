/** Роль пользователя (совпадает с API). */
export type UserRole = "super_admin" | "owner" | "admin" | "manager";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  restaurant_id: string | null;
  is_active: boolean;
}

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isInitialized: boolean;
}
