<script setup lang="ts">
import { useAuth } from '../composables/useAuth';

const emit = defineEmits<{
  openLogin: [];
}>();

const { user, isAuthenticated, logout } = useAuth();

const handleLogout = () => {
  logout();
};
</script>

<template>
  <header class="app-header">
    <div class="header-content">
      <div class="logo">
        <h1>Landal Parks</h1>
      </div>

      <div class="auth-section">
        <div v-if="isAuthenticated" class="user-info">
          <span class="user-name">{{ user?.name }}</span>
          <button class="logout-button" @click="handleLogout">
            Logout
          </button>
        </div>

        <button v-else class="login-button" @click="emit('openLogin')">
          Login
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  max-width: 100%;
}

.logo h1 {
  margin: 0;
  font-size: 24px;
  color: #1f2937;
  font-weight: 700;
}

.auth-section {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.login-button,
.logout-button {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.login-button {
  background: #3b82f6;
  color: white;
}

.login-button:hover {
  background: #2563eb;
}

.login-button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.logout-button {
  background: #f3f4f6;
  color: #374151;
}

.logout-button:hover {
  background: #e5e7eb;
}

.logout-button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

@media (max-width: 767px) {
  .header-content {
    padding: 12px 16px;
  }

  .logo h1 {
    font-size: 20px;
  }

  .user-name {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .login-button,
  .logout-button {
    transition: none;
  }
}
</style>
