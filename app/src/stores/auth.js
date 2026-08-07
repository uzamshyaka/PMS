import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useApiState } from '@/stores/apiState'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = ref(false)
  const apiState = useApiState()

  const login = (userData) => {
    user.value = userData
    isAuthenticated.value = true
  }

  const logout = () => {
    user.value = null
    isAuthenticated.value = false
  }

  return {
    user,
    isAuthenticated,
    login,
    logout,
    apiState
  }
})