import { supabase } from '@/lib/supabase';
import type {
  League,
  LeagueWithOwner,
  LeagueWithMembers,
  LeagueMember,
  User,
} from '@/types/database';
import { generateInviteCode } from '@/utils/validation';

export const leagueService = {
  /**
   * Create a new league
   */
  async createLeague(
    name: string,
    description: string | null,
    ownerId: string,
    settings?: Record<string, any>
  ): Promise<League> {
    const inviteCode = generateInviteCode();

    const { data, error } = await supabase
      .from('leagues')
      .insert({
        name,
        description,
        invite_code: inviteCode,
        owner_id: ownerId,
        settings: settings || {},
      })
      .select()
      .single();

    if (error) throw error;

    // Automatically add owner as a member
    await this.joinLeague(data.id, ownerId);

    return data;
  },

  /**
   * Get league by ID
   */
  async getLeagueById(leagueId: string): Promise<League | null> {
    const { data, error } = await supabase.from('leagues').select('*').eq('id', leagueId).single();

    if (error) throw error;
    return data;
  },

  /**
   * Get league by invite code
   */
  async getLeagueByInviteCode(inviteCode: string): Promise<League | null> {
    const { data, error } = await supabase
      .from('leagues')
      .select('*')
      .eq('invite_code', inviteCode)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  },

  /**
   * Get leagues for a user
   */
  async getUserLeagues(userId: string): Promise<LeagueWithOwner[]> {
    const { data, error } = await supabase
      .from('league_members')
      .select(
        `
        league_id,
        leagues:league_id (
          *,
          owner:owner_id (*)
        )
      `
      )
      .eq('user_id', userId);

    if (error) throw error;

    // Transform the data to match LeagueWithOwner type
    return (data || []).map((item: any) => item.leagues).filter(Boolean);
  },

  /**
   * Get league with members
   */
  async getLeagueWithMembers(leagueId: string): Promise<LeagueWithMembers | null> {
    const { data: league, error: leagueError } = await supabase
      .from('leagues')
      .select('*')
      .eq('id', leagueId)
      .single();

    if (leagueError) throw leagueError;

    const { data: members, error: membersError } = await supabase
      .from('league_members')
      .select(
        `
        *,
        user:user_id (*)
      `
      )
      .eq('league_id', leagueId);

    if (membersError) throw membersError;

    return {
      ...league,
      members: members || [],
      member_count: members?.length || 0,
    };
  },

  /**
   * Join a league
   */
  async joinLeague(leagueId: string, userId: string): Promise<LeagueMember> {
    const { data, error } = await supabase
      .from('league_members')
      .insert({
        league_id: leagueId,
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Join league by invite code
   */
  async joinLeagueByInviteCode(inviteCode: string, userId: string): Promise<LeagueMember> {
    const league = await this.getLeagueByInviteCode(inviteCode);
    if (!league) {
      throw new Error('League not found with this invite code');
    }

    return this.joinLeague(league.id, userId);
  },

  /**
   * Leave a league
   */
  async leaveLeague(leagueId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('league_members')
      .delete()
      .eq('league_id', leagueId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  /**
   * Update league settings
   */
  async updateLeague(
    leagueId: string,
    updates: {
      name?: string;
      description?: string | null;
      settings?: Record<string, any>;
    }
  ): Promise<League> {
    const { data, error } = await supabase
      .from('leagues')
      .update(updates)
      .eq('id', leagueId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a league (owner only)
   */
  async deleteLeague(leagueId: string): Promise<void> {
    const { error } = await supabase.from('leagues').delete().eq('id', leagueId);

    if (error) throw error;
  },
};
