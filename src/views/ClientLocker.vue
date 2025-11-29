<template><div class="container my-5 pb-5">
    <div class="stats d-flex justify-content-start gap-4 mb-4"><div><span class="dot bg-danger"></span> RENTED</div><div><span class="dot bg-warning"></span> RESERVED</div><div><span class="dot bg-success"></span> AVAILABLE</div><div><span class="dot bg-secondary"></span> PENDING</div></div>
    <div v-if="sortedLockers.length" class="row justify-content-center mb-5">
      <div class="col-md-6 text-center"><h5 class="fw-bold mb-3">{{ currentBatchLetters[0] }}</h5><div class="row g-3 justify-content-center"><div
            v-for="locker in leftBatch"
            :key="locker.locker_id"
            class="col-3 d-flex justify-content-center"
          ><div
              class="card locker-card shadow-sm"
              :class="{ 
                selected: selectedLocker && selectedLocker.locker_id === locker.locker_id,
                'is-rented': locker.status === 'rented' 
              }"
              @click="openLocker(locker)"
            ><div class="card-body text-center p-3"><div class="locker-icon-wrapper mb-2"><img :src="lockerIcon" alt="Locker" class="locker-icon" /></div><div class="locker-number">{{ locker.locker_number }}</div><div class="status-dot mt-1" :class="statusColor(locker.status)"></div></div></div></div></div></div>
      <div class="col-md-6 text-center"><h5 class="fw-bold mb-3">{{ currentBatchLetters[1] }}</h5><div class="row g-3 justify-content-center"><div
            v-for="locker in rightBatch"
            :key="locker.locker_id"
            class="col-3 d-flex justify-content-center"
          ><div
              class="card locker-card shadow-sm"
              :class="{ 
                selected: selectedLocker && selectedLocker.locker_id === locker.locker_id,
                'is-rented': locker.status === 'rented' 
              }"
              @click="openLocker(locker)"
            ><div class="card-body text-center p-3"><div class="locker-icon-wrapper mb-2"><img :src="lockerIcon" alt="Locker" class="locker-icon" /></div><div class="locker-number">{{ locker.locker_number }}</div><div class="status-dot mt-1" :class="statusColor(locker.status)"></div></div></div></div></div></div></div>
    <div v-else class="text-center text-muted py-5"><h5>No lockers found.</h5></div>
    <div
      v-if="selectedLocker"
      class="modal fade show"
      style="display: block; background: rgba(0,0,0,0.5);"
      tabindex="-1"
      @click.self="selectedLocker = null"
    ><div class="modal-dialog modal-dialog-centered"><div class="modal-content"><div class="modal-header" :class="modalHeaderClass"><h5 class="modal-title">Rent Locker {{ selectedLocker.locker_number }}</h5><button type="button" class="btn-close btn-close-white" @click="selectedLocker = null"></button></div><div class="modal-body"><template v-if="selectedLocker.status === 'available'"><div class="text-center mb-3"><p class="fw-semibold">Choose what you want to do:</p><select v-model="form.action_type" class="form-select mb-3"><option disabled value="">select</option><option value="rent">Rent</option><option value="reserve">Reserve</option></select>
                <div v-if="form.action_type === 'rent'">
                  <div class="mb-3 mt-3"><label class="form-label">Payment Method:</label><select v-model="form.payment_method" class="form-select" required><option disabled value="">select</option><option value="cash">Cash</option><option value="qr">QR (GCash)</option></select></div><div class="mb-3" v-if="form.payment_method === 'qr' || form.payment_method === 'cash'"><label class="form-label">Number of Months:</label><input
                      v-model.number="form.months"
                      type="number" 
                      class="form-control"
                      min="1"
                      max="12"
                      @input="validatePaidMonths"
                      required
                    /></div>
                  <div v-if="form.payment_method === 'qr'" class="mb-3"><label class="form-label">Months Paid:</label><input
                      v-model.number="form.paid_months"
                      type="number"
                      class="form-control"
                      :class="{ 'is-invalid': isPaidMonthsInvalid }"
                      min="0"
                      :max="form.months"
                      @input="validatePaidMonths"
                      required
                    />
                    <div v-if="isPaidMonthsInvalid" class="invalid-feedback d-block">{{ paidMonthsErrorMessage }}</div></div>
                  <div v-if="form.payment_method === 'qr' && form.paid_months > 0 && !isPaidMonthsInvalid" class="mt-3"><p class="fw-semibold text-primary mb-1">Amount to Pay: ₱{{ computedAmountPaid }}</p><p class="text-secondary mb-1">Remaining Balance: ₱{{ computedBalance }}</p><p class="text-muted">Due Date: {{ computedDueDate }}</p></div></div>
                <div v-if="qrResult" class="text-center mt-3"><p class="fw-semibold text-success">Scan to Pay (₱{{ qrResult.amount_due }})</p><img
                    :src="`http://localhost:3001${qrResult.qr_download}`"
                    class="img-fluid border p-2"
                    style="max-width: 250px;"
                  />
                  <button
                    @click="downloadQrCode"
                    class="btn btn-outline-primary mt-3"
                  ><i class="bi bi-download me-2"></i> download qr code</button></div>
                <div class="d-flex justify-content-center mt-4"><button class="btn btn-secondary me-2" @click="selectedLocker = null">Cancel</button><button 
                    class="btn btn-primary" 
                    @click="submitLockerAction"
                    :disabled="!isFormValid"
                  >Confirm</button></div></div></template><template v-else-if="['rented', 'reserved', 'pending'].includes(selectedLocker.status)"><p class="text-center fw-semibold fs-5" :class="{ 
                'text-danger': selectedLocker.status === 'rented',
                'text-warning': selectedLocker.status === 'reserved',
                'text-secondary': selectedLocker.status === 'pending'
              }">This locker is currently {{ selectedLocker.status.toUpperCase() }}</p><div class="text-center"><button class="btn btn-primary" @click="selectedLocker = null">Okay</button></div></template></div></div></div></div>
    <div
      v-if="showConfirmModal"
      class="modal fade show"
      style="display: block; background: rgba(0,0,0,0.5);"
      tabindex="-1"
      @click.self="showConfirmModal = false"
    ><div class="modal-dialog modal-dialog-centered"><div class="modal-content text-center pb-4 br-4"><div class="head bg-success p-3"><h5 class="text-light fw-bold">Confirm Rental</h5></div><p class="text-muted mb-4 mt-2">Are you sure you want to rent locker<strong>{{ selectedLocker?.locker_number }}</strong> for<strong>{{ form.months }}</strong>month<span v-if="form.months > 1">s</span>via <strong>{{ form.payment_method.toUpperCase() }}</strong>?</p><div class="d-flex justify-content-center"><button class="btn btn-secondary me-3" @click="cancelConfirm">Cancel</button><button class="btn btn-primary" @click="confirmCashRent">Proceed</button></div></div></div></div>
