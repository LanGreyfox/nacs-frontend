<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { fetchStatus, HttpError } from '@/api/backend'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const username = ref('')
const password = ref('')
const error = ref<string | null>(null)
const submitting = ref(false)

async function onSubmit() {
  error.value = null
  submitting.value = true
  try {
    await fetchStatus({ username: username.value, password: password.value })
  } catch (e) {
    error.value =
      e instanceof HttpError && e.status === 401 ? 'Invalid credentials' : 'Backend unreachable'
    return
  } finally {
    submitting.value = false
  }
  auth.login(username.value, password.value)
  await router.push({ name: 'home' })
}
</script>

<template>
  <main>
    <form @submit.prevent="onSubmit">
      <h1>Login</h1>
      <label>
        Username
        <input v-model="username" name="username" type="text" autocomplete="username" required />
      </label>
      <label>
        Password
        <input
          v-model="password"
          name="password"
          type="password"
          autocomplete="current-password"
          required
        />
      </label>
      <p v-if="error" role="alert">{{ error }}</p>
      <button type="submit" :disabled="submitting">Log in</button>
    </form>
  </main>
</template>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 20rem;
  margin: 4rem auto;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
</style>
