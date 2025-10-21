<template>
  <button 
    :class="buttonClasses"
    @click="handleLogout"
    :disabled="isLoggingOut"
  >
    <!-- Loading spinner -->
    <div 
      v-if="isLoggingOut" 
      class="spinner-border spinner-border-sm me-2" 
      role="status"
      aria-hidden="true"
    ></div>
    
    <!-- Logout icon (when not loading) -->
    <svg 
      v-else
      xmlns="http://www.w3.org/2000/svg" 
      width="16" 
      height="16" 
      fill="currentColor" 
      class="bi bi-box-arrow-right me-2" 
      viewBox="0 0 16 16"
    >
      <path 
        fill-rule="evenodd" 
        d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"
      />
      <path 
        fill-rule="evenodd" 
        d="m15.854 8.354-3-3a.5.5 0 0 0-.708.708L14.293 8l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708z"
      />
      <path 
        fill-rule="evenodd" 
        d="M11 8a.5.5 0 0 0-.5-.5H6a.5.5 0 0 0 0 1h4.5A.5.5 0 0 0 11 8"
      />
    </svg>

    <!-- Button text -->
    {{ isLoggingOut ? 'Logging out...' : 'Logout' }}
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { useAuth } from '@/composables/useAuth'

// Props
const props = defineProps({
  variant: {
    type: String,
    default: 'danger', // danger, outline-danger, secondary, etc.
    validator: (value) => ['danger', 'outline-danger', 'secondary', 'outline-secondary', 'dark', 'outline-dark'].includes(value)
  },
  size: {
    type: String,
    default: 'md', // sm, md, lg
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  block: {
    type: Boolean,
    default: false
  },
  showConfirmation: {
    type: Boolean,
    default: true
  }
})

// Use auth composable
const { logout, isLoggingOut } = useAuth()

// Computed button classes
const buttonClasses = computed(() => {
  const classes = ['btn', 'd-flex', 'align-items-center', 'justify-content-center']
  
  // Variant
  classes.push(`btn-${props.variant}`)
  
  // Size
  if (props.size === 'sm') classes.push('btn-sm')
  if (props.size === 'lg') classes.push('btn-lg')
  
  // Block
  if (props.block) classes.push('w-100')
  
  return classes.join(' ')
})

// Handle logout
const handleLogout = async () => {
  try {
    const success = await logout(props.showConfirmation)
    if (success) {
      console.log('Logout successful')
    }
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
</script>

<style scoped>
.btn {
  transition: all 0.2s ease-in-out;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}
</style>