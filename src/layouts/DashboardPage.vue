<template>
  <div>
    <!-- FLOATING SIDEBAR (Desktop Only) -->
    <aside
      class="bg-dark text-white p-3 position-fixed top-0 start-0 h-100 d-none d-lg-flex flex-column"
      :style="{
        width: isCollapsed ? '90px' : '250px',
        transition: 'width 0.3s ease',
        zIndex: 1050,
        boxShadow: '0 0 15px rgba(0,0,0,0.3)',
      }"
    >
      <!-- Brand Header -->
      <div
        class="d-flex align-items-center justify-content-between mb-4"
        :class="{ 'flex-column': isCollapsed }"
      >
        <!-- Logo + Text -->
        <div
          class="d-flex align-items-center justify-content-center w-100"
          style="gap: 8px"
        >
          <img
            :src="logo"
            alt="Logo"
            class="rounded-circle"
            width="50"
            height="50"
            role="button"
            title="Open Sidebar"
            :style="{ cursor: isCollapsed ? 'pointer' : 'default' }"
            @click="isCollapsed ? openSidebar() : null"
          />
          <span
            v-if="!isCollapsed"
            class="fw-bold"
            style="font-size: 18px;"
          >
            CPC E-Locker
          </span>
        </div>

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
          style="cursor: pointer;"
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
    </aside>

    <!-- FLOATING MENU BUTTON (Mobile Only) -->
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

    <!-- FLOATING MOBILE MENU -->
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
          to="/dashboard/user-settings"
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
    <main class="p-4 bg-light position-relative" style="min-height: 100vh;">
      <!-- 🔔 Notification Bell -->
      <div class="position-absolute top-0 end-0 mt-3 me-4">
        <div class="position-relative">
          <img
            :src="notifIcon"
            alt="Notifications"
            width="35"
            height="35"
            role="button"
            @click="toggleNotifications"
          />
          <span
            v-if="unreadCount > 0"
            class="badge bg-danger position-absolute top-0 start-100 translate-middle rounded-pill"
            style="font-size: 0.7rem"
          >
            {{ unreadCount }}
          </span>
        </div>

        <!-- Notification Dropdown -->
        <div
          v-if="showNotifications"
          class="card shadow-sm position-absolute end-0 mt-2"
          style="width: 320px; z-index: 1050;"
        >
          <div class="card-header d-flex justify-content-between align-items-center">
            <span class="fw-bold">Notifications</span>
            <button class="btn btn-sm btn-outline-primary" @click="markAllRead">Mark all as read</button>
          </div>

          <ul class="list-group list-group-flush">
            <li
              v-for="notif in notifications"
              :key="notif.notif_id"
              class="list-group-item small"
              :class="{ 'bg-light': notif.is_read === 1 }"
              role="button"
              @click="markRead(notif.notif_id)"
            >
              <div>{{ notif.message }}</div>
              <div class="text-muted small">{{ formatDate(notif.created_at) }}</div>
            </li>
            <li v-if="notifications.length === 0" class="list-group-item text-center text-muted">
              No notifications
            </li>
          </ul>
        </div>
      </div>

      <RouterView />
    </main>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useLogout } from "@/composables/useLogout";

// Assets
import logo from "@/assets/cpc-logo.jpg";
import brandIcon from "@/assets/hamburger.png";
import lockerIcon from "@/assets/locker.png";
import rentalIcon from "@/assets/rentalstatus.png";
import supportIcon from "@/assets/contactus.png";
import settingsIcon from "@/assets/settings.png";
import logoutIcon from "@/assets/logout.png";
import notifIcon from "@/assets/notification.png";

export default {
  setup() {
    const isCollapsed = ref(true);
    const mobileMenuOpen = ref(false);
    const showNotifications = ref(false);
    const notifications = ref([]);
    const unreadCount = ref(0);
    const { logout } = useLogout();

    const API_BASE = "http://localhost:3001";

    const openSidebar = () => (isCollapsed.value = false);
    const closeSidebar = () => (isCollapsed.value = true);
    const toggleMobileMenu = () => (mobileMenuOpen.value = !mobileMenuOpen.value);
    const toggleNotifications = () => (showNotifications.value = !showNotifications.value);

    // 🔔 Fetch notifications
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${API_BASE}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        notifications.value = data;
        unreadCount.value = data.filter((n) => n.is_read === 0).length;
      } catch (err) {
        console.error("❌ Error fetching notifications:", err);
      }
    };

    // 🔔 Mark one as read
    const markRead = async (notif_id) => {
      try {
        const token = localStorage.getItem("token");
        await axios.put(`${API_BASE}/notifications/${notif_id}/read`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        await fetchNotifications();
      } catch (err) {
        console.error("❌ Error marking notification as read:", err);
      }
    };

    // 🔔 Mark all as read
    const markAllRead = async () => {
      try {
        const token = localStorage.getItem("token");
        await axios.put(`${API_BASE}/notifications/read-all`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        await fetchNotifications();
      } catch (err) {
        console.error("❌ Error marking all notifications as read:", err);
      }
    };

    const formatDate = (dateString) => new Date(dateString).toLocaleString();

    const navLinks = [
      { label: "Locker", path: "/dashboard/user-locker", img: lockerIcon },
      { label: "Rental Status", path: "/dashboard/user-rental", img: rentalIcon },
      { label: "Support", path: "/dashboard/user-support", img: supportIcon },
    ];

    onMounted(fetchNotifications);

    return {
      logo,
      brandIcon,
      lockerIcon,
      rentalIcon,
      supportIcon,
      settingsIcon,
      logoutIcon,
      notifIcon,
      isCollapsed,
      mobileMenuOpen,
      navLinks,
      openSidebar,
      closeSidebar,
      toggleMobileMenu,
      logout,
      showNotifications,
      notifications,
      unreadCount,
      toggleNotifications,
      markRead,
      markAllRead,
      formatDate,
    };
  },
};
</script>

<style scoped>
main {
  transition: margin-left 0.3s ease;
}
.card {
  max-height: 400px;
  overflow-y: auto;
}
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
