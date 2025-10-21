<template>
  <div class="container my-5 pb-5">
    <!-- Legend -->
    <div class="stats d-flex justify-content-start gap-4 mb-4">
      <div><span class="dot bg-danger"></span> RENTED</div>
      <div><span class="dot bg-warning"></span> RESERVED</div>
      <div><span class="dot bg-success"></span> AVAILABLE</div>
    </div>

    <!-- Locker Batches -->
    <div v-if="sortedLockers.length" class="row justify-content-center mb-5">
      <!-- Left Batch -->
      <div class="col-md-6 text-center">
        <h5 class="fw-bold mb-3">{{ currentBatchLetters[0] }}</h5>
        <div class="row g-3 justify-content-center">
          <div
            v-for="locker in leftBatch"
            :key="locker.locker_id"
            class="col-3 d-flex justify-content-center position-relative"
          >
            <!-- Locker Card -->
            <div
              class="card locker-card shadow-sm position-relative"
              :class="{ selected: selectedLocker && selectedLocker.locker_id === locker.locker_id }"
              @mouseenter="hoverLocker = locker"
              @mouseleave="hoverLocker = null"
            >
              <div class="card-body text-center p-3" @click="openLocker(locker)">
                <div class="locker-icon-wrapper mb-2">
                  <img :src="lockerIcon" alt="Locker" class="locker-icon" />
                </div>
                <div class="locker-number">{{ locker.locker_number }}</div>
                <div class="status-dot mt-1" :class="statusColor(locker.status)"></div>
              </div>

              <!-- Hover Popup -->
              <div
                v-if="hoverLocker && hoverLocker.locker_id === locker.locker_id"
                class="locker-tooltip shadow-lg p-3 rounded"
              >
                <!-- RENTED -->
                <template v-if="locker.status === 'rented'">
                  <p>This {{ locker.locker_number }} locker has already been rented!</p>
                  <button class="btn btn-primary btn-sm w-50 mx-auto d-block" @click.stop="hoverLocker = null">
                    Okay
                  </button>
                </template>

                <!-- RESERVED -->
                <template v-else-if="locker.status === 'reserved'">
                  <p>This {{ locker.locker_number }} locker is already reserved by someone!</p>
                  <button class="btn btn-primary btn-sm w-50 mx-auto d-block" @click.stop="hoverLocker = null">
                    Okay
                  </button>
                </template>

                <!-- AVAILABLE -->
                <template v-else-if="locker.status === 'available'">
                  <p>This {{ locker.locker_number }} locker is currently available!</p>
                  <p>Would you like to assign someone?</p>
                  <div class="d-flex justify-content-center gap-2">
                    <button class="btn btn-danger btn-sm" @click.stop="hoverLocker = null">
                      No
                    </button>
                    <button
                      class="btn btn-primary btn-sm"
                      @click.stop="assignLocker(locker)"
                    >
                      Yes
                    </button>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Batch -->
      <div class="col-md-6 text-center">
        <h5 class="fw-bold mb-3">{{ currentBatchLetters[1] }}</h5>
        <div class="row g-3 justify-content-center">
          <div
            v-for="locker in rightBatch"
            :key="locker.locker_id"
            class="col-3 d-flex justify-content-center position-relative"
          >
            <div
              class="card locker-card shadow-sm position-relative"
              :class="{ selected: selectedLocker && selectedLocker.locker_id === locker.locker_id }"
              @mouseenter="hoverLocker = locker"
              @mouseleave="hoverLocker = null"
            >
              <div class="card-body text-center p-3" @click="openLocker(locker)">
                <div class="locker-icon-wrapper mb-2">
                  <img :src="lockerIcon" alt="Locker" class="locker-icon" />
                </div>
                <div class="locker-number">{{ locker.locker_number }}</div>
                <div class="status-dot mt-1" :class="statusColor(locker.status)"></div>
              </div>

              <!-- Hover Popup -->
              <div
                v-if="hoverLocker && hoverLocker.locker_id === locker.locker_id"
                class="locker-tooltip shadow-lg p-3 rounded"
              >
                <template v-if="locker.status === 'rented'">
                  <p>This {{ locker.locker_number }} locker has already been rented!</p>
                  <button class="btn btn-primary btn-sm w-50 mx-auto d-block" @click.stop="hoverLocker = null">
                    Okay
                  </button>
                </template>

                <template v-else-if="locker.status === 'reserved'">
                  <p>This {{ locker.locker_number }} locker is already reserved by someone!</p>
                  <button class="btn btn-primary btn-sm w-50 mx-auto d-block" @click.stop="hoverLocker = null">
                    Okay
                  </button>
                </template>

                <template v-else-if="locker.status === 'available'">
                  <p>This {{ locker.locker_number }} locker is currently available!</p>
                  <p>Would you like to assign someone?</p>
                  <div class="d-flex justify-content-center gap-2">
                    <button class="btn btn-danger btn-sm" @click.stop="hoverLocker = null">
                      No
                    </button>
                    <button
                      class="btn btn-primary btn-sm"
                      @click.stop="assignLocker(locker)"
                    >
                      Yes
                    </button>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- If no lockers -->
    <div v-else class="text-center text-muted py-5">
      <h5>No lockers found.</h5>
    </div>

    <!-- Pagination -->
    <div v-if="sortedLockers.length" class="pagination-footer">
      <button
        class="btn btn-outline-primary rounded-pill px-4 fw-semibold pagination-btn"
        @click="prevPage"
        :disabled="currentPage === 1"
      >
        ‹ Prev
      </button>

      <div class="d-flex gap-2">
        <button
          v-for="page in totalPages"
          :key="page"
          @click="goToPage(page)"
          class="page-circle"
          :class="{ active: currentPage === page }"
        >
          {{ page }}
        </button>
      </div>

      <button
        class="btn btn-outline-primary rounded-pill px-4 fw-semibold pagination-btn"
        @click="nextPage"
        :disabled="currentPage === totalPages"
      >
        Next ›
      </button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import lockerIcon from "@/assets/locker-black.png";

