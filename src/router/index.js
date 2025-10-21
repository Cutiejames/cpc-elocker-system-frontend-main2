import { createRouter, createWebHistory } from "vue-router";
import 'bootstrap-icons/font/bootstrap-icons.css';

// ✅ User components
import DashboardPage from "../layouts/DashboardPage.vue";
import CreateAccount from '../views/CreateAccount.vue';
import LoginPage from "../views/LoginPage.vue";
import SettingProfile from "../views/SettingProfile.vue";
import SupportPage from "../views/SupportPage.vue";
import RentalStatus from "../views/RentalStatus.vue";
import ClientLocker from "../views/ClientLocker.vue";
import ClientRentForm from "../views/ClientRentForm.vue";

// ✅ Admin components
import TestDashboard from "../layouts/TestDashboard.vue";
import AdminSupportPage from "../views/admin/AdminSupportPage.vue";
import AuditLogsPage from "../views/admin/AuditLogsPage.vue";
import ReservationStatusPage from "../views/admin/ReservationStatusPage.vue";
import LockerPage from "../views/admin/LockerPage.vue";
import RentalStatusPage from "../views/admin/RentalStatusPage.vue";
import AdminProfile from "../views/admin/AdminProfile.vue";
import UserPage from "../views/admin/UserPage.vue";
import AdminDashboard from "../views/admin/AdminDashboard.vue";
import LockerRentForm from "../views/admin/LockerRentForm.vue";
import ProgramStudents from "../views/admin/ProgramStudents.vue";

const routes = [
  // ✅ Login
  { path: "/login", name: "Login", component: LoginPage },
  { path: "/create-account", name: "CreateAccount", component: CreateAccount },
  { path: "/", redirect: "/login" },

  // ✅ User dashboard layout
  {
    path: "/dashboard",
    component: DashboardPage,
    meta: { requiresAuth: true, role: "client" },
    children: [
      { path: "user-settings", name: "UserSettings", component: SettingProfile },
      { path: "user-support", name: "UserSupport", component: SupportPage },
      { path: "user-rental", name: "UserRental", component: RentalStatus },
      { path: "user-locker", name: "UserLocker", component: ClientLocker },
      {
        path: "user-locker-rent/:id",
        name: "ClientRentForm",
        component: ClientRentForm,
        props: (route) => ({
          id: route.params.id,
          lockerNumber: route.query.number,
          status: route.query.status,
        }),
      },
    ],
  },

  // ✅ Admin dashboard layout
  {
    path: "/TestDashboard",
    component: TestDashboard,
    meta: { requiresAuth: true, role: "admin" },
    children: [
      { path: "settings", name: "AdminSettings", component: AdminProfile },
      { path: "lockerpage", name: "LockerPage", component: LockerPage },
      { path: "rentalstatus", name: "RentalStatusPage", component: RentalStatusPage },
      { path: "reservationstatus", name: "ReservationStatusPage", component: ReservationStatusPage },
      { path: "user", name: "UserPage", component: UserPage },
      { path: "audit", name: "AuditLogsPage", component: AuditLogsPage },
      { path: "support", name: "AdminSupportPage", component: AdminSupportPage },
      { path: "admin-dashboard", name: "AdminDashboard", component: AdminDashboard },
      {
        path: "locker-rent/:id",
        name: "LockerRentForm",
        component: LockerRentForm,
        props: (route) => ({
          id: route.params.id,
          lockerNumber: route.query.number,
          status: route.query.status,
        }),
      },
      // ✅ Added ProgramStudents route
      {
        path: "program-students/:id",
        name: "ProgramStudents",
        component: ProgramStudents,
        props: (route) => ({
          id: route.params.id,
          courseName: route.query.name,
          acronym: route.query.acronym,
        }),
      },
    ],
  },

  // ✅ 404 Fallback
  {
    path: "/:catchAll(.*)",
    name: "NotFound",
    component: {
      template: `
        <div class="d-flex flex-column justify-content-center align-items-center vh-100 text-center">
          <h1 class="display-4 fw-bold">404 - Page Not Found</h1>
          <p class="text-muted">The page you're looking for doesn't exist.</p>
          <router-link to="/login" class="btn btn-primary mt-3">Go to Login</router-link>
        </div>
      `,
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ✅ Auth Guard
// router.beforeEach((to, from, next) => {
//   const token = localStorage.getItem("authToken");
//   const userRole = localStorage.getItem("userRole")?.toLowerCase(); // normalize case

//   // if route requires login but user has no token
//   if (to.meta.requiresAuth && !token) {
//     return next({ name: "Login" });
//   }

//   // if logged in but wrong role for route
//   if (to.meta.role && to.meta.role.toLowerCase() !== userRole) {
//     return next({ name: "Login" });
//   }

//   // if already logged in and tries to visit login or create-account
//   if ((to.name === "Login" || to.name === "CreateAccount") && token) {
//     if (userRole === "admin") {
//       return next("/TestDashboard/admin-dashboard");
//     } else if (userRole === "student" || userRole === "client") {
//       return next("/dashboard/user-locker");
//     }
//   }

//   return next();
// });

export default router;