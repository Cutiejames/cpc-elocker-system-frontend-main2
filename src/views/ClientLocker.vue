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
            class="col-3 d-flex justify-content-center"
          >
            <div
              class="card locker-card shadow-sm"
              :class="{ selected: selectedLocker && selectedLocker.locker_id === locker.locker_id }"
              @click="openLocker(locker)"
            >
              <div class="card-body text-center p-3">
                <div class="locker-icon-wrapper mb-2">
                  <img :src="lockerIcon" alt="Locker" class="locker-icon" />
                </div>
                <div class="locker-number">{{ locker.locker_number }}</div>
                <div class="status-dot mt-1" :class="statusColor(locker.status)"></div>
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
            class="col-3 d-flex justify-content-center"
          >
            <div
              class="card locker-card shadow-sm"
              :class="{ selected: selectedLocker && selectedLocker.locker_id === locker.locker_id }"
              @click="openLocker(locker)"
            >
              <div class="card-body text-center p-3">
                <div class="locker-icon-wrapper mb-2">
                  <img :src="lockerIcon" alt="Locker" class="locker-icon" />
                </div>
                <div class="locker-number">{{ locker.locker_number }}</div>
                <div class="status-dot mt-1" :class="statusColor(locker.status)"></div>
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

    <!-- Locker Modal -->
    <div
      v-if="selectedLocker"
      class="modal fade show"
      style="display: block; background: rgba(0,0,0,0.5);"
      tabindex="-1"
      @click.self="selectedLocker = null"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              Locker {{ selectedLocker.locker_number }}
            </h5>
            <button type="button" class="btn-close" @click="selectedLocker = null"></button>
          </div>

          <div class="modal-body">
            <template v-if="selectedLocker.status === 'available'">
              <div class="text-center mb-3">
                <p class="fw-semibold">Choose what you want to do:</p>
                <select v-model="form.action_type" class="form-select mb-3">
                  <option disabled value="">select</option>
                  <option value="rent">Rent</option>
                  <option value="reserve">Reserve</option>
                </select>

                <!-- rent fields -->
                <div v-if="form.action_type === 'rent'">
                  <div class="mb-3">
                    <label class="form-label">Number of Months:</label>
                    <input
                      v-model.number="form.months"
                      type="number"
                      class="form-control"
                      min="1"
                      required
                    />
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Months Paid:</label>
                    <input
                      v-model.number="form.paid_months"
                      type="number"
                      class="form-control"
                      min="0"
                      :max="form.months"
                      required
                    />
                  </div>

                  <!-- auto calculation -->
                  <div v-if="form.paid_months > 0" class="mt-3">
                    <p class="fw-semibold text-primary mb-1">
                      Amount to Pay: ₱{{ computedAmountPaid }}
                    </p>
                    <p class="text-secondary mb-1">
                      Remaining Balance: ₱{{ computedBalance }}
                    </p>
                    <p class="text-muted">
                      Due Date: {{ computedDueDate }}
                    </p>
                  </div>
                </div>

                <!-- payment method -->
                <div class="mb-3 mt-3" v-if="form.action_type === 'rent'">
                  <label class="form-label">Payment Method:</label>
                  <select v-model="form.payment_method" class="form-select" required>
                    <option disabled value="">select</option>
                    <option value="cash">Cash</option>
                    <option value="qr">QR (GCash)</option>
                  </select>
                </div>

                <!-- qr result -->
                <div v-if="qrResult" class="text-center mt-3">
                  <p class="fw-semibold text-success">Scan to Pay (₱{{ qrResult.amount_due }})</p>
                  <img
                    :src="`http://localhost:3001${qrResult.qr_download}`"
                    class="img-fluid border p-2"
                    style="max-width: 250px;"
                  />

                  <!-- ✅ download button -->
                   <button
  @click="downloadQrCode"
  class="btn btn-outline-primary mt-3"
>
  <i class="bi bi-download me-2"></i> download qr code
</button>
                </div>

                <!-- buttons -->
                <div class="d-flex justify-content-center mt-4">
                  <button class="btn btn-secondary me-2" @click="selectedLocker = null">
                    Cancel
                  </button>
                  <button class="btn btn-primary" @click="submitLockerAction">
                    Confirm
                  </button>
                </div>
              </div>
            </template>

            <template v-else-if="selectedLocker.status === 'rented'">
              <p class="text-center">This locker has already been rented!</p>
              <div class="text-center">
                <button class="btn btn-primary" @click="selectedLocker = null">Okay</button>
              </div>
            </template>

            <template v-else-if="selectedLocker.status === 'reserved'">
              <p class="text-center">This locker is already reserved by someone!</p>
              <div class="text-center">
                <button class="btn btn-primary" @click="selectedLocker = null">Okay</button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- confirmation modal -->
<div
  v-if="showConfirmModal"
  class="modal fade show"
  style="display: block; background: rgba(0,0,0,0.5);"
  tabindex="-1"
  @click.self="showConfirmModal = false"
>
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content text-center p-4">
      <h5 class="text-primary fw-bold mb-3">confirm rental</h5>
      <p class="text-muted mb-4">
        are you sure you want to rent locker
        <strong>{{ selectedLocker?.locker_number }}</strong> for
        <strong>{{ form.months }}</strong>
        month<span v-if="form.months > 1">s</span>
        via <strong>{{ form.payment_method.toUpperCase() }}</strong>?
      </p>
      <div class="d-flex justify-content-center">
        <button class="btn btn-secondary me-3" @click="showConfirmModal = false">
          cancel
        </button>
        <button class="btn btn-primary" @click="confirmCashRent">
          yes, proceed
        </button>
      </div>
    </div>
  </div>
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
    <!-- loading overlay -->