export default {
  name: "LockersPage",
  data() {
    return {
      lockers: [],
      selectedLocker: null,
      hoverLocker: null,
      currentPage: 1,
      lockerIcon,
      letters: ["A", "B", "C", "D"],
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.letters.length / 2);
    },
    currentBatchLetters() {
      const index = (this.currentPage - 1) * 2;
      return [this.letters[index], this.letters[index + 1]];
    },
    sortedLockers() {
      if (!Array.isArray(this.lockers)) return [];
      return [...this.lockers].sort((a, b) => {
        const letterA = a.locker_number?.charAt(0).toUpperCase() || "";
        const letterB = b.locker_number?.charAt(0).toUpperCase() || "";
        const numA = parseInt(a.locker_number?.slice(1)) || 0;
        const numB = parseInt(b.locker_number?.slice(1)) || 0;
        if (letterA === letterB) return numA - numB;
        return letterA.localeCompare(letterB);
      });
    },
    leftBatch() {
      return this.sortedLockers.filter((l) =>
        l.locker_number?.startsWith(this.currentBatchLetters[0])
      );
    },
    rightBatch() {
      return this.sortedLockers.filter((l) =>
        l.locker_number?.startsWith(this.currentBatchLetters[1])
      );
    },
  },
  methods: {
    async fetchLockers() {
      try {
        const response = await axios.get("http://localhost:3001/locker/lockers");
        const data = response.data;
        this.lockers = Array.isArray(data)
          ? data
          : data.lockers || data.data || data.result || [];
      } catch (error) {
        console.error("Error fetching lockers:", error);
        this.lockers = [];
      }
    },
    statusColor(status) {
      switch (status) {
        case "rented":
          return "bg-danger";
        case "reserved":
          return "bg-warning";
        case "available":
          return "bg-success";
        default:
          return "bg-secondary";
      }
    },
    openLocker(locker) {
      if (locker.status === "available") {
        this.$router.push({
          name: "LockerRentForm",
          params: { id: locker.locker_id },
          query: {
            number: locker.locker_number,
            status: locker.status,
          },
        });
      }
    },
    assignLocker(locker) {
      this.hoverLocker = null;
      this.$router.push({
        name: "LockerRentForm",
        params: { id: locker.locker_id },
        query: {
          number: locker.locker_number,
          status: locker.status,
        },
      });
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },
    goToPage(page) {
      this.currentPage = page;
    },
  },
  mounted() {
    this.fetchLockers();
  },
};
</script>

<style scoped>
.stats {
  margin-bottom: 60px;
}
.dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 4px;
}
.locker-card {
  width: 90px;
  border: none;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.25) !important;
  transition: transform 0.2s ease;
  cursor: pointer;
  background: white;
  position: relative;
  z-index: 2;
}
.locker-card:hover {
  transform: translateY(-4px);
}
.locker-icon-wrapper {
  border-bottom: 3px solid #000;
  padding-bottom: 6px;
  display: flex;
  justify-content: center;
}
.locker-icon {
  width: 45px;
}
.locker-number {
  font-weight: bold;
  font-size: 14px;
}
.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin: 0 auto;
}

/* ✅ Hover Popup Styling Fix */
.locker-tooltip {
  position: absolute;
  top: -110px; /* appear above locker */
  left: 50%;
  transform: translateX(-50%);
  width: 250px;
  background: white;
  border-radius: 12px;
  border: 1px solid #ddd;
  padding: 12px;
  text-align: center;
  animation: fadeIn 0.2s ease-in-out;
  z-index: 999999 !important;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

/* Ensure nothing hides it */
.row,
.container-fluid,
.container {
  overflow: visible !important;
  position: static !important;
  z-index: auto !important;
  transform: none !important;
}

.locker-tooltip p {
  margin: 0 0 8px 0;
  font-weight: 500;
  font-size: 14px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.pagination-footer {
  position: relative;
  bottom: -150px;
  background: white;
  padding: 10px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
}
.page-circle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 2px solid #007bff;
  background-color: white;
  color: #007bff;
  font-weight: bold;
  font-size: 15px;
  text-align: center;
  line-height: 34px;
  cursor: pointer;
}
.page-circle.active {
  background-color: #007bff;
  color: white;
  box-shadow: 0 0 8px rgba(0, 123, 255, 0.5);
}
</style>