// lib/types/utils.ts
import type { ExtendedUser, UserRole, StudentUser, TeacherUser, SchoolAdminUser } from './auth';

/**
 * Type-safe utility functions for working with user objects
 */

/**
 * Get the correct dashboard URL for a user based on their role
 */
export function getUserDashboardUrl(user: ExtendedUser): string {
  const rolePrefix = user.role === 'school_admin' ? 'school' : user.role;
  return `/${rolePrefix}/${user.slug}`;
}

/**
 * Get the role prefix for routing
 */
export function getRolePrefix(role: UserRole): string {
  return role === 'school_admin' ? 'school' : role;
}

/**
 * Check if a user can access a specific role-based route
 */
export function canUserAccessRole(user: ExtendedUser | null, allowedRoles: UserRole[]): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}

/**
 * Get user display name with fallbacks
 */
export function getUserDisplayName(user: ExtendedUser): string {
  return user.name || user.email || user.slug || 'User';
}

/**
 * Get role-specific user properties with type safety
 */
export function getStudentProperties(user: ExtendedUser): StudentUser | null {
  if (user.role !== 'student') return null;
  return user as StudentUser;
}

export function getTeacherProperties(user: ExtendedUser): TeacherUser | null {
  if (user.role !== 'teacher') return null;
  return user as TeacherUser;
}

export function getSchoolAdminProperties(user: ExtendedUser): SchoolAdminUser | null {
  if (user.role !== 'school_admin') return null;
  return user as SchoolAdminUser;
}

/**
 * Format user role for display
 */
export function formatUserRole(role: UserRole): string {
  switch (role) {
    case 'student':
      return 'Student';
    case 'teacher':
      return 'Teacher';
    case 'school_admin':
      return 'School Administrator';
    default:
      return 'User';
  }
}

/**
 * Get role-specific color scheme
 */
export function getRoleColorScheme(role: UserRole): {
  primary: string;
  secondary: string;
  accent: string;
} {
  switch (role) {
    case 'student':
      return {
        primary: 'green-600',
        secondary: 'green-100',
        accent: 'green-500'
      };
    case 'teacher':
      return {
        primary: 'blue-600',
        secondary: 'blue-100',
        accent: 'blue-500'
      };
    case 'school_admin':
      return {
        primary: 'purple-600',
        secondary: 'purple-100',
        accent: 'purple-500'
      };
    default:
      return {
        primary: 'gray-600',
        secondary: 'gray-100',
        accent: 'gray-500'
      };
  }
}

/**
 * Validate user object has required fields for their role
 */
export function validateUserForRole(user: any, role: UserRole): boolean {
  const baseFields = ['id', 'email', 'name', 'slug'];
  
  // Check base fields
  for (const field of baseFields) {
    if (!user[field]) return false;
  }
  
  // Check role-specific required fields
  switch (role) {
    case 'student':
      return !!user.teacherId;
    case 'teacher':
      return typeof user.isIndependent === 'boolean';
    case 'school_admin':
      return true; // No additional required fields
    default:
      return false;
  }
}

/**
 * Create a safe user object with defaults
 */
export function createSafeUser(userData: any, role: UserRole): ExtendedUser {
  const baseUser = {
    id: userData.id || '',
    email: userData.email || '',
    name: userData.name || '',
    emailVerified: userData.emailVerified || false,
    createdAt: userData.createdAt || new Date(),
    updatedAt: userData.updatedAt || new Date(),
    image: userData.image || null,
    role,
    slug: userData.slug || userData.id || 'user'
  };

  switch (role) {
    case 'student':
      return {
        ...baseUser,
        role: 'student',
        teacherId: userData.teacherId || '',
        isActive: userData.isActive || false,
        classId: userData.classId,
        grade: userData.grade
      } as StudentUser;
      
    case 'teacher':
      return {
        ...baseUser,
        role: 'teacher',
        isIndependent: userData.isIndependent ?? true,
        schoolId: userData.schoolId,
        department: userData.department,
        subjects: userData.subjects,
        isVerified: userData.isVerified || false
      } as TeacherUser;
      
    case 'school_admin':
      return {
        ...baseUser,
        role: 'school_admin',
        schoolName: userData.schoolName,
        schoolAddress: userData.schoolAddress,
        schoolPlaceId: userData.schoolPlaceId,
        schoolType: userData.schoolType,
        schoolDistrict: userData.schoolDistrict,
        studentCount: userData.studentCount,
        teacherCount: userData.teacherCount
      } as SchoolAdminUser;
      
    default:
      throw new Error(`Invalid role: ${role}`);
  }
}