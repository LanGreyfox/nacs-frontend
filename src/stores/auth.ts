import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'nacs-credentials'

interface Credentials {
  username: string
  password: string
}

function loadCredentials(): Credentials | null {
  const raw = sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Credentials
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const credentials = ref<Credentials | null>(loadCredentials())
  const isAuthenticated = computed(() => credentials.value !== null)

  function login(username: string, password: string) {
    credentials.value = { username, password }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(credentials.value))
  }

  function logout() {
    credentials.value = null
    sessionStorage.removeItem(STORAGE_KEY)
  }

  return { credentials, isAuthenticated, login, logout }
})
