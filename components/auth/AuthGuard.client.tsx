// components/auth/AuthGuard.client.tsx
'use client';

import React from 'react';
import { useAuthGuard } from '../../hooks/useAuthGuard';

/**
 * AuthGuard components following Blade's server-first philosophy:
 * - No loading states or spinners
 * - Instant redirects for unauthorized access
 * - Server-first data means authentication is resolved instantly
 * - Follows Blade's principle: "loading animations of any form are avoided"
 *
 * Usage:
 * ```tsx
 * const TeacherPage = () => (
 *   <TeacherAuthGuard>
 *     <div>Protected teacher content - shows instantly!</div>
 *   </TeacherAuthGuard>
 * );
 * ```
 */

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
  redirectTo?: string;
  fallbackComponent?: React.ReactNode; // Only for edge cases where redirect fails
}

/**
 * AuthGuard component that wraps protected content following Blade's server-first philosophy.
 * No loading states - instant redirects for unauthorized access.
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requiredRole,
  redirectTo = '/',
  fallbackComponent
}) => {
  const { user, shouldRedirect } = useAuthGuard({
    requiredRole,
    redirectTo
  });

  // If should redirect, the redirect has already happened instantly
  // Don't render anything while redirecting (Blade handles this instantly)
  if (shouldRedirect) {
    return null; // Blade will handle the redirect instantly, no loading state needed
  }

  // If no user after auth check, show fallback (shouldn't happen with instant redirects)
  if (!user) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }
    return null; // Blade should have redirected instantly
  }

  // User is authenticated and authorized - show protected content instantly
  return <>{children}</>;
};

/**
 * Specific AuthGuard for teacher pages
 */
export const TeacherAuthGuard: React.FC<Omit<AuthGuardProps, 'requiredRole'>> = (props) => {
  return <AuthGuard {...props} requiredRole="teacher" />;
};

/**
 * Specific AuthGuard for student pages
 */
export const StudentAuthGuard: React.FC<Omit<AuthGuardProps, 'requiredRole'>> = (props) => {
  return <AuthGuard {...props} requiredRole="student" />;
};

/**
 * Specific AuthGuard for school admin pages
 */
export const SchoolAdminAuthGuard: React.FC<Omit<AuthGuardProps, 'requiredRole'>> = (props) => {
  return <AuthGuard {...props} requiredRole="school_admin" />;
};

export default AuthGuard;
