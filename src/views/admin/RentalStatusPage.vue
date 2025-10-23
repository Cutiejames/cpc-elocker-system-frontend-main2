<template>
  <div class="container py-4">
    <h2 class="text-center fw-bold mb-4 text-primary">RENT STATUS</h2>

    <div class="d-flex flex-wrap gap-3 mb-4 justify-content-center">
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

      <div class="input-group shadow-sm rounded" style="width: 340px">
        <label class="input-group-text fw-semibold bg-light text-secondary"
          >Sort By</label
        >
        <select v-model="sortBy" class="form-select" @change="fetchRentals">
          <option value="due_date">Due Date</option>
          <option value="locker_number">Locker Number</option>
        </select>
        <select v-model="sortOrder" class="form-select" @change="fetchRentals">
          <option value="asc">ASC</option>
          <option value="desc">DESC</option>
        </select>
      </div>
    </div>

    <div class="table-container shadow-lg bg-white rounded-4 p-3 d-none d-xl-block">
      <table class="table table-hover align-middle text-center mb-0">
        <thead class="table-header sticky-top">
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
          <tr
            v-for="rental in rentals"
            :key="rental.rental_id"
            @click="openPaymentHistory(rental.stud_id)"
            style="cursor: pointer"
          >
            <td>{{ rental.stud_id }}</td>
            <td>{{ rental.f_name }} {{ rental.l_name }}</td>
            <td>{{ rental.course_name }}</td>
            <td>{{ rental.email }}</td>
            <td>{{ rental.locker_number }}</td>
            <td>
              <span class="status-text">
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

    <div class="card-container d-xl-none">
      <div class="scrollable-cards">
        <div
          v-for="rental in rentals"
          :key="rental.rental_id"
          class="rental-card shadow-sm"
          @click="openDetails(rental)"
        >
          <div class="card-row">
            <div><strong>ID:</strong> {{ rental.stud_id }}</div>
            <div><strong>Name:</strong> {{ rental.f_name }} {{ rental.l_name }}</div>
            <div><strong>Locker:</strong> {{ rental.locker_number }}</div>
          </div>
        </div>
      </div>
      <p v-if="rentals.length === 0" class="text-center text-muted fst-italic py-4">
        No active rentals found
      </p>
    </div>

    <div
      class="modal fade"
      id="paymentHistoryModal"
      tabindex="-1"
      aria-labelledby="paymentHistoryLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content rounded-4 shadow">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title fw-bold" id="paymentHistoryLabel">
              Payment History - Student ID: {{ selectedStudentId }}
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>

          <div class="modal-body">
            <div v-if="loadingPayments" class="text-center py-4">
              <div class="spinner-border text-primary" role="status"></div>
              <p class="mt-2 text-secondary">Loading payment history...</p>
            </div>

            <div v-else-if="paymentHistory.length === 0" class="text-center py-4 text-muted">
              No payment history found.
            </div>

            <table
              v-else
              class="table table-striped table-hover text-center align-middle"
            >
              <thead class="table-primary">
                <tr>
                  <th>Payment ID</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Method</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="payment in paymentHistory" :key="payment.payment_id">
                  <td>{{ payment.payment_id }}</td>
                  <td>{{ formatDate(payment.payment_date) }}</td>
                  <td>₱{{ payment.amount }}</td>
                  <td>{{ payment.payment_method }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Close
            </button>
          </div>
        </div>
      </div>
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
              {{ selectedRental?.f_name }} {{ selectedRental?.l_name }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p><strong>Student ID:</strong> {{ selectedRental?.stud_id }}</p>
            <p><strong>Course:</strong> {{ selectedRental?.course_name }}</p>
            <p><strong>Email:</strong> {{ selectedRental?.email }}</p>
            <p><strong>Locker No.:</strong> {{ selectedRental?.locker_number }}</p>
            <p><strong>Status:</strong> {{ selectedRental?.rental_status }}</p>
            <p><strong>Date Started:</strong> {{ formatDate(selectedRental?.start_date) }}</p>
            <p><strong>Date End:</strong> {{ formatDate(selectedRental?.due_date) }}</p>
            <p><strong>Amount Paid:</strong> ₱{{ selectedRental?.paid_amount }}</p>
            <div class="d-grid mt-3">
              <button class="btn btn-outline-primary" @click="openPaymentHistoryFromCard">
                View Payment History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import * as bootstrap from "bootstrap"; 

const rentals = ref([]);
const searchQuery = ref("");
const sortBy = ref("due_date");
const sortOrder = ref("asc");

// 🆕 Added for Card View
const selectedRental = ref(null);
const detailsModalRef = ref(null); // Ref for the card details modal
let detailsModalInstance = null; // Instance for the card details modal

// For Payment History
const selectedStudentId = ref(null);
const paymentHistory = ref([]);
const loadingPayments = ref(false);

const fetchRentals = async () => {
  try {
    let url = `http://localhost:3001/active-rentals?sortBy=${sortBy.value}&sortOrder=${sortOrder.value}`;
    if (searchQuery.value) {
      url += `&search=${searchQuery.value}`;
    }

    const res = await axios.get(url);
    rentals.value = res.data.records || [];
  } catch (err) {
    console.error("Error fetching rentals:", err);
    rentals.value = [];
  }
};

// Fetch Payment History by Student ID
const openPaymentHistory = async (studId) => {
  selectedStudentId.value = studId;
  paymentHistory.value = [];
  loadingPayments.value = true;

  // Hide the details modal if it's open (important when called from the card view)
  if (detailsModalInstance) detailsModalInstance.hide(); 

  const paymentModalEl = document.getElementById("paymentHistoryModal");
  const modal = new bootstrap.Modal(paymentModalEl);
  modal.show();

  try {
    const res = await axios.get(
      `http://localhost:3001/payment-history-ad/${studId}`
    );
    paymentHistory.value = res.data.records || [];
  } catch (err) {
    console.error("Error fetching payment history:", err);
  } finally {
    loadingPayments.value = false;
  }
};

// 🆕 Function for card view click
const openDetails = (rental) => {
  selectedRental.value = rental;
  if (!detailsModalInstance) {
    detailsModalInstance = new bootstrap.Modal(detailsModalRef.value);
  }
  detailsModalInstance.show();
};

// 🆕 Function to jump from card details modal to payment history modal
const openPaymentHistoryFromCard = () => {
  if (selectedRental.value) {
    openPaymentHistory(selectedRental.value.stud_id);
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
/* 📦 Container for Table (Desktop) */
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
  font-size: 14px; /* Increased slightly for better desktop readability */
}
table th,
table td {
  padding: 14px 12px;
  vertical-align: middle;
}

/* Make table header sticky on desktop */
.table-header th {
    position: sticky;
    top: 0;
    z-index: 10; /* Ensures header stays above scrolling content */
}


/* 🪄 Hover Effect */
tbody tr:hover {
  background-color: #f0f8ff;
  transition: 0.2s ease-in-out;
  box-shadow: inset 0 0 6px rgba(0, 123, 255, 0.15);
  cursor: pointer; /* Ensure the pointer is visible */
}

/* 🎨 Plain Status Text */
.status-text {
  font-size: 14px;
  font-weight: 600;
  color: #333;
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

/* 📱 MOBILE CARD STYLES (Screen < 1200px) */
.card-container {
  display: flex;
  flex-direction: column;
}

.scrollable-cards {
  max-height: calc(100vh - 200px); /* Adjust height for scrolling, accommodating header/controls */
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

/* Horizontal layout for non-clicked info */
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

/* Small screen adjustments */
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