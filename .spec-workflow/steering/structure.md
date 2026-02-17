# Project Structure

## Directory Organization

```
ucl_fantasy/
├── src/                           # Source code
│   ├── components/               # React components
│   │   ├── bracket/             # Tournament bracket components
│   │   ├── league/              # League management components
│   │   ├── predictions/         # Prediction entry components
│   │   ├── standings/           # Leaderboard and standings
│   │   ├── common/              # Shared/reusable UI components
│   │   └── layout/              # Layout components (header, nav, footer)
│   │
│   ├── pages/                    # Page-level components (routes)
│   │   ├── HomePage.tsx
│   │   ├── LeaguePage.tsx
│   │   ├── BracketPage.tsx
│   │   ├── StandingsPage.tsx
│   │   ├── PredictionsPage.tsx
│   │   └── ProfilePage.tsx
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts           # Authentication hook
│   │   ├── useLeague.ts         # League data hook
│   │   ├── useBracket.ts        # Bracket data hook
│   │   ├── usePredictions.ts    # Predictions hook
│   │   └── useRealtime.ts       # Supabase realtime subscriptions
│   │
│   ├── services/                 # Business logic and API services
│   │   ├── supabase.ts          # Supabase client configuration
│   │   ├── authService.ts       # Authentication service
│   │   ├── leagueService.ts     # League CRUD operations
│   │   ├── bracketService.ts    # Bracket and match operations
│   │   ├── predictionService.ts # Prediction operations
│   │   ├── scoringService.ts    # Points calculation logic
│   │   └── notificationService.ts # Push notification service
│   │
│   ├── types/                    # TypeScript type definitions
│   │   ├── database.ts          # Supabase database types (auto-generated)
│   │   ├── league.ts            # League-related types
│   │   ├── bracket.ts           # Bracket and match types
│   │   ├── prediction.ts        # Prediction types
│   │   ├── user.ts              # User types
│   │   └── scoring.ts           # Scoring and tie-breaker types
│   │
│   ├── utils/                    # Utility functions
│   │   ├── dateUtils.ts         # Date/time helpers (ALWAYS use for datetime)
│   │   ├── scoringUtils.ts      # Scoring calculation helpers
│   │   ├── validationUtils.ts   # Input validation helpers
│   │   ├── formatUtils.ts       # Formatting helpers (dates, numbers, etc.)
│   │   └── constants.ts         # App-wide constants
│   │
│   ├── styles/                   # Global styles and Tailwind config
│   │   ├── globals.css          # Global CSS and Tailwind imports
│   │   └── theme.ts             # Theme configuration (colors, spacing)
│   │
│   ├── assets/                   # Static assets
│   │   ├── images/              # Images (logos, icons)
│   │   └── fonts/               # Custom fonts (if any)
│   │
│   ├── App.tsx                   # Root App component
│   ├── main.tsx                  # Application entry point
│   └── router.tsx                # React Router configuration
│
├── supabase/                     # Supabase configuration
│   ├── migrations/              # Database migrations
│   ├── functions/               # Edge functions (if needed)
│   └── seed.sql                 # Seed data for development
│
├── public/                       # Public static files
│   ├── manifest.json            # PWA manifest
│   ├── service-worker.js        # Service worker for PWA
│   └── favicon.ico              # Favicon
│
├── tests/                        # Test files
│   ├── unit/                    # Unit tests
│   ├── integration/             # Integration tests
│   └── e2e/                     # End-to-end tests
│
├── .spec-workflow/              # Spec workflow documents
│   ├── steering/                # Steering documents
│   └── specs/                   # Feature specifications
│
├── tailwind.config.js           # Tailwind CSS configuration
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies and scripts
├── pnpm-lock.yaml               # pnpm lock file
└── README.md                    # Project documentation
```

**Organization Strategy**: Feature-based grouping within technical layers. Components are grouped by feature domain (bracket, league, predictions) while maintaining clear separation between UI (components), logic (services), and data (types).

## Naming Conventions

### Files
- **Components**: `PascalCase.tsx` (e.g., `BracketView.tsx`, `LeagueCard.tsx`)
- **Pages**: `PascalCase.tsx` with "Page" suffix (e.g., `HomePage.tsx`, `LeaguePage.tsx`)
- **Services**: `camelCase.ts` with "Service" suffix (e.g., `leagueService.ts`, `authService.ts`)
- **Hooks**: `camelCase.ts` with "use" prefix (e.g., `useAuth.ts`, `useBracket.ts`)
- **Utilities**: `camelCase.ts` with "Utils" suffix (e.g., `dateUtils.ts`, `scoringUtils.ts`)
- **Types**: `camelCase.ts` (e.g., `league.ts`, `bracket.ts`)
- **Tests**: `[filename].test.ts` or `[filename].test.tsx` (e.g., `LeagueCard.test.tsx`)

