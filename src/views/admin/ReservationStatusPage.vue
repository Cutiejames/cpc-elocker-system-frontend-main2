<template>
  <div class="container py-4">
    <h2 class="text-center fw-bold mb-4 text-primary">RESERVATION DETAILS</h2>

    <!-- 🔍 Search Bar -->
    <div class="d-flex justify-content-center mb-4">
      <div class="input-group shadow-sm rounded" style="width: 380px">
        <input
          v-model="searchQuery"
          type="text"
          class="form-control border-0"
          placeholder="Search by Locker No., Course, or Status..."
          @keyup.enter="fetchPendingRentals"
        />
        <button class="btn btn-primary shadow-sm" @click="fetchPendingRentals">
          <i class="bi bi-search"></i>
        </button>
      </div>
    </div>

    <!-- 🧾 Table -->
    <div class="table-container shadow-lg bg-white rounded-4 p-3">
      <table class="table table-hover align-middle text-center mb-0">
        <thead class="table-header">
          <tr>
            <th>Rental ID</th>
            <th>Locker Number</th>
            <th>Location (Course)</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="rental in filteredRentals" :key="rental.rental_id">
            <td>{{ rental.rental_id }}</td>
            <td>{{ rental.locker_number }}</td>
            <td>{{ rental.course_name }}</td>
            <td>
              <span
                :class="[
                  'badge status-badge',
                  rental.status?.toLowerCase() === 'pending'
                    ? 'bg-warning text-dark'
                    : rental.status?.toLowerCase() === 'reserved'
                    ? 'bg-info text-dark'
                    : rental.status?.toLowerCase() === 'active'
                    ? 'bg-success'
                    : 'bg-danger'
                ]"
              >
                {{ rental.status }}
              </span>
            </td>
            <td>
              <div class="d-flex justify-content-center gap-2">
                <button
                  class="btn btn-approve shadow-sm"
                  @click="approveReservation(rental.rental_id)"
                  :disabled="rental.status?.toLowerCase() === 'active'"
                >
                  <i class="bi bi-check-circle me-1"></i> Approve
                </button>
                <button
                  class="btn btn-cancel shadow-sm"
                  @click="cancelRental(rental.rental_id)"
                  :disabled="rental.status?.toLowerCase() === 'active'"
                >
                  <i class="bi bi-x-circle me-1"></i> Cancel
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="filteredRentals.length === 0">
            <td colspan="5" class="text-muted fst-italic py-4">
              No rentals found
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";

const rentals = ref([]);
const searchQuery = ref("");

// 🧭 Fetch all pending rentals
const fetchPendingRentals = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get("http://localhost:3001/pending-rentals", {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("🔹 API Response:", res.data);

    // ✅ Your backend structure: { page, limit, totalRecords, totalPages, records: [] }
    if (Array.isArray(res.data.records)) {
      rentals.value = res.data.records;
    } else {
      console.warn("⚠️ Unexpected API format:", res.data);
      rentals.value = [];
    }
  } catch (err) {
    console.error("Failed to fetch rentals:", err);
    rentals.value = [];
  }
};

// 🔍 Filter rentals
const filteredRentals = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return rentals.value;
  return rentals.value.filter(
    (r) =>
      r.locker_number?.toString().toLowerCase().includes(q) ||
      r.course_name?.toLowerCase().includes(q) ||
      r.status?.toLowerCase().includes(q)
  );
});

// ✅ Approve reservation (fixed API route)
const approveReservation = async (rentalId) => {
  try {
    const token = localStorage.getItem("token");
    const confirmAction = confirm(`Approve reservation #${rentalId}?`);
    if (!confirmAction) return;

    const response = await axios.post(
      "http://localhost:3001/approve-rental", // ✅ FIXED: no /api
      {
        rental_id: rentalId,
        months: 1,
        paid_months: 1,
        payment_method: "cash",
        remarks: "Approved by admin",
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert(response.data.message || "Reservation approved successfully!");
    fetchPendingRentals(); // refresh list
  } catch (err) {
    console.error("Error approving reservation:", err);
    alert(err.response?.data?.error || "Failed to approve reservation.");
  }
};

// ❌ Cancel rental (fixed API route)
const cancelRental = async (rentalId) => {
  try {
    const token = localStorage.getItem("token");
    const confirmAction = confirm(`Cancel rental #${rentalId}?`);
    if (!confirmAction) return;

    const response = await axios.post(
      "http://localhost:3001/cancel-rental", // ✅ FIXED: no /api
      { rental_id: rentalId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert(response.data.message || "Rental cancelled successfully!");
    fetchPendingRentals(); // refresh list
  } catch (err) {
    console.error("Error cancelling rental:", err);
    alert(err.response?.data?.error || "Failed to cancel rental.");
  }
};

onMounted(fetchPendingRentals);
</script>

<style scoped>
.table-container {
  max-height: 600px;
  overflow-y: auto;
  border-radius: 15px;
  transition: all 0.3s ease-in-out;
}

.table-header {
  background: linear-gradient(135deg, #0d6efd, #007bff);
  color: white;
  font-weight: 600;
}

table {
  border-radius: 15px;
  overflow: hidden;
}

table th,
table td {
  padding: 14px 12px;
  vertical-align: middle;
}

tbody tr:hover {
  background-color: #f0f8ff;
  transition: 0.2s ease-in-out;
  box-shadow: inset 0 0 6px rgba(0, 123, 255, 0.15);
}

.status-badge {
  padding: 8px 14px;
  font-size: 14px;
  border-radius: 50px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.btn-approve,
.btn-cancel {
  border: none;
  border-radius: 8px;
  padding: 6px 14px;
  transition: 0.3s ease;
  color: white;
}

.btn-approve {
  background-color: #198754;
}
.btn-approve:hover:not(:disabled) {
  background-color: #157347;
  transform: scale(1.05);
  box-shadow: 0 4px 10px rgba(25, 135, 84, 0.4);
}

.btn-cancel {
  background-color: #dc3545;
}
.btn-cancel:hover:not(:disabled) {
  background-color: #bb2d3b;
  transform: scale(1.05);
  box-shadow: 0 4px 10px rgba(220, 53, 69, 0.4);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

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
</style>
