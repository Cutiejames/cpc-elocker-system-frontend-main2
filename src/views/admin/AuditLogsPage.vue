<template>
  <div class="container py-4">
    <!-- Header -->
    <h2 class="text-center fw-bold mb-4 text-primary">AUDIT LOGS</h2>

    <!-- 📅 Date Filter -->
    <div class="d-flex justify-content-center mb-4 gap-3 flex-wrap">
      <div class="input-group shadow-sm rounded" style="width: 300px">
        <input
          type="date"
          v-model="selectedDate"
          class="form-control border-0"
          placeholder="Select date..."
        />
        <button class="btn btn-primary shadow-sm" @click="fetchLogs(1)">
          <i class="bi bi-filter"></i> Filter
        </button>
      </div>
    </div>

    <!-- 🧾 Table View for large screens (>= 1200px) -->
    <div class="table-container shadow-lg bg-white rounded-4 p-3 d-none d-xl-block">
      <table class="table table-hover align-middle text-center mb-0">
        <thead class="table-header">
          <tr>
            <th style="width: 8%">ID</th>
            <th style="width: 20%">Admin</th>
            <th style="width: 45%" class="text-start">Activity</th>
            <th style="width: 14%">Date</th>
            <th style="width: 13%">Time</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="log in tableData" :key="log.audit_id">
            <td>{{ log.audit_id }}</td>
            <td>{{ log.admin_username }}</td>
            <td class="text-start activity-cell">{{ log.activity }}</td>
            <td>{{ formatDate(log.created_at) }}</td>
            <td>{{ formatTime(log.created_at) }}</td>
          </tr>

          <tr v-if="tableData.length === 0">
            <td colspan="5" class="text-muted fst-italic py-4">
              No logs found for this date
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 📱 Card View for small screens (< 1200px) -->
    <div class="card-container d-xl-none">
      <div class="scrollable-cards">
        <div
          v-for="log in tableData"
          :key="log.audit_id"
          class="log-card shadow-sm"
          @click="openDetailsModal(log)"
        >
          <div class="card-header-row">
            <span class="text-primary fw-bold">ID: {{ log.audit_id }}</span>
            <small class="text-muted">{{ formatDate(log.created_at) }} at {{ formatTime(log.created_at) }}</small>
          </div>
          <p class="mb-1 text-truncate">
            <strong>Admin:</strong> {{ log.admin_username }}
          </p>
          <p class="mb-0 log-preview">
            {{ log.activity }}
          </p>
        </div>
      </div>
      <p v-if="tableData.length === 0" class="text-center text-muted fst-italic py-4">
        No logs found for this date
      </p>
    </div>

    <!-- 📄 Pagination (applies to both views) -->
    <nav v-if="totalPages > 1" class="mt-3">
      <ul class="pagination justify-content-center">
        <li
          class="page-item"
          :class="{ disabled: currentPage === 1 }"
          @click="changePage(currentPage - 1)"
        >
          <a class="page-link">Prev</a>
        </li>

        <li
          v-for="page in paginationRange"
          :key="page"
          class="page-item"
          :class="{ active: currentPage === page }"
          @click="changePage(page)"
        >
          <a class="page-link">{{ page }}</a>
        </li>

        <li
          class="page-item"
          :class="{ disabled: currentPage === totalPages }"
          @click="changePage(currentPage + 1)"
        >
          <a class="page-link">Next</a>
        </li>
      </ul>
    </nav>

    <!-- 📱 Log Detail Modal -->
    <div
      class="modal fade"
      id="logDetailsModal"
      tabindex="-1"
      aria-labelledby="logDetailsModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title" id="logDetailsModalLabel">
              Audit Log #{{ selectedLog?.audit_id }}
            </h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <p class="mb-1"><strong>Admin:</strong> {{ selectedLog?.admin_username }}</p>
            <p class="mb-3">
              <strong>Time:</strong> {{ formatDate(selectedLog?.created_at) }} at
              {{ formatTime(selectedLog?.created_at) }}
            </p>
            <hr />
            <h6>Activity Details:</h6>
            <div class="activity-detail-box p-3 rounded">
              {{ selectedLog?.activity }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
// Import Bootstrap Modal for programmatic control
import { Modal } from "bootstrap";

export default {
  name: "AuditLogsPage",
  data() {
    return {
      selectedDate: "",
      currentPage: 1,
      perPage: 10,
      totalPages: 1,
      tableData: [],
      selectedLog: null,
      detailsModalInstance: null,
    };
  },
  computed: {
    // Generates a limited range of pages for the pagination control
    paginationRange() {
      const start = Math.max(1, this.currentPage - 2);
      const end = Math.min(this.totalPages, this.currentPage + 2);
      const pages = [];
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    },
  },
  mounted() {
    // Initialize the Bootstrap Modal instance once
    const modalElement = document.getElementById("logDetailsModal");
    if (modalElement) {
      this.detailsModalInstance = new Modal(modalElement);
    }
    this.fetchLogs();
  },
  methods: {
    async fetchLogs(page = 1) {
      try {
        this.currentPage = page;
        let url = `http://localhost:3001/audit-logs?page=${this.currentPage}&limit=${this.perPage}`;
        
        // Use ISO format for API date filtering
        if (this.selectedDate) {
          url += `&start=${this.selectedDate}T00:00:00Z&end=${this.selectedDate}T23:59:59Z`;
        }

        const res = await axios.get(url);
        this.tableData = res.data.data || [];
        this.totalPages = res.data.totalPages || 1;
      } catch (err) {
        console.error("Error fetching logs:", err);
        // Clear data on error
        this.tableData = [];
        this.totalPages = 1;
      }
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.fetchLogs(page);
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return "—";
      // Ensure date object creation is robust
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
    formatTime(dateStr) {
      if (!dateStr) return "—";
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    },
    openDetailsModal(log) {
      this.selectedLog = log;
      this.detailsModalInstance?.show();
    },
  },
};
</script>

<style scoped>
/* 📦 Table Container */
.table-container {
  max-height: 600px;
  overflow-y: auto;
  border-radius: 15px;
  transition: all 0.3s ease-in-out;
  /* Ensure header remains visible when scrolling on desktop */
}
.table-container table thead {
  position: sticky;
  top: 0;
  z-index: 10;
}


/* 🧭 Header Styling */
.table-header {
  background: linear-gradient(135deg, #0d6efd, #007bff);
  color: white; /* Changed color to white for better contrast */
  font-weight: 600;
}

/* 🧱 Table */
table {
  border-radius: 15px;
  overflow: hidden;
}
table th,
table td {
  padding: 14px 12px;
  vertical-align: middle;
  font-size: 15px;
}
.activity-cell {
  max-width: 300px; /* Limit width of activity column */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 🌈 Row Hover */
tbody tr:hover {
  background-color: #f0f8ff;
  transition: 0.2s ease-in-out;
  box-shadow: inset 0 0 6px rgba(0, 123, 255, 0.15);
}

/* 📜 Pagination */
.pagination .page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
}
.pagination .page-link {
  color: #0d6efd;
  font-size: 15px;
  padding: 8px 14px;
}
.pagination .page-link:hover {
  background-color: #e9f1ff;
}


/* --- MOBILE CARD STYLES (Screen < 1200px) --- */
.card-container {
  padding: 0 10px;
}

.scrollable-cards {
  max-height: calc(100vh - 200px); /* Adjust height for scrolling on mobile */
  overflow-y: auto;
  padding-right: 5px;
}

.log-card {
  border: 1px solid #e0e0e0;
  border-left: 5px solid #0d6efd; /* Highlight */
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  background-color: white;
  transition: all 0.2s ease;
  cursor: pointer;
}
.log-card:hover {
  background-color: #f5f8ff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 12px;
}
.log-preview {
  font-size: 14px;
  color: #333;
  /* Truncate the activity log for the card view */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* --- MODAL STYLES --- */
.activity-detail-box {
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    word-wrap: break-word;
    white-space: pre-wrap;
}


/* 🌐 Scrollbar */
.table-container::-webkit-scrollbar,
.scrollable-cards::-webkit-scrollbar {
  width: 8px;
}
.table-container::-webkit-scrollbar-thumb,
.scrollable-cards::-webkit-scrollbar-thumb {
  background-color: #50a1fd;
  border-radius: 10px;
}
.table-container::-webkit-scrollbar-thumb:hover,
.scrollable-cards::-webkit-scrollbar-thumb:hover {
  background-color: #3b82f6;
}
</style>