### Code
- **React Components**: `PascalCase` (e.g., `BracketView`, `LeagueCard`)
- **Interfaces/Types**: `PascalCase` (e.g., `League`, `Prediction`, `MatchResult`)
- **Functions/Methods**: `camelCase` (e.g., `calculatePoints`, `validatePrediction`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_LEAGUES_PER_USER`, `POINTS_PER_ROUND`)
- **Variables**: `camelCase` (e.g., `leagueId`, `currentUser`, `matchResults`)
- **Enums**: `PascalCase` for enum name, `UPPER_SNAKE_CASE` for values (e.g., `enum MatchStatus { NOT_STARTED, IN_PROGRESS, COMPLETED }`)

## Import Patterns

### Import Order
1. **External dependencies** (React, third-party libraries)
2. **Internal modules** (services, hooks, utils)
3. **Types** (TypeScript interfaces and types)
4. **Relative imports** (components in same directory)
5. **Style imports** (CSS modules, Tailwind)

### Example Import Structure
```typescript
// 1. External dependencies
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Users } from 'lucide-react';

// 2. Internal modules
import { leagueService } from '@/services/leagueService';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/utils/dateUtils';

// 3. Types
import type { League, LeagueSettings } from '@/types/league';

// 4. Relative imports
import { LeagueCard } from './LeagueCard';
import { CreateLeagueModal } from './CreateLeagueModal';
```

### Module/Package Organization
- **Absolute imports** using `@/` alias for src directory (configured in tsconfig.json and vite.config.ts)
- **Path aliases**:
  - `@/components` → `src/components`
  - `@/services` → `src/services`
  - `@/hooks` → `src/hooks`
  - `@/utils` → `src/utils`
  - `@/types` → `src/types`
- **Barrel exports** (index.ts) for component directories to simplify imports

## Code Structure Patterns

### React Component Organization
```typescript
// 1. Imports (external, internal, types, relative)
import { useState } from 'react';
import { useLeague } from '@/hooks/useLeague';
import type { League } from '@/types/league';

// 2. Type definitions (props, local types)
interface LeagueCardProps {
  league: League;
  onSelect: (id: string) => void;
}

// 3. Component definition
export function LeagueCard({ league, onSelect }: LeagueCardProps) {
  // 3a. Hooks (state, effects, custom hooks)
  const [isExpanded, setIsExpanded] = useState(false);

  // 3b. Event handlers
  const handleClick = () => {
    onSelect(league.id);
  };

  // 3c. Render helpers (if complex)
  const renderParticipants = () => {
    // ...
  };

  // 3d. JSX return
  return (
    <div>
      {/* Component markup */}
    </div>
  );
}

// 4. Helper functions (outside component, if reusable)
function calculateProgress(league: League): number {
  // ...
}
```

### Service Module Organization
```typescript
// 1. Imports
import { supabase } from './supabase';
import type { League, CreateLeagueInput } from '@/types/league';

// 2. Constants (if any)
const LEAGUES_TABLE = 'leagues';

// 3. Main service functions (exported)
export async function createLeague(input: CreateLeagueInput): Promise<League> {
  // Input validation
  validateLeagueInput(input);

  // Core logic
  const { data, error } = await supabase
    .from(LEAGUES_TABLE)
    .insert(input)
    .select()
    .single();

  // Error handling
  if (error) throw new Error(`Failed to create league: ${error.message}`);

  return data;
}

// 4. Helper functions (private, not exported)
function validateLeagueInput(input: CreateLeagueInput): void {
  // Validation logic
}
```

### Utility Module Organization
```typescript
// 1. Imports
import { format, parseISO, isAfter } from 'date-fns';

// 2. Constants
const DEFAULT_DATE_FORMAT = 'MMM dd, yyyy';
const DEFAULT_TIME_FORMAT = 'HH:mm';

// 3. Exported utility functions
export function formatMatchDate(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, DEFAULT_DATE_FORMAT);
}

export function isMatchLocked(lockTime: string): boolean {
  return isAfter(new Date(), parseISO(lockTime));
}

// 4. Helper functions (if needed)
```

## Code Organization Principles

1. **Single Responsibility**: Each file should have one clear purpose
   - Components handle UI rendering only
   - Services handle business logic and API calls
   - Hooks encapsulate reusable stateful logic
   - Utils provide pure, stateless helper functions

2. **Modularity**: Code should be organized into reusable modules
   - Small, focused components that do one thing well
   - Services are independent and can be tested in isolation
   - Utilities are pure functions without side effects

3. **Testability**: Structure code to be easily testable
   - Separate business logic from UI components
   - Use dependency injection for services
   - Pure functions in utilities for easy unit testing

4. **Consistency**: Follow patterns established in the codebase
   - Use existing hooks patterns for new hooks
   - Follow service patterns for new API integrations
   - Maintain consistent component structure

## Module Boundaries

### Dependency Direction
```
Pages → Components → Hooks → Services → Utils
  ↓         ↓          ↓         ↓
