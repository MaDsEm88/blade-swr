// lib/types/auth.ts
import type { User as BetterAuthUser, Session as BetterAuthSession } from "better-auth";

// Base user roles
export type UserRole = 'student' | 'teacher' | 'school_admin';

// Extended user interfaces for each role
export interface BaseUser extends Omit<BetterAuthUser, 'role'> {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null;
  role: UserRole;
  slug: string;
}

export interface StudentUser extends BaseUser {
  role: 'student';
  teacherId: string;
  isActive: boolean;
  classId?: string;
  grade?: string;
}

export interface TeacherUser extends BaseUser {
  role: 'teacher';
  isIndependent: boolean;
  schoolId?: string;
  department?: string;
  subjects?: string; // JSON string of array
  isVerified: boolean;
}

export interface SchoolAdminUser extends BaseUser {
  role: 'school_admin';
  schoolName?: string;
  schoolAddress?: string;
  schoolPlaceId?: string;
  schoolType?: string;
  schoolDistrict?: string;
  studentCount?: number;
  teacherCount?: number;
}

// Union type for all user types
export type ExtendedUser = StudentUser | TeacherUser | SchoolAdminUser;

// Session types
export interface ExtendedSession extends Omit<BetterAuthSession, 'user'> {
  user: ExtendedUser;
  session: {
    id: string;
    token: string;
    userId: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
}

// Auth response types
export interface AuthResponse<T = ExtendedUser> {
  data?: {
    user: T;
    session: ExtendedSession['session'];
  };
  error?: {
    message: string;
    status: number;
    statusText: string;
    code?: string;
  };
}

// Hook return types
export interface UseAuthReturn {
  user: ExtendedUser | null;
  session: ExtendedSession['session'] | null;
  signOut: () => Promise<any>;
  role: UserRole | null;
  isAuthenticated: boolean;
  canAccessRoute: (requiredRole?: string) => boolean;
  canAccessRoles: (allowedRoles: string[]) => boolean;
  _getLoadingState: () => boolean;
}

export interface UseUnifiedSessionReturn {
  session: ExtendedSession | null;
  signOut: () => Promise<any>;
  loading: boolean;
  role: UserRole | null;
  refreshSession: () => Promise<ExtendedSession | null>;
  isLoggingOut: boolean;
}

// Type guards
export function isStudentUser(user: ExtendedUser): user is StudentUser {
  return user.role === 'student';
}

export function isTeacherUser(user: ExtendedUser): user is TeacherUser {
  return user.role === 'teacher';
}

export function isSchoolAdminUser(user: ExtendedUser): user is SchoolAdminUser {
  return user.role === 'school_admin';
}

// Utility types for forms and API
export interface LoginCredentials {
  email?: string;
  username?: string;
  password?: string;
  otp?: string;
}

export interface SignUpData {
  email: string;
  name: string;
  password?: string;
  role: UserRole;
}

// Route protection types
export type RouteType = 'public' | 'protected' | 'auth-only';

export interface RouteConfig {
  path: string;
  type: RouteType;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

// Auth client configuration types
export interface AuthClientConfig {
  baseURL?: string;
  basePath?: string;
  fetchOptions?: {
    credentials?: RequestCredentials;
    [key: string]: any;
  };
  plugins?: any[];
}