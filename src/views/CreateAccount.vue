<template>
  <div class="d-flex vh-100 justify-content-center align-items-center bg-light">
    <div class="card shadow p-4" style="width: 800px; max-width: 90%;">
      <h3 class="text-center mb-4">create account</h3>

      <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
      <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>

      <form @submit.prevent="createAccount">
        <div class="row">
          <!-- left column -->
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label fw-semibold">student id</label>
              <input v-model="stud_id" type="text" class="form-control" required />
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold">first name</label>
              <input v-model="f_name" type="text" class="form-control" required />
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold">middle name</label>
              <input v-model="m_name" type="text" class="form-control" />
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold">last name</label>
              <input v-model="l_name" type="text" class="form-control" required />
            </div>
          </div>

          <!-- right column -->
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label fw-semibold">gender</label>
              <select v-model="gender" class="form-select" required>
                <option disabled value="">select gender</option>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold">course</label>
              <select v-model="course" class="form-select" required>
                <option disabled value="">select course</option>
                <option v-for="c in courses" :key="c.course_id" :value="c.course_id">
                  {{ c.course_name }}
                </option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold">email</label>
              <input v-model="email" type="email" class="form-control" required />
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold">username</label>
              <input v-model="username" type="text" class="form-control" required />
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold">password</label>
              <input v-model="password" type="password" class="form-control" required />
            </div>
          </div>
        </div>

        <div class="mt-3">
          <button
            type="submit"
            class="btn w-100 text-white"
            style="background-color: #3a73f1;"
            :disabled="isLoading"
          >
            <span
              v-if="isLoading"
              class="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>
            {{ isLoading ? "CREATING..." : "CREATE ACCOUNT" }}
          </button>

          <p class="text-center mt-3">
            already have an account?
            <a href="#" @click.prevent="goBackToLogin" style="color: #3a73f1; font-weight: 600;">sign in</a>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();

const username = ref("");
const password = ref("");
const stud_id = ref("");
const f_name = ref("");
const m_name = ref("");
const l_name = ref("");
const gender = ref("");
const course = ref("");
const email = ref("");

const courses = ref([]);
const isLoading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const API_BASE_URL = "http://localhost:3001";

// ✅ fetch courses from backend
const fetchCourses = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/courses`);
    if (response.data && Array.isArray(response.data)) {
      courses.value = response.data;
    }
  } catch (error) {
    console.error("error fetching courses:", error);
  }
};

// ✅ create account logic
const createAccount = async () => {
  errorMessage.value = "";
  successMessage.value = "";
  isLoading.value = true;

  try {
    const response = await axios.post(`${API_BASE_URL}/create-account`, {
      username: username.value.trim(),
      password: password.value,
      stud_id: stud_id.value.trim(),
      f_name: f_name.value.trim(),
      m_name: m_name.value.trim(),
      l_name: l_name.value.trim(),
      gender: gender.value,
      course: course.value,
      email: email.value.trim(),
    });

    if (response.data && !response.data.error) {
      successMessage.value = "account created successfully! redirecting to login...";
      setTimeout(() => {
        router.push("/login");
        window.location.reload(); // refresh after redirect
      }, 2000);
    } else {
      errorMessage.value = response.data.error || "failed to create account.";
    }
  } catch (error) {
    console.error(error);
    if (error.response && error.response.data && error.response.data.error) {
      errorMessage.value = error.response.data.error;
    } else {
      errorMessage.value = "network or server error. please try again.";
    }
  } finally {
    isLoading.value = false;
  }
};

const goBackToLogin = () => {
  router.push("/login");
};

onMounted(() => {
  fetchCourses();
});
</script>

<style scoped>
.card {
  border-radius: 20px;
}
.form-label {
  text-transform: uppercase;
  font-size: 0.85rem;
  color: #333;
}
</style>