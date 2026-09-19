/**
 * Client-side rate limiter for login attempts.
 *
 * Stores state in localStorage so it persists across page reloads
 * but is per-device (not per-account — that requires server-side).
 *
 * Policy: 5 failed attempts → 15-minute lockout.
 */

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes
const STORAGE_KEY = "lh_login_attempts";

interface RateLimitState {
  count: number;
  lockedUntil: number | null;
}

function read(): RateLimitState {
  if (typeof window === "undefined") return { count: 0, lockedUntil: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { count: 0, lockedUntil: null };
    return JSON.parse(raw);
  } catch {
    return { count: 0, lockedUntil: null };
  }
}

function write(state: RateLimitState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/** Record a failed login attempt. Returns true if now locked out. */
export function recordFailedAttempt(): boolean {
  const state = read();

  // If already locked out, don't increment further
  if (state.lockedUntil && Date.now() < state.lockedUntil) {
    return true;
  }

  // If lockout expired, reset
  if (state.lockedUntil && Date.now() >= state.lockedUntil) {
    state.count = 0;
    state.lockedUntil = null;
  }

  state.count += 1;

  if (state.count >= MAX_ATTEMPTS) {
    state.lockedUntil = Date.now() + LOCKOUT_MS;
  }

  write(state);
  return state.count >= MAX_ATTEMPTS;
}

/** Reset all attempts (call on successful login). */
export function resetAttempts() {
  write({ count: 0, lockedUntil: null });
}

/** Check if currently locked out. Returns ms remaining (0 = not locked). */
export function getLockoutRemainingMs(): number {
  const state = read();
  if (!state.lockedUntil) return 0;
  const remaining = state.lockedUntil - Date.now();
  if (remaining <= 0) {
    // Lockout expired — clean up
    write({ count: 0, lockedUntil: null });
    return 0;
  }
  return remaining;
}

/** Get remaining attempts before lockout. */
export function getRemainingAttempts(): number {
  const state = read();
  if (state.lockedUntil && Date.now() < state.lockedUntil) return 0;
  return Math.max(0, MAX_ATTEMPTS - state.count);
}

/** Format milliseconds as "Xm Ys" string. */
export function formatLockoutTime(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds}s`;
}
