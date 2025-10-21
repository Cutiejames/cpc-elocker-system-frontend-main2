<template>
  <div class="d-flex justify-content-center align-items-center vh-100 bg-light">
    <div
      class="card shadow-lg p-4"
      style="max-width: 500px; width: 100%; border-radius: 15px;"
    >
      <!-- Locker Icon + Number -->
      <div class="text-center mb-3">
        <i class="bi bi-lock fs-1"></i>
        <h5 class="mt-2 fw-semibold">Locker {{ lockerNumber }}</h5>
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
          <button
            type="button"
            class="btn btn-danger px-4"
            @click="handleCancel"
          >
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

<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const lockerNumber = route.query.number || "Unknown";

const form = ref({
  lockerNumber,
  studentId: "",
  studentName: "",
  course: "",
  email: "",
  rentalStart: new Date().toISOString().slice(0, 10),
  rentalEnd: "",
});

const handleCancel = () => {
  router.push({ name: "LockerPage" });
};

const submitForm = () => {
  console.log("Rental Form Data:", form.value);

  alert(
    `✅ Locker ${form.value.lockerNumber} rented successfully!\n\n` +
      `Student: ${form.value.studentName}\nCourse: ${form.value.course}\nStart: ${form.value.rentalStart}\nEnd: ${form.value.rentalEnd}`
  );

  router.push({ name: "LockerPage" });
};
</script>

<style scoped>
.card {
  border: none;
}
button {
  transition: all 0.3s ease;
}
button:hover {
  opacity: 0.9;
}
</style>