<div
  v-if="showLimitModal"
  class="modal fade show"
  style="display: block; background: rgba(0,0,0,0.3);"
  tabindex="-1"
><div class="modal-dialog modal-dialog-centered"><div class="modal-content text-center pb-4 br-4"><div class="head bg-primary p-3"><h5 class="text-light fw-bold mb-3">Limit Reached</h5></div><strong><p class="text-muted mt-2">{{ limitMessage }}</p></strong><div style="text-align: center;"><button class="btn btn-primary me-3" @click="closeLimitModal">OK</button></div></div></div></div>
    <div v-if="sortedLockers.length" class="pagination-footer"><button
        class="btn btn-outline-primary rounded-pill px-4 fw-semibold pagination-btn"
        @click="prevPage"
        :disabled="currentPage === 1"
      >‹ Prev</button><div class="d-flex gap-2"><button
          v-for="page in totalPages"
          :key="page"
          @click="goToPage(page)"
          class="page-circle"
          :class="{ active: currentPage === page }"
        >{{ page }}</button></div><button
        class="btn btn-outline-primary rounded-pill px-4 fw-semibold pagination-btn"
        @click="nextPage"
        :disabled="currentPage === totalPages"
      >Next ›</button></div>
    <div
      v-if="isLoading"
      class="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
      style="background: rgba(255,255,255,0.8); z-index: 9999;"
    ><div class="text-center"><div class="spinner-border text-primary mb-3" role="status"></div><p class="fw-semibold text-primary">processing payment, please wait...</p></div></div></div></template>

<script>
import axios from "axios";
import lockerIcon from "@/assets/locker-black.png";
const API_BASE_URL = "http://localhost:3001";