Types ← Types ← Types ← Types ← Types
```

**Rules**:
- **Pages** can import: Components, Hooks, Services, Types
- **Components** can import: Hooks, Utils, Types (NOT Services directly - use hooks)
- **Hooks** can import: Services, Utils, Types
- **Services** can import: Utils, Types (NOT Hooks or Components)
- **Utils** can import: Types only (pure functions, no dependencies)
- **Types** have no dependencies (pure type definitions)

### Feature Boundaries
- **Bracket Module**: Handles tournament bracket visualization and match tracking
- **League Module**: Manages league creation, settings, and membership
- **Predictions Module**: Handles prediction entry, locking, and validation
- **Standings Module**: Calculates and displays leaderboards and rankings
- **Auth Module**: User authentication and authorization

**Cross-Feature Communication**: Use services as the integration layer. Features communicate through shared services, not direct imports.

## Code Size Guidelines

- **File Size**: Maximum 300 lines per file (prefer 150-200)
  - If a component exceeds 300 lines, split into sub-components
  - If a service exceeds 300 lines, split into multiple focused services

- **Function/Method Size**: Maximum 50 lines per function (prefer 20-30)
  - Extract complex logic into helper functions
  - Use early returns to reduce nesting

- **Component Complexity**: Maximum 10 props per component
  - If more props needed, consider using a configuration object
  - Or split into multiple smaller components

- **Nesting Depth**: Maximum 3 levels of nesting
  - Use early returns to flatten logic
  - Extract nested logic into separate functions

## Special Patterns

### Date/Time Handling
**CRITICAL**: Always use helper methods from `dateUtils.ts` for any date/time operations. Never use raw Date objects or date libraries directly in components or services.

```typescript
// ✅ CORRECT
import { formatMatchDate, isMatchLocked } from '@/utils/dateUtils';

const displayDate = formatMatchDate(match.kickoffTime);
const canPredict = !isMatchLocked(match.lockTime);

// ❌ WRONG
const displayDate = new Date(match.kickoffTime).toLocaleDateString();
```

### Icon Usage
Use icons from `lucide-react` exclusively. All icons should have a responsive version (icon + circle) to maximize screen real estate on mobile.

```typescript
import { Trophy, Users, Calendar } from 'lucide-react';

// Responsive icon pattern
<div className="md:hidden">
  <Trophy className="w-6 h-6" />
</div>
<div className="hidden md:flex items-center gap-2">
  <Trophy className="w-5 h-5" />
  <span>League Champion</span>
</div>
```

### Image Handling
Use stock photos from Unsplash where appropriate. Only use valid URLs known to exist. Do not download images - link to them directly in image tags.

```typescript
// ✅ CORRECT
<img src="https://images.unsplash.com/photo-[valid-id]" alt="..." />

// ❌ WRONG - Don't download or store images locally
```

### Push Notifications
All push notifications should be built using Progressier and Supabase integration.

## Documentation Standards

- **Component Documentation**: JSDoc comments for complex components explaining props and behavior
- **Service Documentation**: JSDoc for all exported service functions with param and return types
- **Utility Documentation**: JSDoc for utility functions explaining purpose and edge cases
- **Type Documentation**: Comments for complex types explaining business logic
- **README Files**: Each major feature directory should have a README explaining its purpose

### Example Documentation
```typescript
/**
 * Calculates points earned for a prediction based on match result
 *
 * @param prediction - User's prediction for the match
 * @param result - Actual match result
 * @param roundMultiplier - Point multiplier for the tournament round
 * @returns Points earned (0 if prediction incorrect)
 *
 * @example
 * calculatePoints(
 *   { homeScore: 2, awayScore: 1 },
 *   { homeScore: 2, awayScore: 1 },
 *   2 // Quarter-final multiplier
 * ) // Returns: 10 (base 5 points × 2 multiplier)
 */
export function calculatePoints(
  prediction: Prediction,
  result: MatchResult,
  roundMultiplier: number
): number {
  // Implementation
}
```

## Build and Development

### Environment Files
```
.env.local              # Local development (not committed)
.env.development        # Development environment
.env.production         # Production environment
```

### Scripts (package.json)
```json
{
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "test": "vitest",
  "test:ui": "vitest --ui",
  "lint": "eslint . --ext ts,tsx",
  "format": "prettier --write \"src/**/*.{ts,tsx,css}\""
}
```

### Configuration Files
- `vite.config.ts`: Vite build configuration, path aliases, plugins
- `tsconfig.json`: TypeScript compiler options, path mappings
- `tailwind.config.js`: Tailwind CSS customization, theme, plugins
- `.eslintrc.json`: ESLint rules and configuration
- `.prettierrc`: Prettier formatting rules

