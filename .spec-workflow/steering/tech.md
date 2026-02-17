# Technology Stack

## Project Type

Full-stack web application with real-time capabilities, designed as a responsive SaaS platform for fantasy sports competition. The application features a modern React frontend, Supabase backend-as-a-service, and real-time data synchronization for live tournament brackets and leaderboards.

## Core Technologies

### Primary Language(s)
- **Language**: TypeScript 5.7+ (latest stable)
- **Runtime**: Node.js 20+ LTS (for build tools and development)
- **Browser Target**: ES2022+ (modern browsers only)
- **Language-specific tools**: pnpm for package management (faster, more efficient than npm), Vite 6+ for build tooling

### Key Dependencies/Libraries

**Frontend Framework & UI**
- **React 19**: Latest version with improved concurrent features, automatic batching, and enhanced server components support
- **Vite 6+**: Next-generation frontend build tool with hot module replacement and optimized builds
- **Tailwind CSS 4**: Latest version with improved performance, native CSS cascade layers, and enhanced JIT compiler
- **Lucide React**: Icon library for consistent, beautiful iconography
- **React Router 7+**: Client-side routing and navigation with latest data loading patterns

**Backend & Database**
- **Supabase**: Backend-as-a-service providing PostgreSQL database, authentication, real-time subscriptions, and storage
- **PostgreSQL 16+**: Latest relational database (via Supabase) with improved performance and JSON capabilities
- **Supabase Auth**: User authentication and authorization with JWT tokens
- **Supabase Realtime**: WebSocket-based real-time database subscriptions with improved scalability

**Push Notifications**
- **Progressier**: Progressive Web App (PWA) platform for push notifications and offline capabilities

**State Management & Data Fetching**
- **React Query / TanStack Query**: Server state management, caching, and synchronization
- **Zustand** (optional): Lightweight client-side state management for UI state
- **Supabase JS Client**: Official JavaScript client for Supabase interactions

**Date & Time Handling**
- **Custom dateUtils**: Project-specific date/time utilities for match scheduling and timezone handling
- **date-fns** (if needed): Modern date utility library for complex date operations

### Application Architecture

**Client-Server Architecture with Real-Time Capabilities**

The application follows a modern JAMstack-inspired architecture:

1. **Frontend (React SPA)**: Single-page application handling all UI rendering, user interactions, and client-side routing
2. **Backend-as-a-Service (Supabase)**: Managed backend providing database, authentication, real-time subscriptions, and serverless functions
3. **Real-Time Layer**: WebSocket connections for live bracket updates, match results, and leaderboard changes
4. **PWA Layer**: Progressive Web App capabilities for offline access and push notifications

**Architectural Patterns**:
- **Component-Based UI**: Modular React 19 components with clear separation of concerns
- **Server State vs Client State**: React Query manages server data; local state for UI-only concerns
- **Optimistic Updates**: Immediate UI feedback with background synchronization
- **Real-Time Subscriptions**: Supabase Realtime for live data updates without polling

### Data Storage

- **Primary Storage**: PostgreSQL 16+ (via Supabase) with row-level security (RLS) policies and advanced JSON operations
- **Caching**: React Query in-memory cache for API responses; browser localStorage for user preferences
- **Data Formats**: JSON for API communication; TypeScript interfaces for type safety
- **File Storage**: Supabase Storage for user avatars or league images (if applicable)

### External Integrations

- **APIs**: 
  - Supabase REST API for CRUD operations
  - Supabase Realtime API for WebSocket subscriptions
  - Progressier API for push notification management
  - (Future) Sports data APIs for automated match result fetching

- **Protocols**: 
  - HTTP/REST for standard API calls
  - WebSocket for real-time data synchronization
  - HTTPS for all production traffic

- **Authentication**: 
  - Supabase Auth with email/password, magic links, or OAuth providers (Google, GitHub)
  - JWT tokens for session management
  - Row-level security (RLS) for database access control

### Monitoring & Dashboard Technologies

- **Dashboard Framework**: React 19 with Vite 6+ for development
- **Real-time Communication**:
  - Supabase Realtime (WebSocket) for database changes
  - React Query for automatic background refetching
  - Progressier for push notifications
- **Visualization Libraries**:
  - Custom SVG/CSS for tournament bracket visualization
  - Tailwind CSS 4 for responsive layouts with native cascade layers
  - (Future) Chart.js or Recharts for analytics graphs
- **State Management**: React Query for server state; React Context/Zustand for UI state

## Development Environment

### Build & Development Tools
- **Build System**: Vite with TypeScript, React, and Tailwind CSS plugins
- **Package Management**: npm or pnpm (prefer pnpm for faster installs and disk efficiency)
- **Development Workflow**: 
  - Hot Module Replacement (HMR) via Vite
  - TypeScript watch mode for type checking
  - Supabase local development environment (optional)

### Code Quality Tools
- **Static Analysis**: 
  - TypeScript compiler for type checking
  - ESLint with React and TypeScript rules
  - Prettier for code formatting
- **Formatting**: Prettier with Tailwind CSS plugin for class sorting
- **Testing Framework**: 
  - Vitest for unit and integration tests
  - React Testing Library for component tests
  - (Future) Playwright or Cypress for E2E tests
