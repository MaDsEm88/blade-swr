// lib/types/index.ts
export * from './auth';
export * from './utils';

// Re-export commonly used types for convenience
export type {
  UserRole,
  ExtendedUser,
  StudentUser,
  TeacherUser,
  SchoolAdminUser,
  ExtendedSession,
  AuthResponse,
  UseAuthReturn,
  UseUnifiedSessionReturn,
  LoginCredentials,
  SignUpData,
  RouteConfig,
  AuthClientConfig
} from './auth';

// Re-export utility functions
export {
  getUserDashboardUrl,
  getRolePrefix,
  canUserAccessRole,
  getUserDisplayName,
  getStudentProperties,
  getTeacherProperties,
  getSchoolAdminProperties,
  formatUserRole,
  getRoleColorScheme,
  validateUserForRole,
  createSafeUser
} from './utils';