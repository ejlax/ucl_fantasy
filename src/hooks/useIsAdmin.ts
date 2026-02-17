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
      if (!user?.id) return false;
      
      const { data, error } = await supabase
        .from('admins')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        // PGRST116 = not found (user is not an admin)
        if (error.code === 'PGRST116') return false;
        throw error;
      }
      
      return !!data;
    },
    enabled: !!user?.id,
  });
}

