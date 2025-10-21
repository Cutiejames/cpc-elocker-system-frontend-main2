// composables/useAuth.js - Vue 3 Auth Composable
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { clearAuthData, getCurrentUser, isAuthenticated, setupAxiosInterceptors } from '@/utils/auth'

// Global reactive state - shared across all components
const authState = reactive({
  currentUser: null,
  isLoggedIn: false,
  isLoading: false
})

export const useAuth = () => {
  const router = useRouter()
  const isLoggingOut = ref(false)

  // Initialize auth state
  const initAuth = () => {
    authState.currentUser = getCurrentUser()
    authState.isLoggedIn = isAuthenticated()
    
    // Setup axios interceptors
    setupAxiosInterceptors(router)
  }

  // Login function - call after successful API login
  const login = (userData, token, role) => {
    // Store in localStorage
    localStorage.setItem('authToken', token)
    localStorage.setItem('userData', JSON.stringify(userData))
    localStorage.setItem('userRole', role)
    
    // Update reactive state
    authState.currentUser = { ...userData, role }
    authState.isLoggedIn = true
    
    console.log('User logged in successfully')
  }

  // Logout function
  const logout = async (showConfirm = true) => {
    if (isLoggingOut.value) return false

    // Optional confirmation dialog
    if (showConfirm) {
      const confirmed = confirm('Are you sure you want to logout?')
      if (!confirmed) return false
    }

    isLoggingOut.value = true
    
    try {
      // Clear all auth data
      clearAuthData()
      
      // Update reactive state
      authState.currentUser = null
      authState.isLoggedIn = false
      
      // Redirect to login page
      await router.push('/')
      
      console.log('User logged out successfully')
      return true
    } catch (error) {
      console.error('Logout error:', error)
      return false
    } finally {
      isLoggingOut.value = false
    }
  }

  // Force logout without confirmation
  const forceLogout = () => {
    return logout(false)
  }

  // Session expired logout
  const sessionExpiredLogout = () => {
    clearAuthData()
    authState.currentUser = null
    authState.isLoggedIn = false
    router.push('/')
    alert('Your session has expired. Please login again.')
  }

  // Check if user has specific role
  const hasRole = (role) => {
    return authState.currentUser?.role === role
  }

  // Update user data
  const updateUser = (newUserData) => {
    if (authState.currentUser) {
      authState.currentUser = { ...authState.currentUser, ...newUserData }
      localStorage.setItem('userData', JSON.stringify(authState.currentUser))
    }
  }

  // Computed properties
  const userRole = computed(() => authState.currentUser?.role || null)
  const isAdmin = computed(() => hasRole('admin'))
  const isUser = computed(() => hasRole('user'))
  const userName = computed(() => authState.currentUser?.username || '')
  const userId = computed(() => authState.currentUser?.user_id || '')

  // Initialize auth state if not already done
  if (!authState.currentUser && !authState.isLoggedIn) {
    initAuth()
  }

  return {
    // Reactive state
    currentUser: computed(() => authState.currentUser),
    isLoggedIn: computed(() => authState.isLoggedIn),
    isLoggingOut: computed(() => isLoggingOut.value),
    isLoading: computed(() => authState.isLoading),
    
    // Computed properties
    userRole,
    isAdmin,
    isUser,
    userName,
    userId,

    // Methods
    login,
    logout,
    forceLogout,
    sessionExpiredLogout,
    hasRole,
    updateUser,
    initAuth
  }
}