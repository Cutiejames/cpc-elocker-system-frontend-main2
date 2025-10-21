<template>
  <div class="container py-4">
    <h2 class="text-center fw-bold mb-4 text-primary">RENT STATUS</h2>

    <!-- 🔍 Search + Sort Controls -->
    <div class="d-flex flex-wrap gap-3 mb-4 justify-content-center">
      <!-- Search -->
      <div class="input-group shadow-sm rounded" style="width: 320px">
        <input
          v-model="searchQuery"
          type="text"
          class="form-control border-0"
          placeholder="Search by Student ID, Name, or Course..."
          @keyup.enter="fetchRentals"
        />
        <button class="btn btn-primary shadow-sm" @click="fetchRentals">
          <i class="bi bi-search"></i>
        </button>
      </div>

      <!-- Sort -->
      <div class="input-group shadow-sm rounded" style="width: 340px">
        <label class="input-group-text fw-semibold bg-light text-secondary"
          >Sort By</label
        >
        <select v-model="sortBy" class="form-select" @change="fetchRentals">
          <option value="due_date">Due Date</option>
          <option value="locker_number">Locker Number</option>
        </select>
      </div>
    </div>

    <!-- 🧾 Table -->
    <div class="table-container shadow-lg bg-white rounded-4 p-3">
      <table class="table table-hover align-middle text-center mb-0">
        <thead class="table-header">
          <tr>
            <th>Student ID</th>
            <th>Student Name</th>
            <th>Course</th>
            <th>Email</th>
            <th>Locker No.</th>
            <th>Status</th>
            <th>Date Started</th>
            <th>Date End</th>
            <th>Amount Paid</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="rental in rentals" :key="rental.rental_id">
            <td>{{ rental.stud_id }}</td>
            <td>{{ rental.f_name }} {{ rental.l_name }}</td>
            <td>{{ rental.course_name }}</td>
            <td>{{ rental.email }}</td>
            <td>{{ rental.locker_number }}</td>
            <td>
              <span
                :class="[
                  'badge status-badge',
                  rental.rental_status?.toLowerCase() === 'active'
                    ? 'bg-success'
                    : rental.rental_status?.toLowerCase() === 'pending'
                    ? 'bg-warning text-dark'
                    : 'bg-danger'
                ]"
              >
                {{ rental.rental_status }}
              </span>
            </td>
            <td>{{ formatDate(rental.start_date) }}</td>
            <td>{{ formatDate(rental.due_date) }}</td>
            <td>₱{{ rental.paid_amount }}</td>
          </tr>

          <tr v-if="rentals.length === 0">
            <td colspan="9" class="text-muted fst-italic py-4">
              No active rentals found
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const rentals = ref([]);
const searchQuery = ref("");
const sortBy = ref("due_date");
const sortOrder = ref("asc");

const fetchRentals = async () => {
  try {
    let url = `http://localhost:3001/active-rentals?sortBy=${sortBy.value}&sortOrder=${sortOrder.value}`;
    if (searchQuery.value) {
      url = `http://localhost:3001/active-rentals?search=${searchQuery.value}`;
    }

    const res = await axios.get(url);
    console.log("API response:", res.data);

    rentals.value = res.data.records || [];
  } catch (err) {
    console.error("Error fetching rentals:", err);
    rentals.value = [];
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

onMounted(fetchRentals);
</script>

<style scoped>
/* 📦 Container for Table */
.table-container {
  max-height: 600px;
  overflow-y: auto;
  border-radius: 15px;
  transition: all 0.3s ease-in-out;
}

/* 🧭 Table Header (Gradient) */
.table-header {
  background: linear-gradient(135deg, #0d6efd, #007bff);
  color: white;
  font-weight: 600;
}

/* 📊 Table Styling */
table {
  border-radius: 15px;
  overflow: hidden;
  font-size: 12px;
}
table th,
table td {
  padding: 14px 12px;
  vertical-align: middle;
}

/* 🪄 Hover Effect */
tbody tr:hover {
  background-color: #f0f8ff;
  transition: 0.2s ease-in-out;
  box-shadow: inset 0 0 6px rgba(0, 123, 255, 0.15);
}

/* 🎨 Status Badges */
.status-badge {
  padding: 8px 14px;
  font-size: 14px;
  border-radius: 50px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

/* 🌐 Scrollbar */
.table-container::-webkit-scrollbar {
  width: 10px;
}
.table-container::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 10px;
}
.table-container::-webkit-scrollbar-thumb:hover {
  background-color: #888;
}

/* 🧠 Input + Select Enhancements */
.input-group input,
.input-group select {
  border-radius: 8px !important;
  transition: all 0.3s ease;
}

.input-group input:focus,
.input-group select:focus {
  box-shadow: 0 0 10px rgba(13, 110, 253, 0.4);
  border-color: #0d6efd;
}

.input-group .btn-primary {
  border-radius: 0 8px 8px 0;
  transition: all 0.3s ease;
}
.input-group .btn-primary:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 10px rgba(13, 110, 253, 0.4);
}
</style>
