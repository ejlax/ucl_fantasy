# UCL Fantasy - Setup Guide

## Prerequisites

- Node.js 20+ LTS
- npm or pnpm
- Supabase account

## Installation

1. **Clone the repository** (if applicable)
   ```bash
   cd ucl_fantasy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env
   ```
   
   The `.env` file should contain:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase database**
   
   a. Go to your Supabase project dashboard
   b. Navigate to the SQL Editor
   c. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
   d. Click "Run" to execute the migration
   
   This will create:
   - `users` table (user profiles)
   - `leagues` table (fantasy leagues)
   - `league_members` table (league membership)
   - `matches` table (UCL matches)
   - `predictions` table (user predictions)
   - Row Level Security (RLS) policies
   - Indexes for performance

5. **Enable email authentication in Supabase**
   
   a. Go to Authentication → Providers
   b. Enable "Email" provider
   c. Configure email templates (optional)

6. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173/` (or 5174 if 5173 is in use)

## Project Structure

```
ucl_fantasy/
├── src/
│   ├── components/       # Reusable UI components
│   ├── hooks/           # Custom React hooks
│   │   └── useAuth.ts   # Authentication hook
│   ├── lib/             # Library configurations
│   │   └── supabase.ts  # Supabase client
│   ├── pages/           # Page components
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   └── SignupPage.tsx
│   ├── services/        # API services
│   │   └── authService.ts
│   ├── styles/          # Global styles
│   │   └── globals.css
│   ├── types/           # TypeScript types
│   │   └── database.ts  # Supabase database types
│   ├── App.tsx          # Root component
│   ├── main.tsx         # Entry point
│   └── router.tsx       # Route configuration
├── supabase/
│   ├── migrations/      # Database migrations
│   └── README.md        # Database documentation
├── .env                 # Environment variables (not in git)
├── .env.example         # Environment variables template
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm test` - Run tests

## Technology Stack

- **React 19** - UI library
- **TypeScript 5.7+** - Type safety
- **Vite 6+** - Build tool
- **Tailwind CSS 4** - Styling
- **React Router 7+** - Routing
- **React Query** - Server state management
- **Supabase** - Backend (PostgreSQL 16+, Auth, Realtime)
- **Lucide React** - Icons

## Authentication Flow

1. User signs up with email/password
2. Supabase creates auth user
3. App creates user profile in `users` table
4. User can sign in with credentials
5. Session is persisted in localStorage
6. Auth state is managed via `useAuth` hook

## Next Steps

After setup:

1. Test authentication (signup/login)
2. Add initial match data for current UCL season
3. Implement league creation and management
4. Build tournament bracket visualization
5. Add prediction system
6. Implement scoring and standings

## Troubleshooting

### Port already in use
If port 5173 is in use, Vite will automatically try 5174, 5175, etc.

### Supabase connection errors
- Verify `.env` file has correct credentials
- Check Supabase project is active
- Ensure RLS policies are set up correctly

### Build errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

## Support

For issues or questions, refer to:
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)