export default {
  name: "LockersPage",
  data() {
    return {
      lockers: [],
      selectedLocker: null,
      showConfirmModal: false,
      currentPage: 1,
      lockerIcon,
      letters: [],
      lockerBackup: null,
      showLimitModal: false,
      limitMessage: "",
      form: {
        action_type: "",
        months: 1,
        paid_months: 0,
        payment_method: "",
      },
      qrResult: null,
      ratePerMonth: 60,
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
    modalHeaderClass() {
      if (!this.selectedLocker) return 'bg-primary';
      const status = this.selectedLocker.status;
      switch (status) {
        case "rented": return "bg-danger";
        case "reserved": return "bg-warning";
        case "available": return "bg-success";
        case "pending": return "bg-secondary";
        default: return "bg-primary";
      }
    },
    leftBatch() {
      const firstLetter = this.currentBatchLetters[0];
      if (!firstLetter) return [];
      return this.sortedLockers.filter((l) =>
        l.locker_number?.startsWith(firstLetter)
      );
    },
    rightBatch() {
      const secondLetter = this.currentBatchLetters[1];
      if (!secondLetter) return [];
      return this.sortedLockers.filter((l) =>
        l.locker_number?.startsWith(secondLetter)
      );
    },
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
    isPaidMonthsInvalid() {
      if (this.form.payment_method !== 'qr') return false;
      return this.form.paid_months > this.form.months || this.form.paid_months < 0;
    },
    paidMonthsErrorMessage() {
      if (this.form.paid_months > this.form.months) {
        return `You cannot pay for more months (${this.form.paid_months}) than you're renting (${this.form.months})`;
      }
      if (this.form.paid_months < 0) {
        return 'Paid months cannot be negative';
      }
      return '';
    },
    isFormValid() {
      if (!this.form.action_type) return false;
      if (this.form.action_type === 'rent') {
        if (!this.form.payment_method) return false;
        if (this.form.months < 1) return false;
        if (this.form.payment_method === 'qr') {
          if (this.isPaidMonthsInvalid) return false;
          if (this.form.paid_months === 0) return false;
        }
      }
      return true;
    }
  },
  watch: {
    "form.payment_method"(newValue) {
      if (newValue === "cash") {
        this.form.paid_months = 0;
      }
    },
    "form.months"(newVal) {
      if (this.form.paid_months > newVal) {
        this.form.paid_months = newVal;
      }
    }
  },
  methods: {
    async fetchLockers() {
      try {
        const response = await axios.get(`${API_BASE_URL}/locker/lockers`);
        const data = response.data;
        this.lockers = Array.isArray(data)
          ? data
          : data.lockers || data.data || data.result || [];
        
        const uniqueLetters = new Set();
        this.lockers.forEach(locker => {
          if (locker.locker_number) {
            uniqueLetters.add(locker.locker_number.charAt(0).toUpperCase());
          }
        });
        
        this.letters = Array.from(uniqueLetters).sort(); 
        
        if (this.currentPage > this.totalPages) {
          this.currentPage = 1;
        }
        
      } catch (error) {
        console.error("Error fetching lockers:", error);
        this.lockers = [];
        this.letters = [];
      }
    },
    statusColor(status) {
      switch (status) {
        case "rented": return "bg-danger";
        case "reserved": return "bg-warning";
        case "pending": return "bg-secondary";
        case "available": return "bg-success";
        default: return "bg-secondary";
      }
    },
    openLocker(locker) {
      this.selectedLocker = locker;
      this.qrResult = null;
      this.form = { action_type: "", months: 1, paid_months: 0, payment_method: "" };
    },
    cancelConfirm() {
      this.showConfirmModal = false;
      this.selectedLocker = this.lockerBackup;
      this.lockerBackup = null;
    },
    closeLimitModal() {
      this.showLimitModal = false;
      this.limitMessage = "";
    },
    validatePaidMonths() {
      if (this.form.paid_months > this.form.months) this.form.paid_months = this.form.months;
      if (this.form.paid_months < 0) this.form.paid_months = 0;
    },
    async submitLockerAction() {
      // Hide locker modal if limit modal will appear
      this.selectedLockerForLimit = this.selectedLocker;
      
      // QR payment validation
      if (this.form.action_type === 'rent' && this.form.payment_method === 'qr') {
        if (this.form.paid_months > this.form.months) {
          this.limitMessage = `You cannot pay for more months (${this.form.paid_months}) than you're renting (${this.form.months})`;
          this.selectedLocker = null;
          this.showLimitModal = true;
          return;
        }
        if (this.form.paid_months === 0) {
          this.limitMessage = "Please enter how many months you want to pay now.";
          this.selectedLocker = null;
          this.showLimitModal = true;
          return;
        }
      }

      // Cash rent confirmation modal
      if (this.form.action_type === "rent" && this.form.payment_method === "cash" && !this.qrResult) {
        this.lockerBackup = this.selectedLocker;
        this.selectedLocker = null;
        this.showConfirmModal = true;
        return;
      }

      // QR payment processing
      if (this.qrResult && this.form.payment_method === "qr") {
        this.isLoading = true;
        await new Promise(resolve => setTimeout(resolve, 500));
        try {
          await axios.post(`${API_BASE_URL}/locker/payments`, {
            locker_id: this.selectedLocker?.locker_id || this.qrResult.locker_id,
            payment_method: "qr",
          }, { withCredentials: true });
          this.limitMessage ="Payment confirmed successfully! Redirecting...";
          this.selectedLocker = null;
          this.showLimitModal = true;
        } catch (error) {
          console.error("Payment confirmation failed:", error);
          this.limitMessage = "Failed to confirm payment, please try again.";
          this.selectedLocker = null;
          this.showLimitModal = true;
        } finally {
          setTimeout(() => {
            this.isLoading = false;
            this.selectedLocker = null;
            this.$router.push("/dashboard/user-rental");
          }, 1500);
        }
        return;
      }

      // Reserve action defaults to cash
      if (this.form.action_type === "reserve") this.form.payment_method = "cash";

      // Regular transaction
      try {
        const locker_id = this.selectedLocker.locker_id;
        let url = `${API_BASE_URL}/locker/transaction`;
        let payload = {};

        if (this.form.action_type === "rent") {
          payload = {
            locker_id,
            months: this.form.months,
            paid_months: this.form.paid_months,
            paid_amount: this.computedAmountPaid,
            balance: this.computedBalance,
            payment_method: this.form.payment_method,
            action_type: "rent",
          };
        } else {
          payload = {
            locker_id,
            payment_method: this.form.payment_method,
            action_type: "reserve",
          };
        }

        const response = await axios.post(url, payload, { withCredentials: true });

        if (response.data.qr_download) {
          this.isLoading = true;
          const lockerId = this.selectedLocker.locker_id;
          setTimeout(() => {
            this.selectedLocker = null;
            this.isLoading = false;
            this.$router.push({
              path: `/qr-process/${lockerId}`,
              query: { months: this.form.months, paid: this.form.paid_months },
              state: { qrData: response.data },
            });
          }, 1200);
          return;
        }

        alert(response.data.message || "Locker action successful!");
        this.selectedLocker = null;
        this.fetchLockers();
        this.isLoading = true;
        setTimeout(() => {
          this.isLoading = false;
          this.$router.push("/dashboard/user-rental");
        }, 2000);

      } catch (error) {
        console.error("Locker transaction failed:", error);
        const msg = error.response?.data?.error || "Something went wrong.";
        this.selectedLocker = null;
        this.limitMessage = msg;
        this.showLimitModal = true;
      }
    },
    nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; },
    prevPage() { if (this.currentPage > 1) this.currentPage--; },
    goToPage(page) { this.currentPage = page; },
    async downloadQrCode() {
      if (!this.qrResult?.qr_download) return;
      const imageUrl = `${API_BASE_URL}${this.qrResult.qr_download}`;
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
        alert("QR code downloaded successfully!");
      } catch (error) {
        console.error("Error downloading QR code:", error);
        alert("Failed to download QR code. Please try again.");
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
          paid_amount: this.computedAmountPaid,
          balance: this.computedBalance,
          payment_method: this.form.payment_method,
          action_type: "rent",
        };
        const response = await axios.post(`${API_BASE_URL}/locker/transaction`, payload, { withCredentials: true });
        this.limitMessage = response.data.message || "Rental successful!";
        this.showLimitModal = true;
        setTimeout(() => {
          this.isLoading = false;
          this.selectedLocker = null;
          this.$router.push("/dashboard/user-rental");
        }, 1500);
      } catch (error) {
        console.error("Locker rent failed:", error);
        this.isLoading = false;
        this.limitMessage = "Failed to complete rental, please try again.";
        this.showLimitModal = true;
      }
    },
  },
  mounted() {
    this.fetchLockers();
  },
};
</script>

