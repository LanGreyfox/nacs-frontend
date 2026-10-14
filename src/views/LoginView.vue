<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const username = ref('')
const password = ref('')

async function onSubmit() {
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
      <button type="submit">Log in</button>
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
