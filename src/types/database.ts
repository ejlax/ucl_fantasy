export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      leagues: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          invite_code: string;
          owner_id: string;
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          invite_code: string;
          owner_id: string;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          invite_code?: string;
          owner_id?: string;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      league_members: {
        Row: {
          id: string;
          league_id: string;
          user_id: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          league_id: string;
          user_id: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          league_id?: string;
          user_id?: string;
          joined_at?: string;
        };
      };
      matches: {
        Row: {
          id: string;
          round: string;
          home_team: string;
          away_team: string;
          home_score: number | null;
          away_score: number | null;
          match_date: string;
          is_completed: boolean;
          leg: number;
          tie_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          round: string;
          home_team: string;
          away_team: string;
          home_score?: number | null;
          away_score?: number | null;
          match_date: string;
          is_completed?: boolean;
          leg?: number;
          tie_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          round?: string;
          home_team?: string;
          away_team?: string;
          home_score?: number | null;
          away_score?: number | null;
          match_date?: string;
          is_completed?: boolean;
          leg?: number;
          tie_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      predictions: {
        Row: {
          id: string;
          league_id: string;
          user_id: string;
          match_id: string;
          predicted_home_score: number;
          predicted_away_score: number;
          points_earned: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          league_id: string;
          user_id: string;
          match_id: string;
          predicted_home_score: number;
          predicted_away_score: number;
          points_earned?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          league_id?: string;
          user_id?: string;
          match_id?: string;
          predicted_home_score?: number;
          predicted_away_score?: number;
          points_earned?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Helper type aliases for easier use
export type User = Database['public']['Tables']['users']['Row'];
export type League = Database['public']['Tables']['leagues']['Row'];
export type LeagueMember = Database['public']['Tables']['league_members']['Row'];
export type Match = Database['public']['Tables']['matches']['Row'];
export type Prediction = Database['public']['Tables']['predictions']['Row'];

// League settings type
export interface LeagueSettings {
  points_exact_score?: number;
  points_correct_result?: number;
  tie_breaker_rules?: string[];
  // Bonus points settings
  enable_tie_winner_bonus?: boolean; // Award bonus for correctly predicting tie winners
  enable_round_winner_bonus?: boolean; // Award bonus for getting all round winners correct
  tie_winner_bonus_points?: number; // Custom bonus points for tie winners (default: 2)
  round_winner_bonus_points?: {
    // Custom bonus points per round
    r16?: number;
    qf?: number;
    sf?: number;
  };
}

// Extended types with relations
export interface LeagueWithOwner extends League {
  owner: User;
}

export interface LeagueWithMembers extends League {
  members: (LeagueMember & { user: User })[];
  member_count: number;
}

export interface PredictionWithMatch extends Prediction {
  match: Match;
}

export interface PredictionWithUser extends Prediction {
  user: User;
}

export interface StandingsEntry {
  user_id: string;
  user: User;
  total_points: number;
  correct_predictions: number;
  exact_score_predictions: number;
  rank: number;
}
