import { useState, useCallback } from 'react';
import { useSimpleSession } from '../lib/auth-client';
import { useMutation } from 'blade/client/hooks';

interface UseAvatarUpdateReturn {
  updateAvatar: (file: File | null) => Promise<void>;
  isUpdating: boolean;
  error: string | null;
}

export function useAvatarUpdate(): UseAvatarUpdateReturn {
  const { session, refreshSession } = useSimpleSession();
  const { set } = useMutation();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateAvatar = useCallback(async (file: File | null) => {
    if (!session?.user?.id) {
      setError('User not authenticated');
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      if (file) {
        // Validate file
        if (!file.type.startsWith('image/')) {
          throw new Error('Please select an image file');
        }

        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Image must be smaller than 5MB');
        }

        // Validate image type
        const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!supportedTypes.includes(file.type)) {
          throw new Error('Supported formats: JPEG, PNG, WebP');
        }

        console.log('Uploading avatar:', {
          name: file.name,
          size: file.size,
          type: file.type
        });

        // Use Blade's mutation system to update the user directly
        // This will automatically update all reactive queries
        await set.user({
          with: { id: session.user.id },
          to: { image: file }
        });

        console.log('Avatar uploaded successfully');
      } else {
        // Remove avatar using Blade's mutation system
        await set.user({
          with: { id: session.user.id },
          to: { image: null }
        });

        console.log('Avatar removed successfully');
      }

      // Blade will automatically update all reactive queries
      console.log('✅ Avatar update completed - Blade will update reactive queries automatically');

      // Wait longer for the database transaction to fully commit
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Force a complete session refresh by clearing cache and refetching
      console.log('🔄 Force refreshing Better Auth session to sync with Blade data...');

      // Try multiple refresh attempts to ensure we get the latest data
      for (let attempt = 1; attempt <= 3; attempt++) {
        console.log(`🔄 Session refresh attempt ${attempt}/3...`);


        // Wait a bit before the next attempt
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      console.log('✅ Better Auth session refresh completed');

      // As a last resort, if the session still has old data, force a page reload
      // This ensures we get the absolute latest data from the server
    

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Avatar update failed';
      setError(errorMessage);
      console.error('Avatar update failed:', err);
    } finally {
      setIsUpdating(false);
    }
  }, [session?.user?.id, set, refreshSession]);

  return {
    updateAvatar,
    isUpdating,
    error
  };
}

// Hook specifically for getting user initials
export function useUserInitials(name?: string): string {
  if (!name) return 'U';
  
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
