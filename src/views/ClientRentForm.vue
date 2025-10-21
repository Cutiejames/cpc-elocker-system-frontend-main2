<template>
  <div class="d-flex justify-content-center align-items-center vh-100 bg-light">
    <div class="card shadow-lg p-4" style="max-width: 500px; width: 100%; border-radius: 15px;">
      <!-- Locker Icon + Number -->
      <div class="text-center mb-3">
        <i class="bi bi-locker fs-1"></i>
        <h5 class="mt-2 fw-semibold">{{ lockerNumber }}</h5>
      </div>

      <hr />

      <!-- Form Fields -->
      <form @submit.prevent="submitForm">
        <div class="mb-3 d-flex align-items-center">
          <label class="me-2 fw-semibold" style="width: 130px;">Student ID:</label>
          <input
            v-model="form.studentId"
            type="text"
            placeholder="Student ID..."
            class="form-control fst-italic"
            required
          />
        </div>

        <div class="mb-3 d-flex align-items-center">
          <label class="me-2 fw-semibold" style="width: 130px;">Student Name:</label>
          <input
            v-model="form.studentName"
            type="text"
            placeholder="Full Name..."
            class="form-control fst-italic"
            required
          />
        </div>

        <div class="mb-3 d-flex align-items-center">
          <label class="me-2 fw-semibold" style="width: 130px;">Course:</label>
          <input
            v-model="form.course"
            type="text"
            placeholder="Course..."
            class="form-control fst-italic"
            required
          />
        </div>

        <div class="mb-3 d-flex align-items-center">
          <label class="me-2 fw-semibold" style="width: 130px;">Email:</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="Email..."
            class="form-control fst-italic"
            required
          />
        </div>

        <div class="mb-3 d-flex align-items-center">
          <label class="me-2 fw-semibold" style="width: 130px;">Rental Start:</label>
          <input
            v-model="form.rentalStart"
            type="date"
            class="form-control"
            required
          />
        </div>

        <div class="mb-3 d-flex align-items-center">
          <label class="me-2 fw-semibold" style="width: 130px;">Rental End:</label>
          <input
            v-model="form.rentalEnd"
            type="date"
            class="form-control"
            required
          />
        </div>

        <!-- Buttons -->
        <div class="d-flex justify-content-end gap-2">
          <button type="button" class="btn btn-danger px-4" @click="handleCancel">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary px-4">
            Submit
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "ClientRentForm",
  props: {
    id: String,
    lockerNumber: String,
    status: String,
  },
  data() {
    return {
      form: {
        lockerNumber: this.lockerNumber || "Unknown",
        studentId: "",
        studentName: "",
        course: "",
        email: "",
        rentalStart: new Date().toISOString().slice(0, 10),
        rentalEnd: "",
      },
    };
  },
  methods: {
    handleCancel() {
      // Return to client locker page
      this.$router.push({ name: "UserLocker" });
    },
    async submitForm() {
      try {
        const payload = {
          locker_id: this.id,
          locker_number: this.form.lockerNumber,
          student_id: this.form.studentId,
          student_name: this.form.studentName,
          course: this.form.course,
          email: this.form.email,
          rental_start: this.form.rentalStart,
          rental_end: this.form.rentalEnd,
        };

        // ✅ Example API endpoint
        await axios.post("http://localhost:3001/client/rent", payload);

        alert(`✅ Locker ${this.form.lockerNumber} rented successfully!`);
        this.$router.push({ name: "UserLocker" });
      } catch (error) {
        console.error(error);
        alert("❌ Failed to submit rental form. Please try again.");
      }
    },
  },
};
</script>

<style scoped>
.card {
  border: none;
}
</style>
