<template>
  <div class="container py-4">
    <!-- Back Button -->
    <button class="btn btn-outline-primary mb-3" @click="$router.back()">
      <i class="bi bi-arrow-left me-2"></i> Back
    </button>

    <!-- Header and Search Bar: Stacks on mobile -->
    <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4">
      <h2 class="fw-bold text-primary mb-2 mb-sm-0">Students in {{ courseName }}</h2>

      <!-- Search Bar: Full width on mobile, auto width on larger screens -->
      <div class="input-group input-group-sm w-100 w-sm-auto">
        <span class="input-group-text bg-primary text-white rounded-start-pill">
          <i class="bi bi-search"></i>
        </span>
        <input
          type="text"
          class="form-control rounded-end-pill"
          v-model="searchQuery"
          placeholder="Search..."
          style="max-width: 250px;"
        />
      </div>
    </div>

    <!-- ------------------------------------------------------------------ -->
    <!-- 1. DESKTOP / TABLET VIEW (Above 1000px) - Standard Responsive Table -->
    <!-- ------------------------------------------------------------------ -->
    <div class="d-none students-table-view">
      <div class="table-responsive table-container shadow-lg bg-white rounded-4 p-3">
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
              <th style="min-width: 250px;">Actions</th>
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
                    @click="confirmAction('disable', student)"
                  >
                    Disable
                  </button>

                  <button
                    class="btn btn-sm btn-success"
                    :disabled="student.status === 'active'"
                    @click="confirmAction('enable', student)"
                  >
                    Enable
                  </button>

                  <button
                    class="btn btn-sm btn-primary"
                    @click="openResetPasswordModal(student)"
                  >
                    Reset
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
    </div>

    <!-- ------------------------------------------------------------------ -->
    <!-- 2. MOBILE CARD VIEW (1000px and below) - Clickable Cards -->
    <!-- ------------------------------------------------------------------ -->
    <div class="students-card-view mt-3">
      <div v-for="student in filteredStudents" :key="student.user_id" class="card shadow-sm mb-3 student-card" @click="toggleCard(student.user_id)">
        <div class="card-body p-3">
          <!-- Compact Header Row (Always visible) -->
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h6 class="mb-0 text-primary fw-bold">{{ student.f_name }} {{ student.l_name }}</h6>
              <small class="text-muted">ID: {{ student.stud_id }} | {{ student.username }}</small>
            </div>
            <span :class="student.status === 'active' ? 'bg-success' : 'bg-secondary'" class="badge rounded-pill align-self-center">
              {{ student.status }}
            </span>
          </div>

          <!-- Expanded Details (Toggled by click) -->
          <div v-if="expandedCardId === student.user_id" class="mt-3 pt-3 border-top">
            <ul class="list-unstyled small mb-3 text-start expanded-list">
              <li><i class="bi bi-envelope me-2 text-primary"></i>Email: <strong>{{ student.email }}</strong></li>
              <li><i class="bi bi-gender-ambiguous me-2 text-primary"></i>Gender: <strong>{{ student.gender }}</strong></li>
              <li><i class="bi bi-briefcase me-2 text-primary"></i>Role: <strong>{{ student.role }}</strong></li>
            </ul>

            <!-- Action Buttons (Full width, d-grid for stacking) -->
            <div class="d-grid gap-2">
              <button class="btn btn-warning btn-sm" :disabled="student.status === 'disabled'" @click.stop="confirmAction('disable', student)">
                <i class="bi bi-x-octagon me-1"></i> Disable Account
              </button>
              <button class="btn btn-success btn-sm" :disabled="student.status === 'active'" @click.stop="confirmAction('enable', student)">
                <i class="bi bi-check-circle me-1"></i> Enable Account
              </button>
              <button class="btn btn-primary btn-sm" @click.stop="openResetPasswordModal(student)">
                <i class="bi bi-key me-1"></i> Reset Password
              </button>
            </div>
          </div>
        </div>
      </div>
      <p v-if="filteredStudents.length === 0" class="text-muted fst-italic py-4 text-center">
        No matching students found.
      </p>
    </div>


    <!-- Reset Password Modal (Shared) -->
    <div class="modal fade" id="resetPasswordModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
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

    <!-- Message Modal (Shared) -->
    <div
      v-if="messageModal.show"
      class="modal fade show"
      style="display: block; background: rgba(0,0,0,0.5);"
      tabindex="-1"
      @click.self="closeMessageModal"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">{{ messageModal.title }}</h5>
            <button type="button" class="btn-close btn-close-white" @click="closeMessageModal"></button>
          </div>
          <div class="modal-body">
            <p>{{ messageModal.body }}</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" @click="closeMessageModal">OK</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Modal (Shared) -->
    <div
      v-if="confirmModal.show"
      class="modal fade show"
      style="display: block; background: rgba(0,0,0,0.5);"
      tabindex="-1"
      @click.self="closeConfirmModal"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-warning">
            <h5 class="modal-title text-dark">Confirm Action</h5>
            <button type="button" class="btn-close" @click="closeConfirmModal"></button>
          </div>
          <div class="modal-body">
            <p>{{ confirmModal.body }}</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeConfirmModal">Cancel</button>
            <button class="btn btn-primary" @click="confirmModal.onConfirm">Yes</button>
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
      // State to track the currently expanded card (used in mobile view)
      expandedCardId: null,
      messageModal: { show: false, title: "", body: "" },
      confirmModal: { show: false, body: "", onConfirm: null },
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
    // 💡 NEW HELPER METHOD for Mobile Card View
    toggleCard(studentId) {
      if (this.expandedCardId === studentId) {
        this.expandedCardId = null; // Close if already open
      } else {
        this.expandedCardId = studentId; // Open new card
      }
    },

    // ⛔ ALL FOLLOWING METHODS ARE UNCHANGED AS REQUESTED ⛔

    // ✅ Modal Helpers
    showMessage(title, body) {
      this.messageModal = { show: true, title, body };
    },
    closeMessageModal() {
      this.messageModal.show = false;
    },
    showConfirm(body, onConfirm) {
      this.confirmModal = { show: true, body, onConfirm };
    },
    closeConfirmModal() {
      this.confirmModal.show = false;
    },

    // ✅ Fetch Students
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

    // ✅ Confirm Action (Enable/Disable)
    confirmAction(type, student) {
      const actionText = type === "disable" ? "Disable" : "Enable";
      this.showConfirm(`${actionText} account for ${student.username}?`, async () => {
        this.closeConfirmModal();
        if (type === "disable") await this.disableAccount(student);
        else await this.enableAccount(student);
      });
    },

    // ✅ Disable Account
    async disableAccount(student) {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.put(
          `http://localhost:3001/users/${student.user_id}/disable`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.showMessage("Success", res.data.message || "Account disabled successfully");
        this.fetchStudents();
      } catch (err) {
        console.error("Error disabling account:", err);
        this.showMessage("Error", err.response?.data?.error || "Failed to disable account.");
      }
    },

    // ✅ Enable Account
    async enableAccount(student) {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.put(
          `http://localhost:3001/users/${student.user_id}/enable`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.showMessage("Success", res.data.message || "Account enabled successfully");
        this.fetchStudents();
      } catch (err) {
        console.error("Error enabling account:", err);
        this.showMessage("Error", err.response?.data?.error || "Failed to enable account.");
      }
    },

    // ✅ Reset Password Modal
    openResetPasswordModal(student) {
      this.selectedStudent = student;
      this.newPassword = "";
      const modalEl = document.getElementById("resetPasswordModal");
      this.resetPasswordModal = new bootstrap.Modal(modalEl);
      modalEl.addEventListener(
        "hidden.bs.modal",
        () => {
          this.newPassword = "";
        },
        { once: true }
      );
      this.resetPasswordModal.show();
    },

    // ✅ Submit Password Reset
    async submitResetPassword() {
      if (!this.newPassword) {
        this.showMessage("Warning", "Password cannot be empty!");
        return;
      }
      if (this.newPassword.length < 6) {
        this.showMessage("Warning", "Password must be at least 6 characters long");
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

        this.showMessage("Success", res.data.message || "Password reset successfully!");
        this.resetPasswordModal.hide();
        this.fetchStudents();
      } catch (err) {
        console.error("Error resetting password:", err);
        this.showMessage("Error", err.response?.data?.error || "Failed to reset password.");
      }
    },
  },
};
</script>

<style scoped>
/* Standard Table Styles */
.table-container {
  max-height: 600px;
  overflow-y: auto;
  border-radius: 15px;
}
tbody tr:hover {
  background-color: #f0f8ff;
}
.badge {
  font-size: 0.85rem;
  padding: 6px 10px;
}
/* Mobile Card Styles */
.student-card {
    cursor: pointer;
    border-radius: 12px;
    transition: transform 0.2s, box-shadow 0.2s;
    border-left: 5px solid #0d6efd; /* Highlight */
}
.student-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.expanded-list li {
    padding: 2px 0;
    font-size: 0.9rem;
}

/* 💡 Custom 1000px Breakpoint: Shows cards below 1000px, shows table above 1000px */
@media (min-width: 1000px) {
  /* Show Table View above 1000px (overrides d-none default) */
  .students-table-view {
    display: block !important;
  }
  /* Hide Card View above 1000px */
  .students-card-view {
    display: none !important;
  }
}
</style>
