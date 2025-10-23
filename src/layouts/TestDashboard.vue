<template>
  <div>
    <!-- FLOATING SIDEBAR (Desktop) -->
    <aside
      class="bg-dark text-white p-3 position-fixed top-0 start-0 h-100 d-none d-lg-flex flex-column"
      :style="{
        width: isCollapsed ? '90px' : '250px',
        transition: 'width 0.3s ease',
        zIndex: 1050,
        boxShadow: '0 0 15px rgba(0,0,0,0.3)',
      }"
    >
      <!-- Logo and Collapse -->
      <div
        class="d-flex align-items-center justify-content-between mb-4"
        :class="{ 'flex-column': isCollapsed }"
      >
        <div
          class="d-flex align-items-center justify-content-center w-100"
          style="gap: 8px"
        >
          <!-- ✅ Logo now opens sidebar only when collapsed -->
          <img
            :src="logo"
            alt="CPC Logo"
            class="rounded-circle"
            width="50"
            height="50"
            role="button"
            @click="openSidebar"
            title="Open Sidebar"
          />
          <span
            v-if="!isCollapsed"
            class="fw-bold"
            style="font-size: 18px;"
          >
            CPC E-Locker
          </span>
        </div>

        <!-- ✅ Collapse button only appears when sidebar is open -->
        <img
          v-if="!isCollapsed"
          :src="brandIcon"
          alt="Collapse"
          class="ms-auto mt-2 collapse-btn"
          width="25"
          height="18"
          role="button"
          @click="closeSidebar"
          title="Collapse Sidebar"
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
              alt="icon"
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
          to="/TestDashboard/settings"
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
    </aside>

    <!-- FLOATING MENU BUTTON (Mobile) -->
    <button
      class="btn text-white position-fixed d-lg-none"
      style="
        background-color: #212529;
        top: 15px;
        left: 15px;
        z-index: 2000;
        border-radius: 10px;
        padding: 8px 10px;
      "
      @click="toggleMobileMenu"
    >
      <img :src="brandIcon" alt="menu" width="28" height="18" />
    </button>

    <!-- MOBILE MENU DROPDOWN -->
    <transition name="fade-slide">
      <div
        v-if="mobileMenuOpen"
        class="position-fixed bg-dark border rounded shadow-lg p-2 d-lg-none"
        style="top: 60px; left: 10px; z-index: 1999; width: 200px;"
      >
        <RouterLink
          v-for="item in navLinks"
          :key="item.label"
          :to="item.path"
          class="dropdown-item text-white py-2"
          style="background-color: transparent;"
          @click="mobileMenuOpen = false"
        >
          <img
            :src="item.img"
            alt="icon"
            width="25"
            height="25"
            class="me-2"
          />
          {{ item.label }}
        </RouterLink>

        <hr class="my-2 text-secondary" />

        <RouterLink
          to="/TestDashboard/settings"
          class="dropdown-item text-white py-2"
          @click="mobileMenuOpen = false"
        >
          <img :src="settingsIcon" alt="settings" width="25" height="25" class="me-2" />
          Settings
        </RouterLink>

        <div
          class="dropdown-item py-2 text-danger"
          role="button"
          @click="logout"
        >
          <img :src="logoutIcon" alt="logout" width="25" height="25" class="me-2" />
          Logout
        </div>
      </div>
    </transition>

    <!-- MAIN CONTENT -->
    <main
      class="p-4 bg-light"
      style="min-height: 100vh; transition: margin-left 0.3s ease;"
      :style="{ marginLeft: isCollapsed ? '90px' : '250px' }"
    >
      <RouterView />
    </main>
  </div>
</template>

<script>
import { ref } from "vue";
import { useLogout } from "@/composables/useLogout";

// Assets
import logo from "@/assets/cpc-logo.jpg";
import brandIcon from "@/assets/hamburger.png";
import dashboardIcon from "@/assets/dashboard@2x.png";
import lockerIcon from "@/assets/locker.png";
import assetsIcon from "@/assets/groups.png";
import reservationIcon from "@/assets/reservation.png";
import userIcon from "@/assets/user.png";
import auditlogIcon from "@/assets/auditlog.png";
import supportIcon from "@/assets/contactus.png";
import settingsIcon from "@/assets/settings.png";
import logoutIcon from "@/assets/logout.png";

export default {
  setup() {
    const isCollapsed = ref(true); // Start collapsed by default
    const mobileMenuOpen = ref(false);
    const { logout } = useLogout();

    // ✅ Only logo opens sidebar
    const openSidebar = () => {
      if (isCollapsed.value) isCollapsed.value = false;
    };

    // ✅ Only collapse button closes sidebar
    const closeSidebar = () => {
      if (!isCollapsed.value) isCollapsed.value = true;
    };

    const toggleMobileMenu = () => (mobileMenuOpen.value = !mobileMenuOpen.value);

    const navLinks = [
      { label: "Dashboard", path: "/TestDashboard/admin-dashboard", img: dashboardIcon },
      { label: "LockerPage", path: "/TestDashboard/lockerpage", img: lockerIcon },
      { label: "Rental Status", path: "/TestDashboard/rentalstatus", img: assetsIcon },
      { label: "Reservation", path: "/TestDashboard/reservationstatus", img: reservationIcon },
      { label: "User", path: "/TestDashboard/user", img: userIcon },
      { label: "Audit Logs", path: "/TestDashboard/audit", img: auditlogIcon },
      { label: "Support", path: "/TestDashboard/support", img: supportIcon },
    ];

    return {
      logo,
      brandIcon,
      isCollapsed,
      mobileMenuOpen,
      navLinks,
      settingsIcon,
      logoutIcon,
      openSidebar,
      closeSidebar,
      toggleMobileMenu,
      logout,
    };
  },
};
</script>

<style scoped>
main {
  transition: margin-left 0.3s ease;
}

/* Sidebar floats on desktop */
@media (min-width: 1100px) {
  main {
    margin-left: 0 !important;
  }
}

/* Mobile layout adjustments */
@media (max-width: 1099px) {
  main {
    margin-left: 0 !important;
    padding-top: 70px;
  }
}

/* Transition effect */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Collapse button animation */
.collapse-btn {
  transition: opacity 0.3s;
  cursor: pointer;
}
</style>