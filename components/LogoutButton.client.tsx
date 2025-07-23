// components/LogoutButton.client.tsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRedirect } from 'blade/hooks';
import { Link } from 'blade/client/components';

const LogoutButton = () => {
  const { signOut, user } = useAuth();
  const redirect = useRedirect();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleLogout = async () => {
    try {
      // Determine the user's role for redirect
      const userRole = user?.role;
      const loginUrl = userRole ? `/login?role=${userRole}` : '/login';

      console.log('Generic logout - User role:', userRole, '-> URL:', loginUrl);

      // Set signing out state to trigger prefetching
      setIsSigningOut(true);

      await signOut();

      // Small delay to let prefetching work, then redirect to role-specific login
      setTimeout(() => {
        redirect(loginUrl);
      }, 100);
    } catch (error) {
      console.error('Logout failed:', error);
      // Force redirect even if logout fails, but with prefetching
      const userRole = user?.role;
      const loginUrl = userRole ? `/login?role=${userRole}` : '/login';
      setTimeout(() => {
        redirect(loginUrl);
      }, 100);
    }
  };

  // Prefetch role-specific login page when signing out
  const userRole = user?.role;
  const loginUrl = userRole ? `/login?role=${userRole}` : '/login';

  const PrefetchLoginLink = isSigningOut ? (
    <Link href={loginUrl} prefetch={true} className="hidden">
      <a>Prefetch login</a>
    </Link>
  ) : null;

  return (
    <>
      {PrefetchLoginLink}
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm transition-colors"
      >
        Logout
      </button>
    </>
  );
};

export default LogoutButton;