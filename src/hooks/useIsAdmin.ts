import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

/**
 * Hook to check if the current user is an admin
 * Returns true if user exists in the admins table
 */
export function useIsAdmin() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['isAdmin', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('🔒 useIsAdmin: No user ID');
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
          console.log('❌ useIsAdmin: User is NOT an admin');
          return false;
        }
        throw error;
      }

      console.log('✅ useIsAdmin: User IS an admin!', data);
      return !!data;
    },
    enabled: !!user?.id,
  });
}

