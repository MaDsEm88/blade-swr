// hooks/useAuthGuard.tsx
import { useParams, useRedirect } from 'blade/hooks';
import { useAuth } from './useAuth';

interface UseAuthGuardOptions {
  requiredRole?: string;
  redirectTo?: string;
}

/**
 * Authentication guard hook that instantly redirects users if they shouldn't have access.
 * Follows Blade's server-first philosophy - no loading states, instant redirects.
 */
export const useAuthGuard = (options: UseAuthGuardOptions = {}) => {
  const { requiredRole, redirectTo = '/login' } = options;
  const { slug } = useParams();
  const { user, signOut, isAuthenticated } = useAuth();
  const redirect = useRedirect();

  // Instant authentication checks - no loading states
  if (!isAuthenticated || !user) {
    console.log('User not authenticated, redirecting instantly...');
    redirect(redirectTo);
    return { user: null, isAuthenticated: false, shouldRedirect: true };
  }

  // Instant slug validation for profile pages
  if (slug && user.slug !== slug) {
    console.log('User slug mismatch, signing out and redirecting instantly...', {
      userSlug: user.slug,
      urlSlug: slug
    });
    signOut();
    redirect(redirectTo);
    return { user: null, isAuthenticated: false, shouldRedirect: true };
  }

  // Instant role validation
  if (requiredRole && user.role !== requiredRole) {
    console.log('User does not have required role, redirecting instantly...', {
      userRole: user.role,
      requiredRole
    });
    redirect(redirectTo);
    return { user: null, isAuthenticated: false, shouldRedirect: true };
  }

  // User is valid - return immediately
  return {
    user,
    isAuthenticated: true,
    shouldRedirect: false
  };
};

/**
 * Hook specifically for teacher pages that checks for teacher role and slug match
 */
export const useTeacherAuthGuard = () => {
  return useAuthGuard({ requiredRole: 'teacher' });
};

/**
 * Hook specifically for student pages that checks for student role and slug match
 */
export const useStudentAuthGuard = () => {
  return useAuthGuard({ requiredRole: 'student' });
};

/**
 * Hook specifically for school admin pages that checks for school_admin role and slug match
 */
export const useSchoolAdminAuthGuard = () => {
  return useAuthGuard({ requiredRole: 'school_admin' });
};

export default useAuthGuard;
