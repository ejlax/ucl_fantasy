import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

/**
 * Hook to check if the current user is an admin
 * Returns true if user exists in the admins table
 */
export function useIsAdmin() {
  const { user, loading: authLoading } = useAuth();

  const result = useQuery({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!user?.id) {
        console.log('🔒 useIsAdmin: No user ID in queryFn');
        return false;
      }

      console.log('🔍 useIsAdmin: Checking if user is admin:', user.id);

      const { data, error } = await supabase
        .from('admins')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.log('⚠️ useIsAdmin error:', error);
        // PGRST116 = not found (user is not an admin)
        if (error.code === 'PGRST116') {
          console.log('❌ useIsAdmin: User is NOT an admin (not found in table)');
          return false;
        }
        // For any other error, log it but return false instead of throwing
        console.error('❌ useIsAdmin: Query failed with error:', error);
        return false;
      }

      const isAdmin = !!data;
      console.log('✅ useIsAdmin: User IS an admin!', data, 'returning:', isAdmin);
      return isAdmin;
    },
    enabled: !authLoading && !!user?.id, // Only run when auth is loaded and user exists
    retry: false, // Don't retry on error
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  console.log('🎯 useIsAdmin returning:', {
    userId: user?.id,
    authLoading,
    data: result.data,
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    status: result.status
  });

  return result;
}

