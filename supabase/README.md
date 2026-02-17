# Supabase Database Setup

## Running Migrations

To set up the database schema, run the migration SQL in your Supabase project:

1. Go to your Supabase project dashboard: https://dwlgowyzdjconfoulkna.supabase.co
2. Navigate to the SQL Editor
3. Copy and paste the contents of `migrations/001_initial_schema.sql`
4. Click "Run" to execute the migration

## Database Schema

### Tables

#### `users`
- Extends `auth.users` with additional profile information
- Fields: `id`, `email`, `display_name`, `avatar_url`, `created_at`, `updated_at`

#### `leagues`
- Stores fantasy league information
- Fields: `id`, `name`, `description`, `invite_code`, `owner_id`, `settings`, `created_at`, `updated_at`
- Settings JSON can include: points system, tie-breaker rules, etc.

#### `league_members`
- Junction table for users in leagues
- Fields: `id`, `league_id`, `user_id`, `joined_at`

#### `matches`
- Stores UCL knockout stage matches
- Fields: `id`, `round`, `home_team`, `away_team`, `home_score`, `away_score`, `match_date`, `is_completed`, `created_at`, `updated_at`
- Rounds: 'R16', 'QF', 'SF', 'FINAL'

#### `predictions`
- Stores user predictions for matches
- Fields: `id`, `league_id`, `user_id`, `match_id`, `predicted_home_score`, `predicted_away_score`, `points_earned`, `created_at`, `updated_at`

## Row Level Security (RLS)

All tables have RLS enabled with the following policies:

- **Users**: Can view all profiles, update own profile
- **Leagues**: Anyone can view, authenticated users can create, owners can update/delete
- **League Members**: Anyone can view, users can join/leave
- **Matches**: Read-only for all users (admin-managed)
- **Predictions**: League members can view/create, users can update own predictions before match starts

## Authentication

The app uses Supabase Auth with email/password authentication. User profiles are automatically created in the `users` table upon signup.

## Next Steps

After running the migration:

1. Enable email authentication in Supabase Auth settings
2. Configure email templates (optional)
3. Add initial match data for the current UCL season
4. Test authentication flow in the app

