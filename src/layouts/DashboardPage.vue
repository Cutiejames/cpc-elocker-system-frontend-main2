<template>
  <div>
    <!-- Sidebar -->
    <aside
      class="bg-dark text-white p-3 position-fixed top-0 start-0 h-100 d-flex flex-column"
      :style="{
        width: isCollapsed ? '80px' : '250px',
        transition: 'width 0.3s'
      }"
    >
      <!-- Logo + Brand -->
      <div class="d-flex align-items-center mb-4">
        <img
          :src="logo"
          alt="Logo"
          class="rounded-circle"
          width="45"
          height="45"
          role="button"
          @click="isCollapsed ? toggleSidebar() : null"
        />
        <span class="fw-bold ms-2" v-if="!isCollapsed">CPC E-Locker</span>
        <img
          v-if="!isCollapsed"
          :src="brandIcon"
          alt="Hamburger"
          class="ms-auto"
          width="25"
          height="15"
          role="button"
          @click="toggleSidebar"
          title="Collapse"
        />
      </div>

      <!-- Navigation -->
      <div class="flex-grow-1 mt-3">
        <div
          v-for="item in navLinks"
          :key="item.label"
          class="nav-link text-white d-flex align-items-center mb-3"
          :class="{ 'justify-content-center': isCollapsed }"
        >
          <RouterLink
            :to="item.path"
            class="d-flex align-items-center text-white text-decoration-none w-100"
            :class="{ 'justify-content-center': isCollapsed }"
            :title="isCollapsed ? item.label : ''"
          >
            <img
              :src="item.img"
              alt="nav icon"
              width="40"
              height="40"
              :class="[isCollapsed ? '' : 'me-2']"
            />
            <span v-if="!isCollapsed">{{ item.label }}</span>
          </RouterLink>
        </div>

        <hr class="border-secondary my-2" />
      </div>

      <!-- Settings -->
      <div
        class="nav-link text-white d-flex align-items-center mb-2"
        :class="{ 'justify-content-center': isCollapsed }"
      >
        <RouterLink
          to="/dashboard/user-settings"
          class="d-flex align-items-center text-white text-decoration-none w-100"
          :class="{ 'justify-content-center': isCollapsed }"
          :title="isCollapsed ? 'Settings' : ''"
        >
          <img
            :src="settingsIcon"
            alt="settings"
            width="40"
            height="40"
            :class="[isCollapsed ? '' : 'me-2']"
          />
          <span v-if="!isCollapsed">Settings</span>
        </RouterLink>
      </div>

      <hr class="border-secondary my-2" />

      <!-- Logout -->
      <div
        class="nav-link text-white d-flex align-items-center"
        :class="{ 'justify-content-center': isCollapsed }"
      >
        <div
          role="button"
          class="d-flex align-items-center text-white text-decoration-none w-100"
          :class="{ 'justify-content-center': isCollapsed }"
          :title="isCollapsed ? 'Logout' : ''"
          @click="logout"
        >
          <img
            :src="logoutIcon"
            alt="logout"
            width="40"
            height="40"
            :class="[isCollapsed ? '' : 'me-2']"
          />
          <span v-if="!isCollapsed">Logout</span>
        </div>
      </div>

      <hr class="border-secondary my-2" />
    </aside>

    <!-- Main Content -->
    <main
      class="p-4 bg-light"
      :style="{
        marginLeft: isCollapsed ? '80px' : '250px',
        minHeight: '100vh',
        overflowY: 'auto'
      }"
    >
      <!-- Topbar -->
      <div class="container-fluid py-3 border-bottom mb-4 bg-white rounded shadow-sm">
        <div class="d-flex justify-content-end align-items-center">
          <div class="me-2 text-end">
            <div>{{ user?.f_name || 'Student' }}</div>
            <div class="fst-italic small">{{ user?.course_name || 'Course' }}</div>
          </div>
        </div>
      </div>

      <RouterView />
    </main>
  </div>
</template>

<script>
import { ref } from "vue";
import { useLogout } from "@/composables/useLogout";

// ✅ Import Assets
import logo from "@/assets/cpc-logo.jpg";
import brandIcon from "@/assets/hamburger.png";
import lockerIcon from "@/assets/locker.png";
import rentalIcon from "@/assets/rentalstatus.png";
import supportIcon from "@/assets/contactus.png";
import settingsIcon from "@/assets/settings.png";
import logoutIcon from "@/assets/logout.png";

export default {
  setup() {
    const isCollapsed = ref(false);
    const user = ref(null);

    const toggleSidebar = () => {
      isCollapsed.value = !isCollapsed.value;
    };

    const { logout } = useLogout();

    const navLinks = [
      { label: "Locker", path: "/dashboard/user-locker", img: lockerIcon },
      { label: "Rental Status", path: "/dashboard/user-rental", img: rentalIcon },
      { label: "Support", path: "/dashboard/user-support", img: supportIcon },
    ];

    return {
      logo,
      brandIcon,
      lockerIcon,
      rentalIcon,
      supportIcon,
      settingsIcon,
      logoutIcon,
      isCollapsed,
      user,
      navLinks,
      toggleSidebar,
      logout,
    };
  },
};
</script>

<style scoped>
main {
  transition: margin-left 0.3s ease;
}
</style>