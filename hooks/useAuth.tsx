// hooks/useAuth.tsx
'use client';

import { useSimpleSession } from '../lib/auth-client';
import { useLocation } from 'blade/hooks';

export const useAuth = () => {
  const { session, loading, signOut, isAuthenticated, user } = useSimpleSession();
  const location = useLocation();

  // Type assertion to access additional fields that we know exist from our auth config
  const extendedUser = user as any;

  return {
    user: extendedUser,
    session,
    loading,
    signOut,
    isAuthenticated,
    role: extendedUser?.role || 'teacher', // Default to teacher role

    // Helper methods
    canAccessRoute: (requiredRole?: string) => {
      if (!extendedUser) return false;
      if (!requiredRole) return true;
      return extendedUser.role === requiredRole;
    },

    // Route helpers
    isOnCorrectRoute: () => {
      if (!extendedUser?.role || !extendedUser?.slug) return false;
      return location.pathname.startsWith(`/teacher/${extendedUser.slug}`);
    },

    getCorrectDashboardUrl: () => {
      const slug = extendedUser?.slug || extendedUser?.email?.split('@')[0] || extendedUser?.id;
      if (!slug) return '/';
      return `/teacher/${slug}`;
    },
  };
};

export default useAuth;