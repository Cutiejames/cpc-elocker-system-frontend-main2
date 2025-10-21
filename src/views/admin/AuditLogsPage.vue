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
          <i class="bi bi-filter"></i>
        </button>
      </div>
    </div>

    <!-- 🧾 Table -->
    <div class="table-container shadow-lg bg-white rounded-4 p-3">
      <table class="table table-hover align-middle text-center mb-0">
        <thead class="table-header">
          <tr>
            <th>ID</th>
            <th>Admin</th>
            <th>Activity</th>
            <th>Date</th>
            <th>Time</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="log in tableData" :key="log.audit_id">
            <td>{{ log.audit_id }}</td>
            <td>{{ log.admin_username }}</td>
            <td class="text-start">{{ log.activity }}</td>
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

    <!-- 📄 Pagination -->
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
          v-for="page in totalPages"
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
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "AuditLogsPage",
  data() {
    return {
      selectedDate: "",
      currentPage: 1,
      perPage: 10,
      totalPages: 1,
      tableData: [],
    };
  },
  mounted() {
    this.fetchLogs();
  },
  methods: {
    async fetchLogs(page = 1) {
      try {
        this.currentPage = page;
        let url = `http://localhost:3001/audit-logs?page=${this.currentPage}&limit=${this.perPage}`;
        if (this.selectedDate) {
          url += `&start=${this.selectedDate}&end=${this.selectedDate}`;
        }

        const res = await axios.get(url);
        this.tableData = res.data.data || [];
        this.totalPages = res.data.totalPages || 1;
      } catch (err) {
        console.error("Error fetching logs:", err);
      }
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.fetchLogs(page);
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return "—";
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
      });
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
}

/* 🧭 Header Styling */
.table-header {
  background: linear-gradient(135deg, #0d6efd, #007bff);
  color: #50a1fd;
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

/* 🌐 Scrollbar */
.table-container::-webkit-scrollbar {
  width: 10px;
}
.table-container::-webkit-scrollbar-thumb {
  background-color: #50a1fd;
  border-radius: 10px;
}
.table-container::-webkit-scrollbar-thumb:hover {
  background-color: #50a1fd;
}
</style>