<div
  v-if="isLoading"
  class="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
  style="background: rgba(255,255,255,0.8); z-index: 9999;"
>
  <div class="text-center">
    <div class="spinner-border text-primary mb-3" role="status"></div>
    <p class="fw-semibold text-primary">processing payment, please wait...</p>
  </div>
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
      showConfirmModal: false,
      currentPage: 1,
      lockerIcon,
      letters: ["A", "B", "C", "D"],
      form: {
        action_type: "",
        months: 1,
        paid_months: 0,
        payment_method: "",
      },
      qrResult: null,
      ratePerMonth: 60, // ₱60 per month
      isLoading: false,
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
    // 💡 auto calculations
    computedAmountPaid() {
      return this.form.paid_months * this.ratePerMonth;
    },
    computedBalance() {
      const remaining = this.form.months - this.form.paid_months;
      return remaining > 0 ? remaining * this.ratePerMonth : 0;
    },
    computedDueDate() {
      if (!this.form.paid_months) return null;
      const now = new Date();
      now.setMonth(now.getMonth() + this.form.paid_months);
      return now.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
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
      this.selectedLocker = locker;
      this.qrResult = null;
      this.form = { action_type: "", months: 1, paid_months: 0, payment_method: "" };
    },
    async submitLockerAction() {
      // check if rent + cash → show confirmation modal instead of alert
      if (
        this.form.action_type === "rent" &&
        this.form.payment_method === "cash" &&
        !this.qrResult
      ) {
        this.showConfirmModal = true;
        return;
      }

      // if qr already generated → redirect on second confirm
      if (this.qrResult && this.form.payment_method === "qr") {
        this.isLoading = true; // show loading overlay first

        // small async pause to let vue update before redirect
        await new Promise(resolve => setTimeout(resolve, 500));
      
        try {
          // optional: confirm payment on backend first
          await axios.post("http://localhost:3001/locker/payments", {
            locker_id: this.selectedLocker?.locker_id || this.qrResult.locker_id,
            payment_method: "qr",
          }, { withCredentials: true });

          // success message
          alert("payment confirmed successfully! redirecting...");
        } catch (error) {
          console.error("payment confirmation failed:", error);
          alert("failed to confirm payment, please try again.");
        } finally {
          setTimeout(() => {
            this.isLoading = false;
            this.selectedLocker = null;
            this.$router.push("/dashboard/user-rental"); // ✅ redirect after short delay
            }, 1500);
          }
          return;
        }
        
        if (!this.form.action_type) {
          alert("please choose an action (rent or reserve)");
          return;
        }

        // auto-set payment method for reserve
        if (this.form.action_type === "reserve") {
          this.form.payment_method = "cash";
        }

    try {
      const locker_id = this.selectedLocker.locker_id;
      let url = "";
      let payload = {};

      if (this.form.action_type === "rent") {
        url = "http://localhost:3001/locker/transaction";
        payload = {
          locker_id,
          months: this.form.months,
          paid_months: this.form.paid_months,
          payment_method: this.form.payment_method,
          action_type: "rent",
        };
      } else {
        url = "http://localhost:3001/locker/transaction";
        payload = {
          locker_id,
          payment_method: this.form.payment_method,
          action_type: "reserve",
        };
      }

      const response = await axios.post(url, payload, { withCredentials: true });


      // if (response.data.qr_download) {
      //   this.qrResult = response.data;
      //   // alert("qr code generated! scan it and click confirm again to proceed.");
      //   return;
      // }
      if (response.data.qr_download) {
        this.isLoading = true;
        const lockerId = this.selectedLocker.locker_id;

        // small delay for smoother UI feedback
        setTimeout(() => {
          this.selectedLocker = null;
          this.isLoading = false;

          // ✅ navigate to qr process page with query + qrData
          this.$router.push({
            path: `/qr-process/${lockerId}`,
            query: {
              months: this.form.months,
              paid: this.form.paid_months,
            },
            state: { qrData: response.data },
          });
        }, 1200);
        return;
      }

      alert(response.data.message || "locker action successful!");
      this.selectedLocker = null;
      this.fetchLockers();

      this.isLoading = true;
      setTimeout(() => {
        this.isLoading = false;
        this.$router.push("/dashboard/user-rental");
      }, 2000);
    } catch (error) {
      console.error("locker transaction failed:", error);
      const msg = error.response?.data?.error || "something went wrong.";
      alert(msg);
    }
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
    async downloadQrCode() {
      if (!this.qrResult?.qr_download) return;
      const imageUrl = `http://localhost:3001${this.qrResult.qr_download}`;
      const fileName = `locker_${this.selectedLocker.locker_number}_qr.png`;
      
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(url);

        // optional toast/alert
        alert("qr code downloaded successfully!");
      } catch (error) {
        console.error("error downloading qr code:", error);
        alert("failed to download qr code. please try again.");
      }
    },
    async confirmCashRent() {
      this.showConfirmModal = false;
      this.isLoading = true;

      try {
        const locker_id = this.selectedLocker.locker_id;
        const payload = {
          locker_id,
          months: this.form.months,
          paid_months: this.form.paid_months,
          payment_method: this.form.payment_method,
          action_type: "rent",
        };

        const response = await axios.post(
          "http://localhost:3001/locker/transaction",
          payload,
          { withCredentials: true }
        );

        const message = response.data.message || "rental successful!";
        console.log(message);

        setTimeout(() => {
          this.isLoading = false;
          this.selectedLocker = null;
          this.$router.push("/dashboard/user-rental");
        }, 1500);
      } catch (error) {
        console.error("locker rent failed:", error);
        this.isLoading = false;
        alert("failed to complete rental, please try again.");
      }
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