<style scoped>.locker-card.is-rented{background-color:#d5d7da!important;opacity:.8;border-color:#ccc}
.locker-card.is-rented .locker-icon{filter:grayscale(100%)}
.stats{margin-bottom:60px}
.dot{display:inline-block;width:12px;height:12px;border-radius:50%;margin-right:4px}
.modal-header{color:rgb(238,238,238)}
.locker-card{width:90px;border:none;border-radius:10px;box-shadow:0 4px 6px rgba(0,0,0,.25)!important;transition:transform .2s ease;cursor:pointer;background:white}
.locker-card:hover{transform:translateY(-4px)}
.locker-icon-wrapper{border-bottom:3px solid #000;padding-bottom:6px;display:flex;justify-content:center}
.locker-icon{width:45px}
.locker-number{font-weight:bold;font-size:14px}
.status-dot{width:10px;height:10px;border-radius:50%;margin:0 auto}
.pagination-footer{position:relative;bottom:-150px;background:white;padding:10px 0;display:flex;justify-content:center;align-items:center;gap:15px}
.page-circle{width:38px;height:38px;border-radius:50%;border:2px solid #007bff;background-color:white;color:#007bff;font-weight:bold;font-size:15px;text-align:center;line-height:34px;cursor:pointer}
.page-circle.active{background-color:#007bff;color:white;box-shadow:0 0 8px rgba(0,123,255,.5)}
.modal-content{border-radius:12px}
</style>
