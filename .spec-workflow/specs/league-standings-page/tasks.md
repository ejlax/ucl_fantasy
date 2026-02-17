# Tasks Document

## Overview

This spec requires implementing only **1 file**: `src/pages/StandingsPage.tsx`. All supporting infrastructure (services, hooks, components) already exists and is fully tested. The implementation follows the exact pattern from `PredictionsPage.tsx`.

---

- [x] 1. Implement StandingsPage component
  - **File**: `src/pages/StandingsPage.tsx`
  - **Description**: Create the main page component that orchestrates standings display with league selection
  - **Implementation Details**:
    - Import required hooks: `useAuth`, `useUserLeagues`, `useLeagueStandings`
    - Import `StandingsTable` component from `@/components/standings/StandingsTable`
    - Add state for `selectedLeagueId` using `useState`
    - Fetch current user with `useAuth()`
    - Fetch user's leagues with `useUserLeagues(user?.id || '')`
    - Fetch standings with `useLeagueStandings(selectedLeagueId)`
    - Default to first league when leagues load (same pattern as PredictionsPage)
    - Render league selector dropdown when user has multiple leagues
    - Render StandingsTable with standings data and currentUserId
    - Handle loading states with skeleton or spinner
    - Handle error states with error message and retry option
    - Handle empty state when user has no leagues (link to create/join league)
  - **Purpose**: Provide users with a complete standings viewing experience
  - **Leverage**: 
    - `src/hooks/useAuth.ts` - Get current user
    - `src/hooks/useLeagues.ts` - useUserLeagues hook
    - `src/hooks/useStandings.ts` - useLeagueStandings hook
    - `src/components/standings/StandingsTable.tsx` - Display component
    - `src/pages/PredictionsPage.tsx` - Reference pattern for league selection
  - **Requirements**: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3
  - **Prompt**: 
    ```
    Implement the task for spec league-standings-page, first run spec-workflow-guide to get the workflow guide then implement the task:
    
    Role: React Developer with expertise in TypeScript, React hooks, and React Query
    
    Task: Implement StandingsPage component in src/pages/StandingsPage.tsx following the exact pattern from src/pages/PredictionsPage.tsx. The component should:
    1. Use useAuth() to get current user
    2. Use useUserLeagues(user?.id || '') to fetch user's leagues
    3. Use useState to manage selectedLeagueId
    4. Default to first league when leagues load (if statement: if (leagues && leagues.length > 0 && !selectedLeagueId))
    5. Use useLeagueStandings(selectedLeagueId) to fetch standings
    6. Render league selector dropdown when leagues.length > 1 (copy pattern from PredictionsPage)
    7. Render StandingsTable component with standings and currentUserId props
    8. Handle loading states (isLoading from hooks)
    9. Handle error states (error from hooks)
    10. Handle empty state when user has no leagues
    11. Display league name as page heading
    12. Display member count below heading
    13. Use Tailwind CSS classes following existing color system (primary, secondary)
    14. Ensure mobile responsive design
    
    Restrictions:
    - Do NOT modify StandingsTable component
    - Do NOT modify standingsService
    - Do NOT modify any hooks
    - Do NOT create new services or utilities
    - Follow exact league selection pattern from PredictionsPage.tsx
    - Use existing Tailwind color classes (primary-*, secondary-*)
    - Do NOT install new packages
    
    Success Criteria:
    - Component compiles without TypeScript errors
    - League selector appears when user has multiple leagues
    - League selector is hidden when user has one league
    - Standings display correctly for selected league
    - Current user's row is highlighted in standings table
    - Loading states display properly
    - Error states display with retry option
    - Empty state displays with helpful message and links
    - Mobile responsive layout works on small screens
    - Code follows existing patterns and conventions
    
    After implementation:
    1. Mark this task as in-progress in tasks.md (change [ ] to [-])
    2. Implement the component
    3. Test the implementation manually
    4. Log the implementation using log-implementation tool with detailed artifacts
    5. Mark this task as complete in tasks.md (change [-] to [x])
    ```

---

- [ ] 2. Test StandingsPage implementation
  - **File**: Manual testing in browser
  - **Description**: Verify the StandingsPage works correctly in all scenarios
  - **Test Cases**:
    - User with no leagues sees empty state with create/join links
    - User with one league sees standings without league selector
    - User with multiple leagues sees league selector dropdown
    - Changing league selection updates standings
    - Current user's row is highlighted in standings
    - Loading state displays while fetching data
    - Error state displays when fetch fails
    - Retry button works after error
    - Mobile layout is responsive
    - Standings update when new match results are entered (via admin page)
  - **Purpose**: Ensure the feature works correctly before marking complete
  - **Leverage**: 
    - Browser DevTools for testing
    - Admin page for entering match results
    - Multiple test accounts for multi-league testing
  - **Requirements**: All requirements
  - **Prompt**: 
    ```
    Implement the task for spec league-standings-page, first run spec-workflow-guide to get the workflow guide then implement the task:
    
    Role: QA Engineer with expertise in manual testing and user acceptance testing
    
    Task: Manually test the StandingsPage implementation to verify all requirements are met. Test the following scenarios:
    1. Navigate to /standings as authenticated user
    2. Verify page loads without errors
    3. Test with user who has no leagues (empty state)
    4. Test with user who has one league (no selector)
    5. Test with user who has multiple leagues (selector appears)
    6. Test league selection changes
    7. Verify current user row is highlighted
    8. Test loading states
    9. Test error states (disconnect network)
    10. Test mobile responsive layout (resize browser)
    11. Verify standings update after match results change
    
    Restrictions:
    - Do NOT modify code during testing
    - Document any bugs or issues found
    - Test on both desktop and mobile viewports
    
    Success Criteria:
    - All test cases pass
    - No console errors
    - UI matches design specifications
    - Mobile layout is fully functional
    - Real-time updates work correctly
    
    After testing:
    1. Mark this task as in-progress in tasks.md (change [ ] to [-])
    2. Perform all test cases
    3. Document results
    4. Log the testing results using log-implementation tool
    5. Mark this task as complete in tasks.md (change [-] to [x])
    ```

---

## Implementation Notes

- **Total Files to Create**: 1 (StandingsPage.tsx)
- **Total Files to Modify**: 0 (all infrastructure exists)
- **Estimated Lines of Code**: ~150 lines
- **Dependencies**: All exist (no new packages needed)
- **Testing**: Manual testing in browser (no new test files needed for MVP)

## Reference Files

- **Pattern Reference**: `src/pages/PredictionsPage.tsx` (lines 1-200)
- **Component to Use**: `src/components/standings/StandingsTable.tsx`
- **Hooks to Use**: `src/hooks/useAuth.ts`, `src/hooks/useLeagues.ts`, `src/hooks/useStandings.ts`
- **Service (No Changes)**: `src/services/standingsService.ts`
- **Types (No Changes)**: `src/types/database.ts`

