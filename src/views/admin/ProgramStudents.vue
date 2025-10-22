<template>
  <div class="container py-4">
    <!-- Back Button -->
    <button class="btn btn-outline-primary mb-3" @click="$router.back()">
      <i class="bi bi-arrow-left me-2"></i> Back
    </button>

    <!-- Header and Search Bar -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="fw-bold text-primary mb-0">Students in {{ courseName }}</h2>

      <!-- Search Bar -->
      <div class="input-group input-group-sm w-auto">
        <span class="input-group-text bg-primary text-white">
          <i class="bi bi-search"></i>
        </span>
        <input
          type="text"
          class="form-control"
          v-model="searchQuery"
          placeholder="Search..."
          style="max-width: 200px;"
        />
      </div>
    </div>

    <!-- Student Table -->
    <div class="table-container shadow-lg bg-white rounded-4 p-3">
      <table class="table table-hover align-middle text-center mb-0">
        <thead>
          <tr>
            <th>Username</th>
            <th>Student ID</th>
            <th>Full Name</th>
            <th>Gender</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="student in filteredStudents" :key="student.user_id">
            <td>{{ student.username }}</td>
            <td>{{ student.stud_id }}</td>
            <td>{{ student.f_name }} {{ student.m_name }} {{ student.l_name }}</td>
            <td>{{ student.gender }}</td>
            <td>{{ student.email }}</td>
            <td>{{ student.role }}</td>
            <td>
              <span
                class="badge"
                :class="student.status === 'active' ? 'bg-success' : 'bg-secondary'"
              >
                {{ student.status }}
              </span>
            </td>
            <td>
              <div class="d-flex gap-2 justify-content-center">
                <button
                  class="btn btn-sm btn-warning"
                  :disabled="student.status === 'disabled'"
                  @click="disableAccount(student)"
                >
                  Disable
                </button>

                <button
                  class="btn btn-sm btn-success"
                  :disabled="student.status === 'active'"
                  @click="enableAccount(student)"
                >
                  Enable
                </button>

                <button
                  class="btn btn-sm btn-primary"
                  @click="openResetPasswordModal(student)"
                >
                  Reset Password
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="filteredStudents.length === 0">
            <td colspan="8" class="text-muted fst-italic py-4">
              No matching students found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Reset Password Modal -->
    <div class="modal fade" id="resetPasswordModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Reset Password for {{ selectedStudent.username }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <input
              type="password"
              v-model="newPassword"
              class="form-control"
              placeholder="Enter new password"
            />
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button class="btn btn-primary" @click="submitResetPassword">Reset</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import bootstrap from "bootstrap/dist/js/bootstrap.bundle";

export default {
  name: "ProgramStudents",
  data() {
    return {
      students: [],
      courseId: null,
      courseName: "",
      selectedStudent: {},
      newPassword: "",
      resetPasswordModal: null,
      searchQuery: "",
    };
  },
  mounted() {
    this.courseId = this.$route.params.id;
    this.courseName = this.$route.query.name || "";
    this.fetchStudents();
  },
  computed: {
    filteredStudents() {
      if (!this.searchQuery.trim()) return this.students;
      const query = this.searchQuery.toLowerCase();
      return this.students.filter((student) => {
        const fullName = `${student.f_name} ${student.m_name} ${student.l_name}`.toLowerCase();
        const studentId = student.stud_id ? student.stud_id.toString().toLowerCase() : "";
        return fullName.includes(query) || studentId.includes(query);
      });
    },
  },
  methods: {
    async fetchStudents() {
      try {
        const res = await axios.get(
          `http://localhost:3001/students?course_id=${this.courseId}`
        );
        this.students = res.data;
      } catch (err) {
        console.error("Error fetching students:", err);
      }
    },

    async disableAccount(student) {
      if (!confirm(`Disable account for ${student.username}?`)) return;
      try {
        const token = localStorage.getItem("token");
        const res = await axios.put(
          `http://localhost:3001/users/${student.user_id}/disable`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert(res.data.message || "Account disabled successfully");
        this.fetchStudents();
      } catch (err) {
        console.error("Error disabling account:", err);
        alert(err.response?.data?.error || "Failed to disable account.");
      }
    },

    async enableAccount(student) {
      if (!confirm(`Enable account for ${student.username}?`)) return;
      try {
        const token = localStorage.getItem("token");
        const res = await axios.put(
          `http://localhost:3001/users/${student.user_id}/enable`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert(res.data.message || "Account enabled successfully");
        this.fetchStudents();
      } catch (err) {
        console.error("Error enabling account:", err);
        alert(err.response?.data?.error || "Failed to enable account.");
      }
    },

    openResetPasswordModal(student) {
      this.selectedStudent = student;
      this.newPassword = "";
      const modalEl = document.getElementById("resetPasswordModal");
      this.resetPasswordModal = new bootstrap.Modal(modalEl);
      modalEl.addEventListener("hidden.bs.modal", () => {
        this.newPassword = "";
      }, { once: true });
      this.resetPasswordModal.show();
    },

    async submitResetPassword() {
      if (!this.newPassword) {
        alert("Password cannot be empty!");
        return;
      }
      if (this.newPassword.length < 6) {
        alert("Password must be at least 6 characters long");
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const res = await axios.post(
          "http://localhost:3001/users/reset-password",
          {
            user_id: this.selectedStudent.user_id,
            new_password: this.newPassword,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        alert(res.data.message || "Password reset successfully!");
        this.resetPasswordModal.hide();
        this.fetchStudents();
      } catch (err) {
        console.error("Error resetting password:", err);
        alert(err.response?.data?.error || "Failed to reset password.");
      }
    },
  },
};
</script>

<style scoped>
.table-container {
  max-height: 600px;
  overflow-y: auto;
  border-radius: 15px;
}
tbody tr:hover {
  background-color: #f0f8ff;
}
.btn-sm {
  padding: 5px 10px;
  font-size: 0.8rem;
}
.badge {
  font-size: 0.85rem;
  padding: 6px 10px;
}
.input-group-sm input {
  font-size: 0.85rem;
  padding: 4px 8px;
}
</style>
