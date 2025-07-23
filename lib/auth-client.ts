// lib/auth-client.ts - Simplified Better Auth client
import { createAuthClient } from "better-auth/react";

// Create a simplified auth client with only email/password authentication
export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : "http://localhost:3000",
  basePath: "/api/auth",
  fetchOptions: {
    credentials: "include"
  }
});

// Export basic auth methods
export const {
  signIn,
  signUp,
  signOut: betterAuthSignOut,
  getSession,
  useSession
} = authClient;

// Simplified session hook
export const useSimpleSession = () => {
  const { data: session, isPending: loading, refetch } = useSession();

  const signOut = async () => {
    try {
      await betterAuthSignOut();
      await refetch();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return {
    session,
    loading,
    signOut,
    refreshSession: refetch,
    isAuthenticated: !!session?.user,
    user: session?.user || null,
  };
};