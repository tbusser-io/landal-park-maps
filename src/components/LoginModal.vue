<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '../composables/useAuth';

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { login } = useAuth();
const email = ref('');
const password = ref('');
const error = ref('');

const handleLogin = () => {
  error.value = '';
  const success = login(email.value, password.value);

  if (success) {
    email.value = '';
    password.value = '';
    emit('close');
  } else {
    error.value = 'Invalid email or password. Try demo@landal.com';
  }
};

const handleClose = () => {
  email.value = '';
  password.value = '';
  error.value = '';
  emit('close');
};
</script>

<template>
  <div v-if="show" class="modal-overlay" @click="handleClose">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Login</h2>
        <button class="close-button" @click="handleClose" aria-label="Close">×</button>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="demo@landal.com"
            required
            autocomplete="email"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Any password"
            required
            autocomplete="current-password"
          />
        </div>

        <p v-if="error" class="error-message">{{ error }}</p>

        <button type="submit" class="login-button">Login</button>

        <p class="hint">Demo accounts: demo@landal.com or test@landal.com</p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-header h2 {
  margin: 0;
  font-size: 24px;
  color: #1f2937;
}

.close-button {
  background: none;
  border: none;
  font-size: 32px;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.close-button:hover {
  color: #1f2937;
}

.close-button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-group input {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.error-message {
  color: #dc2626;
  font-size: 14px;
  margin: 0;
}

.login-button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.login-button:hover {
  background: #2563eb;
}

.login-button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.hint {
  font-size: 12px;
  color: #6b7280;
  text-align: center;
  margin: 0;
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
