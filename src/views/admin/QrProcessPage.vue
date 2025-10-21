<template>
  <div class="container py-5 text-center">
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-3 fw-semibold text-primary">generating your qr code, please wait...</p>
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
        <input type="file" @change="onFileChange" class="form-control w-50 mx-auto mb-3" />
        <button @click="uploadReceipt" :disabled="!receiptFile" class="btn btn-success">
          upload receipt
        </button>
      </div>

      <div v-if="uploadMsg" class="alert alert-info mt-3 w-50 mx-auto">{{ uploadMsg }}</div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "QrProcessPage",
  data() {
    return {
      qrData: null,
      isLoading: true,
      receiptFile: null,
      uploadMsg: "",
    };
  },
  async mounted() {
    const lockerId = this.$route.params.locker_id;
    try {
      // simulate qr regeneration request
      const res = await axios.post("http://localhost:3001/locker/transaction", {
        locker_id: lockerId,
        months: 1, // ✅ default to 1 month (or user selection)
        paid_months: 0, // ✅ for new rental
        payment_method: "qr",
        action_type: "rent",
    }, { withCredentials: true });

      this.qrData = res.data;
    } catch (error) {
      console.error("qr generation failed:", error);
      this.uploadMsg = "failed to generate qr code.";
    } finally {
      setTimeout(() => (this.isLoading = false), 1500);
    }
  },
  methods: {
    onFileChange(e) {
      this.receiptFile = e.target.files[0];
    },
    async uploadReceipt() {
      if (!this.receiptFile) return;
      const formData = new FormData();
      formData.append("rental_id", this.qrData.rental_id || 1);
      formData.append("receipt", this.receiptFile);

      try {
        const res = await axios.post("http://localhost:3001/locker/payments", formData, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
        this.uploadMsg = res.data.message;
      } catch (err) {
        this.uploadMsg = "failed to upload receipt.";
      }
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
</style>