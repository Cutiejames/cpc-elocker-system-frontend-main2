<template>
  <div class="container py-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="fw-bold text-primary">Programs</h2>
      <div class="d-flex gap-2">
        <button
          class="btn btn-primary d-flex align-items-center shadow-sm"
          @click="showAddStudent = true"
        >
          <i class="bi bi-person-plus me-2"></i> Add Student
        </button>
      </div>
    </div>

    <!-- Programs Grid -->
    <div class="row g-4 align-items-center">
      <!-- Courses will render here -->
      <template v-for="program in programs" :key="program.course_id">
        <div class="col-md-3">
          <div class="card shadow-sm h-100 text-center border-0">
            <div class="card-body">
              <img
                :src="getProgramLogo(program.acronym)"
                alt="logo"
                class="img-fluid mb-3"
                style="height: 80px"
              />
              <h5 class="fw-bold text-primary">
                {{ program.acronym || program.course_name }}
              </h5>
              <p class="text-muted small">{{ program.course_name }}</p>
              <button
                class="btn btn-outline-primary btn-sm rounded-pill px-3"
                @click="goToStudents(program)"
              >
                View Students
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- ✅ Add Course Button (fixed at the end) -->
      <div class="col-md-3 d-flex align-items-center justify-content-center">
        <img
          src="@/assets/add-button.png"
          alt="Add Course"
          style="width: 70px; height: 70px; cursor: pointer; transition: transform 0.2s;"
          @click="showAddCourse = true"
          @mouseover="hover = true"
          @mouseleave="hover = false"
          :style="{ transform: hover ? 'scale(1.1)' : 'scale(1)' }"
        />
      </div>
    </div>

    <!-- ================= ADD STUDENT MODAL ================= -->
    <div
      v-if="showAddStudent"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.4)"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content p-3">
          <div class="modal-header">
            <h5 class="modal-title fw-bold text-primary">Add New Student</h5>
            <button
              type="button"
              class="btn-close"
              @click="showAddStudent = false"
            ></button>
          </div>

          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Username:</label>
                <input
                  v-model="newStudent.username"
                  class="form-control"
                  placeholder="Enter username"
                />
              </div>
              <div class="col-md-6">
                <label class="form-label">Student ID:</label>
                <input
                  v-model="newStudent.stud_id"
                  class="form-control"
                  placeholder="Enter Student ID"
                />
              </div>

              <div class="col-md-4">
                <label class="form-label">First Name:</label>
                <input
                  v-model="newStudent.f_name"
                  class="form-control"
                  placeholder="First Name"
                />
              </div>
              <div class="col-md-4">
                <label class="form-label">Middle Name:</label>
                <input
                  v-model="newStudent.m_name"
                  class="form-control"
                  placeholder="Middle Name"
                />
              </div>
              <div class="col-md-4">
                <label class="form-label">Last Name:</label>
                <input
                  v-model="newStudent.l_name"
                  class="form-control"
                  placeholder="Last Name"
                />
              </div>

              <div class="col-md-6">
                <label class="form-label">Gender:</label>
                <select v-model="newStudent.gender" class="form-select">
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div class="col-md-6">
                <label class="form-label">Course:</label>
                <select v-model="newStudent.course_id" class="form-select">
                  <option value="">Select Course</option>
                  <option
                    v-for="course in programs"
                    :key="course.course_id"
                    :value="course.course_id"
                  >
                    {{ course.course_name }}
                  </option>
                </select>
              </div>

              <div class="col-md-6">
                <label class="form-label">Email:</label>
                <input
                  v-model="newStudent.email"
                  type="email"
                  class="form-control"
                  placeholder="example@gmail.com"
                />
              </div>

              <div class="col-md-6">
                <label class="form-label">Password:</label>
                <input
                  v-model="newStudent.password"
                  type="password"
                  class="form-control"
                  placeholder="Enter password"
                />
              </div>

              <div class="col-md-6">
                <label class="form-label">Role:</label>
                <select v-model="newStudent.role" class="form-select">
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showAddStudent = false">
              Cancel
            </button>
            <button class="btn btn-primary" @click="addStudent">
              Add User
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ================= ADD COURSE MODAL ================= -->
    <div
      v-if="showAddCourse"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0, 0, 0, 0.4)"
    >
      <div class="modal-dialog modal-md modal-dialog-centered">
        <div class="modal-content p-3">
          <div class="modal-header">
            <h5 class="modal-title fw-bold text-primary">Add New Course</h5>
            <button
              type="button"
              class="btn-close"
              @click="showAddCourse = false"
            ></button>
          </div>

          <div class="modal-body text-center">
            <img
              src="@/assets/logo.png"
              alt="Course Logo"
              style="height: 120px; width: 120px; object-fit: contain"
              class="mb-3"
            />
            <p class="text-muted small mb-4">Course Logo Placeholder</p>

            <div class="mb-3 text-start">
              <label class="form-label">Course Name:</label>
              <input
                v-model="newCourse.course_name"
                type="text"
                class="form-control"
                placeholder="Enter course name"
              />
            </div>

            <div class="mb-3 text-start">
              <label class="form-label">Acronym:</label>
              <input
                v-model="newCourse.acronym"
                type="text"
                class="form-control"
                placeholder="Enter course acronym"
              />
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showAddCourse = false">
              Cancel
            </button>
            <button class="btn btn-primary" @click="addCourse">
              Add Course
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import bsitLogo from "@/assets/BSIT.png";
import bshmLogo from "@/assets/BSHM.png";
import bsedLogo from "@/assets/BSED.png";
import beedLogo from "@/assets/BEED.png";
import defaultLogo from "@/assets/logo.png";

