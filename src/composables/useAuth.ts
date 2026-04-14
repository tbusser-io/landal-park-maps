import { ref, computed, onMounted } from 'vue';
import type { User } from '../types/Park';

const STORAGE_KEY = 'landal_auth';

// Mock users database
const MOCK_USERS: User[] = [
  {
    email: 'demo@landal.com',
    name: 'Demo User',
    visitedParkIds: ['park-1', 'park-5', 'park-12', 'park-23', 'park-34', 'park-45', 'park-56', 'park-67'],
  },
  {
    email: 'test@landal.com',
    name: 'Test User',
    visitedParkIds: ['park-2', 'park-8', 'park-15', 'park-28', 'park-41', 'park-52'],
  },
];

// Shared state (singleton) - created once, shared by all components
const user = ref<User | null>(null);
const isAuthenticated = computed(() => user.value !== null);

// Restore from localStorage immediately
try {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    user.value = JSON.parse(stored);
  }
} catch (e) {
  console.error('Failed to restore auth', e);
  localStorage.removeItem(STORAGE_KEY);
}

export function useAuth() {

  const login = (email: string, password: string): boolean => {
    const found = MOCK_USERS.find((u) => u.email === email);
    if (found) {
      user.value = found;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
      return true;
    }
    return false;
  };

  const logout = () => {
    user.value = null;
    localStorage.removeItem(STORAGE_KEY);
  };

  return { user, isAuthenticated, login, logout };
}
