/**
 * Application constants
 */

// Tournament rounds
export const ROUNDS = {
  PLAYOFF: 'PLAYOFF',
  R16: 'R16',
  QF: 'QF',
  SF: 'SF',
  FINAL: 'FINAL',
} as const;

export type Round = (typeof ROUNDS)[keyof typeof ROUNDS];

// Default scoring system
export const DEFAULT_SCORING = {
  EXACT_SCORE: 3, // Exact score prediction
  CORRECT_RESULT: 1, // Correct winner/draw but wrong score
  WRONG_RESULT: 0, // Wrong prediction
} as const;

// Bonus points system (optional league settings)
export const BONUS_POINTS = {
  TIE_WINNER: 2, // Bonus for correctly predicting which team advances from a two-leg tie
  ROUND_WINNER_R16: 5, // Bonus for getting all R16 winners correct
  ROUND_WINNER_QF: 10, // Bonus for getting all QF winners correct
  ROUND_WINNER_SF: 15, // Bonus for getting all SF winners correct
} as const;

// Prediction lock time (minutes before match)
export const PREDICTION_LOCK_MINUTES = 60;

// League settings
export const LEAGUE_SETTINGS = {
  MIN_NAME_LENGTH: 3,
  MAX_NAME_LENGTH: 100,
  INVITE_CODE_LENGTH: 6,
  MAX_MEMBERS: 100,
} as const;

// User settings
export const USER_SETTINGS = {
  MIN_DISPLAY_NAME_LENGTH: 2,
  MAX_DISPLAY_NAME_LENGTH: 50,
  MIN_PASSWORD_LENGTH: 8,
} as const;

// Query keys for React Query
export const QUERY_KEYS = {
  USER: 'user',
  LEAGUES: 'leagues',
  LEAGUE: 'league',
  LEAGUE_MEMBERS: 'leagueMembers',
  MATCHES: 'matches',
  PREDICTIONS: 'predictions',
  STANDINGS: 'standings',
  ESPN_MATCHES: 'espnMatches',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  LEAGUES: '/leagues',
  LEAGUE: '/leagues/:id',
  CREATE_LEAGUE: '/leagues/create',
  JOIN_LEAGUE: '/leagues/join',
  BRACKET: '/bracket',
  PREDICTIONS: '/predictions',
  STANDINGS: '/standings',
  PROFILE: '/profile',
  ADMIN: '/admin',
} as const;
