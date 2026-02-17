/**
 * Validation utility functions
 */

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @param minLength - Minimum length (default: 8)
 */
export function isValidPassword(password: string, minLength: number = 8): boolean {
  return password.length >= minLength;
}

/**
 * Validate display name
 */
export function isValidDisplayName(name: string): boolean {
  return name.trim().length >= 2 && name.trim().length <= 50;
}

/**
 * Validate invite code format (6 uppercase alphanumeric characters)
 */
export function isValidInviteCode(code: string): boolean {
  const inviteCodeRegex = /^[A-Z0-9]{6}$/;
  return inviteCodeRegex.test(code);
}

/**
 * Generate a random invite code
 */
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Validate score (must be non-negative integer)
 */
export function isValidScore(score: number): boolean {
  return Number.isInteger(score) && score >= 0;
}

/**
 * Validate league name
 */
export function isValidLeagueName(name: string): boolean {
  return name.trim().length >= 3 && name.trim().length <= 100;
}
