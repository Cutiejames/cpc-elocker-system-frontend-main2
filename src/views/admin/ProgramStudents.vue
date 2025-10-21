<template>
  <div class="container py-4">
    <button class="btn btn-outline-primary mb-3" @click="$router.back()">
      <i class="bi bi-arrow-left me-2"></i> Back
    </button>

    <h2 class="fw-bold text-primary mb-4">Students in {{ courseName }}</h2>

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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="student in students" :key="student.user_id">
            <td>{{ student.username }}</td>
            <td>{{ student.stud_id }}</td>
            <td>{{ student.f_name }} {{ student.m_name }} {{ student.l_name }}</td>
            <td>{{ student.gender }}</td>
            <td>{{ student.email }}</td>
            <td>{{ student.role }}</td>
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
          <tr v-if="students.length === 0">
            <td colspan="7" class="text-muted fst-italic py-4">
              No students found for this course
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
    };
  },
  mounted() {
    this.courseId = this.$route.params.id;
    this.courseName = this.$route.query.name || "";
    this.fetchStudents();
  },
  methods: {
    async fetchStudents() {
      try {
        const res = await axios.get(`http://localhost:3001/students?course_id=${this.courseId}`);
        this.students = res.data;
      } catch (err) {
        console.error("Error fetching students:", err);
      }
    },

    async disableAccount(student) {
      if (!confirm(`Disable account for ${student.username}?`)) return;
      try {
        const res = await axios.put(`http://localhost:3001/users/${student.user_id}/disable`);
        alert(res.data.message || "Account disabled successfully");
        this.fetchStudents();
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.error || "Failed to disable account.");
      }
    },

    async enableAccount(student) {
      if (!confirm(`Enable account for ${student.username}?`)) return;
      try {
        const res = await axios.put(`http://localhost:3001/users/${student.user_id}/enable`);
        alert(res.data.message || "Account enabled successfully");
        this.fetchStudents();
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.error || "Failed to enable account.");
      }
    },

    openResetPasswordModal(student) {
  this.selectedStudent = student;
  this.newPassword = "";
  const modalEl = document.getElementById("resetPasswordModal");
  this.resetPasswordModal = new bootstrap.Modal(modalEl);

  // Clear password when modal closes
  modalEl.addEventListener('hidden.bs.modal', () => {
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
    const res = await axios.post("http://localhost:3001/reset-password", {
  user_id: this.selectedStudent.user_id,
  new_password: this.newPassword
});
    alert(res.data.message || "Password reset successfully!");
    this.resetPasswordModal.hide();
    this.fetchStudents();
  } catch (err) {
    console.error(err);
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
</style>
