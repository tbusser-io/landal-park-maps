import { ref, computed } from 'vue';
import type { User } from '../types/Park';

/** LocalStorage key for persisting authentication state */
const STORAGE_KEY = 'landal_auth';

/**
 * Mock users database with real Landal park codes
 * In production, this would be replaced with API authentication
 */
const MOCK_USERS: User[] = [
  {
    email: 'demo@landal.com',
    name: 'Demo User',
    visitedParkIds: ['ABG', 'AHT', 'AND', 'BDM', 'COG', 'HDG', 'TXL', 'ONE', 'VDN', 'KWT', 'SLI', 'VDM'],
  },
  {
    email: 'test@landal.com',
    name: 'Test User',
    visitedParkIds: ['WBG', 'MYL', 'SBG', 'CHM', 'HWD', 'DTR', 'WRG', 'BBG'],
  },
];

// Shared state (singleton) - created once, shared by all components
const user = ref<User | null>(null);
const isAuthenticated = computed(() => user.value !== null);

// Restore authentication state from localStorage on module load
try {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    user.value = JSON.parse(stored);
  }
} catch (e) {
  console.error('Failed to restore auth', e);
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Composable for managing user authentication state
 *
 * Provides login/logout functionality with localStorage persistence.
 * Uses mock authentication for demo purposes.
 *
 * @returns Authentication state and operations
 *
 * @example
 * ```typescript
 * const { user, isAuthenticated, login, logout } = useAuth();
 *
 * // Login
 * if (login('demo@landal.com', 'any-password')) {
 *   console.log('Logged in as:', user.value?.name);
 * }
 *
 * // Check authentication
 * if (isAuthenticated.value) {
 *   console.log('Visited parks:', user.value?.visitedParkIds);
 * }
 *
 * // Logout
 * logout();
 * ```
 */
export function useAuth() {

  /**
   * Attempts to log in a user with email and password
   *
   * @param email - User's email address
   * @param password - User's password (not validated in mock mode)
   * @returns True if login successful, false otherwise
   */
  const login = (email: string, password: string): boolean => {
    const found = MOCK_USERS.find((u) => u.email === email);
    if (found) {
      user.value = found;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
      return true;
    }
    return false;
  };

  /**
   * Logs out the current user and clears persisted state
   */
  const logout = () => {
    user.value = null;
    localStorage.removeItem(STORAGE_KEY);
  };

  return { user, isAuthenticated, login, logout };
}
