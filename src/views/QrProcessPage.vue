<template>
  <div class="container py-5 text-center">
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-3 fw-semibold text-primary">{{ loadingText }}</p>
    </div>

    <div v-else>
      <h3 class="text-primary fw-bold mb-3">payment via gcash</h3>
      <p class="text-muted">scan this qr code to pay your locker rental fee</p>

      <img
        v-if="qrData"
        :src="`http://localhost:3001${qrData.qr_download}`"
        alt="QR Code"
        class="img-fluid border p-3 rounded shadow-sm"
        style="max-width: 260px;"
      />

      <div v-if="qrData" class="mt-4">
        <button @click="downloadQrCode" class="btn btn-outline-primary">
          <i class="bi bi-download me-2"></i> download qr code
        </button>
      </div>

      <!-- upload receipt -->
      <div v-if="qrData" class="mt-5">
        <h5 class="fw-semibold mb-3">upload your payment receipt</h5>
        <input type="file" @change="onFileChange" accept="image/*" class="form-control w-50 mx-auto mb-3" />
        <button @click="uploadReceipt" :disabled="!receiptFile" class="btn btn-success">
          upload receipt
        </button>
      </div>

      <!-- <div v-if="uploadMsg" class="alert alert-info mt-3 w-50 mx-auto">{{ uploadMsg }}</div> -->
    </div>
    <!-- confirmation modal -->
     <div
     v-if="showModal"
     class="modal-overlay d-flex align-items-center justify-content-center"
     >
     <div class="modal-box text-center p-4 rounded shadow bg-white">
      <h5 class="text-primary fw-bold mb-3">receipt uploaded successfully!</h5>
      <p class="text-muted mb-3">{{ uploadMsg }}</p>
      <!-- <p class="text-muted mb-4">
        you will now be redirected to your rental status page.
      </p> -->
      <button class="btn btn-primary px-4" @click="confirmRedirect">okay</button>
    </div>
  </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "QrProcessPage",
  data() {
    return {
      rentalId: '',
      remarks: '',
      qrData: null,
      isLoading: true,
      loadingText: "generating your qr code, please wait...",
      receiptFile: null,
      receiptBase64: '',
      uploadMsg: "",
      showModal: false,
      months: 1,
      paid_months: 0,
      ratePerMonth: 60, 
    };
  },
  computed: {
  amountToPay() {
    return this.paid_months * this.ratePerMonth;
  },
},
//   async mounted() {
//   const lockerId = this.$route.params.locker_id;
//   const months = Number(this.$route.query.months) || 1;
//   const paid_months = Number(this.$route.query.paid) || 0;
//   const token = localStorage.getItem('token');

//   try {
//     const res = await axios.post(
//       "http://localhost:3001/locker/transaction",
//       {
//         locker_id: lockerId,
//         months,
//         paid_months,
//         payment_method: "qr",
//         action_type: "rent",
//       },
//       {
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );

//     this.qrData = res.data;
//     this.rentalId = res.data.rental_id;
//     this.months = months; // 👈 keep for later calculations
//   } catch (error) {
//     console.error("qr generation failed:", error);
//     this.uploadMsg = "failed to generate qr code.";
//   } finally {
//     setTimeout(() => (this.isLoading = false), 1500);
//   }
// },
mounted() {
  // get data from router query (passed from ClientLocker.vue)
  this.months = Number(this.$route.query.months) || 1;
  this.paid_months = Number(this.$route.query.paid) || 0;
  this.isLoading = true;

  // check if qr data was passed using router state
  if (history.state.qrData) {
    this.qrData = history.state.qrData;
    this.rentalId = history.state.qrData.rental_id;
    this.isLoading = false;
  } else {
    // fallback: fetch existing qr by locker id if page refreshed
    const lockerId = this.$route.params.locker_id;
    const token = localStorage.getItem("token");

    axios
      .get(`http://localhost:3001/locker/rental/${lockerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        this.qrData = res.data;
        this.rentalId = res.data.rental_id;
      })
      .catch((err) => {
        console.error("failed to load qr info:", err);
        this.uploadMsg = "failed to load qr details.";
      })
      .finally(() => {
        setTimeout(() => (this.isLoading = false), 1000);
      });
  }
},  
methods: {
    onFileChange(e) {
      const file = e.target.files[0];
      if (!file) return;

      this.receiptFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        // remove prefix like "data:image/png;base64,"
        this.receiptBase64 = reader.result.split(',')[1];
      };
      reader.readAsDataURL(file);
    },
  async uploadReceipt() {
  if (!this.receiptBase64) {
    alert("please select a receipt image first.");
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const formData = {
      rental_id: this.rentalId,
      receipt: this.receiptBase64, // base64 data only
      amount_paid_now: this.amountToPay,
    };

    const res = await axios.post('http://localhost:3001/locker/payments', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    this.uploadMsg = res.data.message;

    // ✅ show modal after successful upload
    this.showModal = true;
  } catch (err) {
    console.error('upload error:', err.response?.data || err.message);
    this.uploadMsg = 'failed to upload receipt. please try again.';
  }
},
confirmRedirect() {
    this.showModal = false;
    this.isLoading = true;
    this.loadingText = "redirecting to rental status...";
    this.uploadMsg = "";

    // add a short delay before redirecting
    setTimeout(() => {
    this.isLoading = false;
    // use replace to prevent going back to upload page
    this.$router.replace("/dashboard/user-rental");
  }, 1500);
},
  async downloadQrCode() {
  if (!this.qrData?.qr_download) return;

  const imageUrl = `http://localhost:3001${this.qrData.qr_download}`;
  const fileName = "locker_qr.png";

  try {
    // fetch image data as blob
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    // create temporary object url
    const objectUrl = window.URL.createObjectURL(blob);

    // create invisible <a> element and trigger download
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();

    // cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(objectUrl);

    alert("qr code downloaded successfully!");
  } catch (error) {
    console.error("error downloading qr code:", error);
    alert("failed to download qr code. please try again.");
  }
},
  },
};
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  z-index: 9999;
}
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 9999;
}
.modal-box {
  width: 90%;
  max-width: 400px;
  animation: fadeIn 0.3s ease;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.loading-overlay {
  transition: opacity 0.3s ease;
}
</style>