<template>
  <div class="container py-4">
    <h2 class="text-center fw-bold mb-4 text-primary">RESERVATION DETAILS</h2>

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

    <div class="table-container shadow-lg bg-white rounded-4 p-3 d-none d-xl-block">
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
                    : 'bg-danger',
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
            <td colspan="5" class="text-muted fst-italic py-4">No rentals found</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card-container d-xl-none">
      <div class="scrollable-cards">
        <div
          v-for="rental in filteredRentals"
          :key="rental.rental_id"
          class="rental-card shadow-sm"
          @click="openDetailsModal(rental)"
        >
          <div class="card-row">
            <div><strong>ID:</strong> {{ rental.rental_id }}</div>
            <div><strong>Locker:</strong> {{ rental.locker_number }}</div>
            <div>
              <strong>Status:</strong>
              <span
                :class="[
                  'badge status-badge-sm',
                  rental.status?.toLowerCase() === 'pending'
                    ? 'bg-warning text-dark'
                    : rental.status?.toLowerCase() === 'reserved'
                    ? 'bg-info text-dark'
                    : rental.status?.toLowerCase() === 'active'
                    ? 'bg-success'
                    : 'bg-danger',
                ]"
              >
                {{ rental.status }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <p v-if="filteredRentals.length === 0" class="text-center text-muted fst-italic py-4">
        No rentals found
      </p>
    </div>

    <div
      class="modal fade"
      id="detailsModal"
      tabindex="-1"
      aria-hidden="true"
      ref="detailsModalRef"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">
              Rental #{{ selectedRental?.rental_id }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p><strong>Locker Number:</strong> {{ selectedRental?.locker_number }}</p>
            <p><strong>Location (Course):</strong> {{ selectedRental?.course_name }}</p>
            <p>
              <strong>Status:</strong>
              <span
                :class="[
                  'badge status-badge',
                  selectedRental?.status?.toLowerCase() === 'pending'
                    ? 'bg-warning text-dark'
                    : selectedRental?.status?.toLowerCase() === 'reserved'
                    ? 'bg-info text-dark'
                    : selectedRental?.status?.toLowerCase() === 'active'
                    ? 'bg-success'
                    : 'bg-danger',
                ]"
              >
                {{ selectedRental?.status }}
              </span>
            </p>
            
            <hr />

            <div class="d-flex justify-content-center gap-2">
              <button
                class="btn btn-approve w-50"
                @click="approveReservationFromModal"
                :disabled="selectedRental?.status?.toLowerCase() === 'active'"
              >
                <i class="bi bi-check-circle me-1"></i> Approve
              </button>
              <button
                class="btn btn-cancel w-50"
                @click="cancelRentalFromModal"
                :disabled="selectedRental?.status?.toLowerCase() === 'active'"
              >
                <i class="bi bi-x-circle me-1"></i> Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import * as bootstrap from "bootstrap"; // Ensure bootstrap is imported

const rentals = ref([]);
const searchQuery = ref("");
// 🆕 Added for Card View
const selectedRental = ref(null);
const detailsModalRef = ref(null);
let detailsModalInstance = null;

// 🧭 Fetch all pending rentals
const fetchPendingRentals = async () => {
  try {
    const token = localStorage.getItem("token");
    let url = "http://localhost:3001/pending-rentals";
    
    // 💡 Fetching with search query if present
    if (searchQuery.value.trim()) {
        url += `?search=${searchQuery.value.trim()}`;
    }

    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

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

// 🔍 Filter rentals (only used if search is not passed to API)
const filteredRentals = computed(() => {
    // If search is handled by the API (which it is in fetchPendingRentals), 
    // this computed property just returns the fetched array.
    return rentals.value;
});

// ✅ Approve reservation (fixed API route)
const approveReservation = async (rentalId) => {
  try {
    const token = localStorage.getItem("token");
    const confirmAction = confirm(`Approve reservation #${rentalId}?`);
    if (!confirmAction) return;

    const response = await axios.post(
      "http://localhost:3001/approve-rental",
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
    detailsModalInstance?.hide(); // Hide modal if open
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
      "http://localhost:3001/cancel-rental",
      { rental_id: rentalId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert(response.data.message || "Rental cancelled successfully!");
    detailsModalInstance?.hide(); // Hide modal if open
    fetchPendingRentals(); // refresh list
  } catch (err) {
    console.error("Error cancelling rental:", err);
    alert(err.response?.data?.error || "Failed to cancel rental.");
  }
};

// 🆕 Card View Functions
const openDetailsModal = (rental) => {
  selectedRental.value = rental;
  if (!detailsModalInstance) {
    detailsModalInstance = new bootstrap.Modal(detailsModalRef.value);
  }
  detailsModalInstance.show();
};

const approveReservationFromModal = () => {
  if (selectedRental.value) {
    approveReservation(selectedRental.value.rental_id);
  }
};

const cancelRentalFromModal = () => {
  if (selectedRental.value) {
    cancelRental(selectedRental.value.rental_id);
  }
};

onMounted(fetchPendingRentals);
</script>

<style scoped>
/* --- BASE TABLE STYLES (Desktop) --- */
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
  position: sticky; /* Sticky header for scrolling table */
  top: 0;
  z-index: 10;
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

/* --- BUTTON & BADGE STYLES --- */
.status-badge {
  padding: 8px 14px;
  font-size: 14px;
  border-radius: 50px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.status-badge-sm { /* For card view */
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 50px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
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

/* --- MOBILE CARD STYLES (Screen < 1200px) --- */
.card-container {
  display: flex;
  flex-direction: column;
}

.scrollable-cards {
  max-height: calc(100vh - 200px); /* Adjust height for scrolling */
  overflow-y: auto;
  padding-right: 5px;
}

.rental-card {
  border: 1px solid #dee2e6;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 8px;
  background-color: white;
  transition: all 0.2s ease;
  cursor: pointer;
}
.rental-card:hover {
  transform: scale(1.01);
  background-color: #f0f8ff;
  border-color: #0d6efd;
}

.card-row {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  font-size: 14px;
}
.card-row > div {
  flex: 1 1 30%;
  min-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 576px) {
  .card-row {
    flex-direction: column;
    gap: 4px;
  }
  .card-row > div {
    flex: 1 1 100%;
    font-size: 13px;
    white-space: normal;
  }
}
</style>