<template>
  <div class="d-flex vh-100">
    <!-- Left side -->
    <div
      class="d-flex flex-column justify-content-center align-items-center text-white text-center"
      style="background-color: #000020; width: 50%"
    >
      <img
        src="@/assets/cpc-logo.jpg"
        alt="CPC Logo"
        class="mb-4"
        style="max-width: 200px"
      />
      <h1 class="fw-bold">
        WELCOME
        <br />
        TO
        <br />
        CPC E-LOCKER
      </h1>
    </div>

    <!-- Right side -->
    <div class="d-flex flex-column justify-content-center align-items-center flex-fill px-4">
      <form class="w-100" style="max-width: 400px" @submit.prevent="signIn">
        <!-- Error message display -->
        <div v-if="errorMessage" class="alert alert-danger mb-3" role="alert">
          {{ errorMessage }}
        </div>

        <!-- Success message display -->
        <div v-if="successMessage" class="alert alert-success mb-3" role="alert">
          {{ successMessage }}
        </div>

        <div class="mb-3">
          <label class="form-label fw-semibold" for="studentId">USERNAME:</label>
          <input
            id="studentId"
            type="text"
            class="form-control"
            v-model="studentId"
            placeholder="Enter Username"
            required
            :disabled="isLoading"
          />
        </div>

        <div class="mb-4">
          <label class="form-label fw-semibold" for="password">PASSWORD:</label>
          <input
            id="password"
            type="password"
            class="form-control"
            v-model="password"
            placeholder="Enter Password"
            required
            :disabled="isLoading"
          />
        </div>

        <button
          type="submit"
          class="btn w-100 text-white mb-3"
          style="background-color: #3a73f1"
          :disabled="isLoading"
        >
          <span
            v-if="isLoading"
            class="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>
          {{ isLoading ? "SIGNING IN..." : "SIGN IN" }}
        </button>
        <p class="text-center mt-2">
          don’t have an account?
          <a href="#" @click.prevent="goToSignUp" style="color: #3a73f1; font-weight: 600;">sign up</a>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();
const studentId = ref("");
const password = ref("");
const isLoading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const API_BASE_URL = "http://localhost:3001";

// LOGIN FUNCTION
const signIn = async () => {
  errorMessage.value = "";
  successMessage.value = "";

  if (!studentId.value.trim()) {
    errorMessage.value = "Please enter your Student ID";
    return;
  }
  if (!password.value.trim()) {
    errorMessage.value = "Please enter your password";
    return;
  }

  isLoading.value = true;
  try {
    const response = await axios.post(
      `${API_BASE_URL}/login`,
      {
        username: studentId.value.trim(),
        password: password.value,
      },
      { headers: { "Content-Type": "application/json" }, timeout: 10000 }
    );

    if (response.data && response.data.token) {
      const { token, user, role } = response.data;

      // Store token, user, role, and userId
      localStorage.setItem("authToken", token);
      localStorage.setItem("userData", JSON.stringify(user));
      localStorage.setItem("userRole", role);
      localStorage.setItem("userId", user.user_id); // <-- Save userId separately for easy access

      successMessage.value = "Login successful! Redirecting...";

      setTimeout(() => {
        if (role.toLowerCase() === "admin") {
          router.push("/TestDashboard/admin-dashboard");
        } else {
          router.push("/dashboard/user-locker");
        }
      }, 1500);
    }
  } catch (error) {
    if (error.response) {
      const statusCode = error.response.status;
      const errorData = error.response.data;
      if (statusCode === 401) {
        errorMessage.value = errorData.error || "Invalid username or password";
      } else if (statusCode === 500) {
        errorMessage.value = "Server error. Please try again later.";
      } else {
        errorMessage.value = errorData.error || "Login failed. Please try again.";
      }
    } else if (error.request) {
      errorMessage.value = "Network error. Please check your connection and try again.";
    } else {
      errorMessage.value = "An unexpected error occurred. Please try again.";
    }
  } finally {
    isLoading.value = false;
  }
};

const goToSignUp = () => {
  router.push("/create-account");
};

// AUTO-REDIRECT IF ALREADY LOGGED IN
// const checkAuthStatus = () => {
//   const token = localStorage.getItem("authToken");
//   if (token) {
//     const userRole = localStorage.getItem("userRole");
//     if (userRole === "admin") {
//       router.push("/TestDashboard/admin-dashboard");
//     } else {
//       router.push("/dashboard/user-locker");
//     }
//   }
// };

// checkAuthStatus();
</script>