- **Documentation**: JSDoc comments for complex functions; Markdown for project docs

### Version Control & Collaboration
- **VCS**: Git with GitHub for repository hosting
- **Branching Strategy**: GitHub Flow (main branch + feature branches)
- **Code Review Process**: Pull requests with required reviews before merging

### Dashboard Development
- **Live Reload**: Vite HMR for instant updates during development
- **Port Management**: Vite dev server on port 5173 (default); Supabase local on 54321
- **Multi-Instance Support**: Can run multiple dev servers on different ports if needed

## Deployment & Distribution

- **Target Platform(s)**: Web browsers (Chrome, Firefox, Safari, Edge) on desktop and mobile devices
- **Distribution Method**: SaaS - hosted web application accessible via URL
- **Hosting**: 
  - Frontend: Vercel, Netlify, or Cloudflare Pages (static hosting with edge functions)
  - Backend: Supabase Cloud (managed PostgreSQL and services)
- **Installation Requirements**: Modern web browser with JavaScript enabled; no installation needed
- **Update Mechanism**: Continuous deployment from main branch; users get updates on page refresh

## Technical Requirements & Constraints

### Performance Requirements
- **Page Load Time**: Initial load < 2 seconds on 3G connection
- **Time to Interactive**: < 3 seconds for first meaningful interaction
- **Real-Time Latency**: Bracket updates appear within 1 second of database change
- **API Response Time**: < 500ms for 95th percentile of requests
- **Bundle Size**: Initial JavaScript bundle < 200KB gzipped

### Compatibility Requirements
- **Platform Support**:
  - Desktop: Windows 10+, macOS 11+, Linux (modern distros)
  - Mobile: iOS 15+, Android 11+
  - Browsers: Last 2 versions of Chrome, Firefox, Safari, Edge
- **Dependency Versions**:
  - Node.js 20+ LTS for development
  - React 19, TypeScript 5.7+, Vite 6+, Tailwind CSS 4
  - PostgreSQL 16+ (via Supabase)
- **Standards Compliance**:
  - WCAG 2.1 Level AA for accessibility
  - PWA standards for offline capabilities
  - Responsive design for mobile-first approach

### Security & Compliance
- **Security Requirements**: 
  - All data transmitted over HTTPS/WSS
  - Supabase Row-Level Security (RLS) for database access control
  - JWT token-based authentication with secure httpOnly cookies
  - Input validation and sanitization on client and server
  - CSRF protection for state-changing operations
- **Compliance Standards**: 
  - GDPR compliance for EU users (data privacy, right to deletion)
  - Basic data protection best practices
- **Threat Model**: 
  - Prevent unauthorized access to private leagues
  - Protect against prediction tampering after lock time
  - Secure user authentication and session management
  - Prevent SQL injection via Supabase parameterized queries

### Scalability & Reliability
- **Expected Load**: 
  - 100-1,000 concurrent users during peak match times
  - 10-100 active leagues per tournament season
  - 1,000-10,000 predictions per round
- **Availability Requirements**: 
  - 99.5% uptime during tournament season
  - Graceful degradation if real-time features fail
  - Supabase handles database scaling and backups
- **Growth Projections**: 
  - 10x user growth year-over-year
  - Horizontal scaling via Supabase infrastructure
  - CDN caching for static assets

## Technical Decisions & Rationale

### Decision Log

1. **Supabase over Custom Backend**: Chose Supabase to accelerate development, eliminate infrastructure management, and get real-time capabilities out-of-the-box. Trade-off: vendor lock-in, but migration path exists via PostgreSQL compatibility.

2. **React 19 + Vite 6 over Next.js**: Selected latest React with Vite for faster development experience, improved concurrent features, and simpler deployment model. The app doesn't require SSR for SEO (private leagues), so SPA architecture is sufficient. Next.js adds unnecessary complexity for this use case.

3. **Tailwind CSS 4 over Component Libraries**: Chose latest Tailwind for maximum design flexibility, improved performance with native CSS layers, and custom production-ready UIs. Avoids cookie-cutter designs from pre-built component libraries. Trade-off: more initial styling work, but better long-term customization and performance.

4. **TypeScript Everywhere**: Enforces type safety across frontend and backend interactions, reducing runtime errors and improving developer experience. Essential for maintaining code quality as project grows.

5. **Progressier for Push Notifications**: Integrated solution for PWA and push notifications that works seamlessly with Supabase. Simpler than building custom service worker infrastructure.

6. **Custom dateUtils over External Libraries**: Project-specific date handling utilities provide exactly what's needed without bloat. Can integrate date-fns for complex operations if needed later.

## Known Limitations

- **Manual Match Results (Initial Version)**: First version requires manual entry of match results. Future enhancement will integrate sports data APIs for automated updates.

- **No Offline Prediction Entry**: While PWA provides offline viewing, predictions require online connection to prevent conflicts. Future enhancement could add offline queue with sync.

- **Single Tournament Type**: Initially supports only Champions League knockout format. Architecture designed to extend to other tournaments in future versions.

- **Limited Analytics**: Basic statistics in v1. Advanced analytics (trends, insights, AI predictions) planned for future releases.

- **No Native Mobile Apps**: Web-first approach means no native iOS/Android apps initially. PWA provides app-like experience, but native apps could improve engagement in future.