export default {
  name: "UserPage",
  data() {
    return {
      programs: [],
      showAddStudent: false,
      showAddCourse: false,
      hover: false,
      newStudent: {
        username: "",
        password: "",
        stud_id: "",
        f_name: "",
        m_name: "",
        l_name: "",
        gender: "",
        email: "",
        course_id: "",
        role: "student",
      },
      newCourse: {
        course_name: "",
        acronym: "",
      },
    };
  },
  mounted() {
    this.fetchPrograms();
  },
  methods: {
    async fetchPrograms() {
      try {
        const res = await axios.get("http://localhost:3001/courses");
        this.programs = res.data;
      } catch (err) {
        console.error("Error fetching programs:", err);
      }
    },
    getProgramLogo(acronym) {
      const logos = {
        BSIT: bsitLogo,
        BSHM: bshmLogo,
        BSED: bsedLogo,
        BEED: beedLogo,
      };
      return logos[acronym?.toUpperCase()] || defaultLogo;
    },
    goToStudents(program) {
      this.$router.push({
        name: "ProgramStudents",
        params: { id: program.course_id },
        query: { name: program.course_name, acronym: program.acronym },
      });
    },
    async addStudent() {
      try {
        const res = await axios.post(
          "http://localhost:3001/create-user",
          this.newStudent
        );
        alert(res.data.message || "Student added successfully!");
        this.showAddStudent = false;
        this.resetForm();
      } catch (err) {
        console.error("Error adding student:", err);
        alert(err.response?.data?.error || "Failed to add student.");
      }
    },
    async addCourse() {
      try {
        const res = await axios.post(
          "http://localhost:3001/courses",
          this.newCourse
        );
        alert(res.data.message || "Course added successfully!");
        this.showAddCourse = false;
        this.fetchPrograms();
        this.newCourse = { course_name: "", acronym: "" };
      } catch (err) {
        console.error("Error adding course:", err);
        alert(err.response?.data?.error || "Failed to add course.");
      }
    },
    resetForm() {
      this.newStudent = {
        username: "",
        password: "",
        stud_id: "",
        f_name: "",
        m_name: "",
        l_name: "",
        gender: "",
        email: "",
        course_id: "",
        role: "student",
      };
    },
  },
};
</script>

<style scoped>
.card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}
.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 10px rgba(13, 110, 253, 0.2);
}
.modal {
  z-index: 1050;
}
</style>
