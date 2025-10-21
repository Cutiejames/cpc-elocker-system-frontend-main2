<template>
  <header class="app-header">
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center py-3">
        
        <!-- Left side - Logo and title -->
        <div class="header-left d-flex align-items-center">
          <img 
            src="@/assets/cpc-logo.jpg" 
            alt="CPC Logo" 
            class="logo me-3"
          />
          <div>
            <h1 class="h4 mb-0 text-white fw-bold">CPC E-LOCKER</h1>
            <small class="text-light opacity-75" v-if="currentUser">
              {{ isAdmin ? 'Admin Dashboard' : 'User Dashboard' }}
            </small>
          </div>
        </div>

        <!-- Right side - User info and logout -->
        <div class="header-right d-flex align-items-center" v-if="isLoggedIn">
          
          <!-- User info -->
          <div class="user-info me-3 text-end">
            <div class="user-name text-white fw-semibold">
              {{ userName }}
            </div>
            <div class="user-details">
              <small class="text-light opacity-75">
                ID: {{ userId }}
              </small>
              <span 
                :class="roleBadgeClasses"
                class="badge ms-2"
              >
                {{ userRole }}
              </span>
            </div>
          </div>

          <!-- User avatar -->
          <div class="user-avatar me-3">
            <div class="avatar-circle">
              {{ userInitials }}
            </div>
          </div>

          <!-- Logout button -->
          <LogoutButton 
            variant="outline-light"
            size="sm"
            :show-confirmation="true"
          />
        </div>

        <!-- Login prompt if not logged in -->
        <div class="header-right" v-else>
          <router-link to="/" class="btn btn-outline-light btn-sm">
            Login
          </router-link>
        </div>

      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import LogoutButton from './LogoutButton.vue'

// Use auth composable
const { 
  currentUser, 
  isLoggedIn, 
  userName, 
  userId, 
  userRole, 
  isAdmin 
} = useAuth()

// Computed properties
const userInitials = computed(() => {
  if (!userName.value) return '?'
  
  const names = userName.value.split(' ')
  if (names.length >= 2) {
    return names[0].charAt(0).toUpperCase() + names[1].charAt(0).toUpperCase()
  }
  return userName.value.charAt(0).toUpperCase()
})

const roleBadgeClasses = computed(() => {
  const baseClasses = 'badge text-uppercase'
  
  switch (userRole.value) {
    case 'admin':
      return `${baseClasses} bg-danger`
    case 'user':
      return `${baseClasses} bg-primary`
    default:
      return `${baseClasses} bg-secondary`
  }
})
</script>

<style scoped>
.app-header {
  background: linear-gradient(135deg, #000020 0%, #1a1a3a 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.logo {
  width: 50px;
  height: 50px;
  object-fit: contain;
  border-radius: 8px;
}

.user-info {
  min-width: 150px;
}

.user-name {
  font-size: 0.9rem;
  line-height: 1.2;
}

.user-details {
  font-size: 0.75rem;
  line-height: 1.2;
}

.user-avatar {
  position: relative;
}

.avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #007bff, #0056b3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.avatar-circle:hover {
  transform: scale(1.05);
  border-color: rgba(255, 255, 255, 0.4);
}

.badge {
  font-size: 0.65rem;
  padding: 0.25rem 0.5rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .header-left h1 {
    font-size: 1.1rem;
  }
  
  .user-info {
    display: none;
  }
  
  .logo {
    width: 40px;
    height: 40px;
  }
  
  .avatar-circle {
    width: 35px;
    height: 35px;
    font-size: 0.8rem;
  }
}

@media (max-width: 576px) {
  .header-left h1 {
    font-size: 1rem;
  }
  
  .header-left small {
    display: none;
  }
}
</style>