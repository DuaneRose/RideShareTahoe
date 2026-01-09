import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/libs/supabase/client';

/**
 * Hook to check if the current user is blocked by or has blocked another user.
 * Returns true if there's a two-way mirror block between them.
 *
 * @param otherUserId - The ID of the user to check blocking status with
 * @returns Object with isBlocked status, loading state, and refetch function
 */
export function useIsBlocked(otherUserId?: string) {
  const [isBlocked, setIsBlocked] = useState(false);
  const [loading, setLoading] = useState(true);

  // Memoize the Supabase client to prevent re-creation on every render
  const supabase = useMemo(() => createClient(), []);

  const checkBlockStatus = useCallback(async () => {
    if (!otherUserId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Use DB-side RPC to ensure the auth.uid() context is respected
      const { data, error } = await supabase.rpc('is_user_blocked', {
        other_user_id: otherUserId,
      });

      if (error) {
        console.error('Error calling is_user_blocked RPC:', error);
        setIsBlocked(false);
      } else if (typeof data === 'boolean') {
        setIsBlocked(Boolean(data));
      } else if (Array.isArray(data) && data.length > 0) {
        // Some Supabase responses return arrays for scalar RPCs in certain setups
        setIsBlocked(Boolean(data[0]));
      } else {
        setIsBlocked(Boolean(data));
      }
    } catch (err) {
      console.error('Error checking block status:', err);
      setIsBlocked(false);
    } finally {
      setLoading(false);
    }
  }, [otherUserId, supabase]);

  useEffect(() => {
    checkBlockStatus();
  }, [checkBlockStatus]);

  return { isBlocked, loading, refetch: checkBlockStatus };
}
