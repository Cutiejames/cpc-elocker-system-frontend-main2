<template>
<div class="container my-5 pb-5">
<div class="d-flex justify-content-end mb-3">
<button
class="btn btn-primary fw-semibold shadow-sm"
data-bs-toggle="modal"
data-bs-target="#addLockerModal"
>
<i class="bi bi-plus-lg me-1"></i> Add Locker
</button>
</div>
<div
class="modal fade"
id="addLockerModal"
tabindex="-1"
aria-labelledby="addLockerModalLabel"
aria-hidden="true"
>
<div class="modal-dialog modal-dialog-centered">
<div class="modal-content">
<div class="modal-header bg-primary text-white">
<h5 class="modal-title fw-bold" id="addLockerModalLabel">Add New Locker</h5>
<button type="button" class="btn-close" data-bs-dismiss="modal"></button>
</div>
<div class="modal-body">
<div class="mb-3">
<label class="form-label">Locker Number</label>
<input
v-model.trim="newLocker.locker_number"
class="form-control"
placeholder="e.g. A01"
/>
</div>
<div class="mb-3">
<label class="form-label">Location</label>
<input
v-model="newLocker.location"
class="form-control"
placeholder="e.g. Ground Floor"
/>
</div>
<div class="mb-3">
<label class="form-label">Remarks</label>
<input
v-model="newLocker.remarks"
class="form-control"
placeholder="Optional notes"
/>
</div>
</div>
<div class="modal-footer">
<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
<button
type="button"
class="btn btn-primary"
@click="addLocker"
>
<i class="bi bi-check-circle me-1"></i> Save Locker
</button>
</div>
</div>
</div>
</div>

<div
v-if="showWarningModal"
class="modal fade show"
style="display: block; background: rgba(0,0,0,0.5);"
tabindex="-1"
@click.self="showWarningModal = false"
>
<div class="modal-dialog modal-dialog-centered modal-md">
<div class="modal-content">
<div class="modal-header bg-primary text-white">
<h5 class="modal-title fw-bold">Action Required</h5>
<button type="button" class="btn-close" @click="showWarningModal = false"></button>
</div>
<div class="modal-body text-center">
<i class="bi bi-exclamation-triangle-fill text-primary" style="font-size: 3rem;"></i>
<p class="mt-3 mb-0">{{ warningMessage }}</p>
</div>
<div class="modal-footer justify-content-center">
<button type="button" class="btn btn-primary" @click="showWarningModal = false">
Got It
</button>
</div>
</div>
</div>
</div>
<div
v-if="showSuccessModal || showTransactionSuccessModal"
class="modal fade show"
style="display: block; background: rgba(0,0,0,0.2);"
tabindex="-1"
@click.self="closeSuccessModal"
>
<div class="modal-dialog modal-dialog-centered modal-md" style="border-radius: 10px;">
<div class="modal-content">
<div class="modal-header bg-success text-white">
<h5 class="modal-title fw-bold">Success!</h5>
<button type="button" class="btn-close" @click="closeSuccessModal"></button>
</div>
<div class="modal-body text-center">
<i class="bi bi-check-circle-fill text-success" style="font-size: 3rem;"></i>
<p v-if="showSuccessModal" class="mt-3 mb-0">
Locker {{ newLockerNumberSuccess }} added successfully!
</p>
<p v-else-if="showTransactionSuccessModal" class="mt-3 mb-0">
{{ transactionMessage }}
</p>
</div>
<div class="modal-footer justify-content-center">
<button type="button" class="btn btn-success" @click="closeSuccessModal">
OK
</button>
</div>
</div>
</div>
</div>
<div class="stats d-flex justify-content-start gap-4 mb-4">
<div><span class="dot bg-danger"></span> RENTED</div>
<div><span class="dot bg-warning"></span> RESERVED</div>
<div><span class="dot bg-success"></span> AVAILABLE</div>
<div><span class="dot bg-secondary"></span> PENDING</div>
</div>
<div v-if="sortedLockers.length" class="row justify-content-center mb-5 position-relative">
<div
v-if="hoveredLocker && ['rented', 'reserved', 'pending'].includes(hoveredLocker.status)"
class="custom-hover-box"
:style="{ left: hoverBoxPosition.left, top: hoverBoxPosition.top }"
>
<p class="mb-1 fw-bold text-dark text-truncate" style="font-size: 13px;">
{{ hoveredLocker.status.toUpperCase() }}
</p>
<p class="mb-1 text-dark text-truncate">Name: {{ hoveredLocker.student_name }}</p>
<p class="mb-1 text-dark text-truncate">Course: {{ hoveredLocker.course_name }}</p>
<p class="mb-0 text-muted small">ID: {{ hoveredLocker.student_id_number }}</p>
</div>
<div class="col-md-6 text-center">
<h5 class="fw-bold mb-3">{{ currentBatchLetters[0] }}</h5>
<div class="row g-3 justify-content-center">
<div
v-for="locker in leftBatch"
:key="locker.locker_id"
class="col-3 d-flex justify-content-center"
@mouseenter="showHoverBox($event, locker)"
@mouseleave="hideHoverBox"
>
<div
class="card locker-card shadow-sm"
:class="{
'selected': selectedLocker && selectedLocker.locker_id === locker.locker_id,
'is-occupied': ['rented', 'reserved',].includes(locker.status)
}"
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
<div class="col-md-6 text-center" v-if="currentBatchLetters[1]">
<h5 class="fw-bold mb-3">{{ currentBatchLetters[1] }}</h5>
<div class="row g-3 justify-content-center">
<div
v-for="locker in rightBatch"
:key="locker.locker_id"
class="col-3 d-flex justify-content-center"
@mouseenter="showHoverBox($event, locker)"
@mouseleave="hideHoverBox"
>
<div
class="card locker-card shadow-sm"
:class="{
'selected': selectedLocker && selectedLocker.locker_id === locker.locker_id,
'is-occupied': ['rented', 'reserved'].includes(locker.status)
}"
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
<div v-else class="text-center text-muted py-5">
<h5>No lockers found.</h5>
</div>
<div
v-if="selectedLocker"
class="modal fade show"
style="display: block; background: rgba(0,0,0,0.5);"
tabindex="-1"
@click.self="selectedLocker = null"
>
<div class="modal-dialog modal-dialog-centered">
<div class="modal-content">
<div class="modal-header" :class="modalHeaderClass">
<h5 class="modal-title">
Rent Locker {{ selectedLocker.locker_number }}
</h5>
<button type="button" class="btn-close" @click="selectedLocker = null"></button>
</div>
<div class="modal-body">
<template v-if="selectedLocker.status === 'available'">
<form @submit.prevent="submitLockerAction">
<div class="mb-3">
<label class="form-label fw-semibold">Student ID</label>
<input
v-model.trim="form.student_id"
type="text"
class="form-control"
placeholder="Enter Student ID"
required
/>
</div>
<div class="mb-3">
<label class="form-label fw-semibold">Number of Months to Rent:</label>
<input
v-model.number="form.months"
type="number"
class="form-control"
min="1"
required
/>
</div>
<div class="mb-3">
<label class="form-label fw-semibold">Months Paid:</label>
<input
v-model.number="form.paid_months"
type="number"
class="form-control"
min="0"
:max="form.months"
required
/>
</div>
<div class="mt-4 p-3 border rounded bg-light">
<p class="mb-1 text-muted">Rate: ₱{{ ratePerMonth }} per month</p>
<p class="mb-1 text-primary fw-semibold">
Amount Paid: ₱{{ computedAmountPaid }}
</p>
<p class="fw-bold text-danger fs-5 mb-0">
Remaining Balance: ₱{{ computedBalance }}
</p>
<p v-if="form.paid_months > 0" class="text-muted mt-2">
Next Due Date: {{ computedDueDate }}
</p>
<p class="text-success fw-bold mt-2 mb-0">Payment Method: CASH</p>
</div>
<div class="d-flex justify-content-center mt-4">
<button type="button" class="btn btn-secondary me-2" @click="selectedLocker = null">Cancel</button>
<button type="submit" class="btn btn-primary">Confirm Rent</button>
</div>
</form>
</template>
<template v-else-if="['rented', 'reserved', 'pending'].includes(selectedLocker.status)">
<h5 class="text-center fw-bold mb-3" :class="{
'text-danger': selectedLocker.status === 'rented',
'text-warning': selectedLocker.status === 'reserved',
'text-secondary': selectedLocker.status === 'pending', /* Use text-secondary for pending color */
}">
This locker is currently {{ selectedLocker.status.toUpperCase() }}
</h5>
<div v-if="selectedLocker.renter_info" class="p-3 border rounded bg-light">
<h6 class="fw-bold mb-2">Student Details:</h6>
<p class="mb-1">
<i class="bi bi-person-circle me-2"></i>
Name: **{{ selectedLocker.renter_info.student_name }}**
</p>
<p class="mb-1">
<i class="bi bi-book me-2"></i>
Course: {{ selectedLocker.renter_info.course_name }}
</p>
<p class="mb-0 text-muted">
<i class="bi bi-hash me-2"></i>
ID: {{ selectedLocker.renter_info.student_id_number }}
</p>
</div>
<div class="text-center mt-4">
<button class="btn btn-primary" @click="selectedLocker = null">Close</button>
</div>
</template>
</div>
</div>
</div>
</div>
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
import * as bootstrap from "bootstrap"; // Import Bootstrap JS

// Placeholder for API base URL (Ensure this matches your actual backend URL)
const API_BASE_URL = "http://localhost:3001";

export default {
name: "LockersPage",
data() {
return {
lockers: [],
activeRentals: [],
newLocker: { locker_number: "", location: "", remarks: "" },
selectedLocker: null,
currentPage: 1,
lockerIcon,
// Initialize letters as an empty array or default, it will be populated in fetchLockers
letters: [],
form: { student_id: "", months: 1, paid_months: 1 },
ratePerMonth: 60,
hoveredLocker: null,
hoverBoxPosition: { left: '0px', top: '0px' },
// NEW STATE FOR SUCCESS MODAL
showSuccessModal: false, // For Add Locker success
newLockerNumberSuccess: "",
// ADDED STATE FOR TRANSACTION SUCCESS
showTransactionSuccessModal: false, // For Rent/Renew success <-- ADDED
transactionMessage: "", // Message for Rent/Renew Success <-- ADDED
// ADDED STATE FOR WARNING/ERROR MODAL
showWarningModal: false,
warningMessage: "",
};
},
computed: {
// FIX: Remove side effect. This computed property only calculates the total pages
totalPages() {
// The 'letters' array is now correctly populated in fetchLockers
return Math.ceil(this.letters.length / 2);
},
currentBatchLetters() {
const index = (this.currentPage - 1) * 2;
// Returns an array of the two letters for the current page, e.g., ["A", "B"]
return [this.letters[index], this.letters[index + 1]];
},
modalHeaderClass() {
if (!this.selectedLocker) return 'bg-primary';
const status = this.selectedLocker.status;
switch (status) {
case "rented": return "bg-danger";
case "reserved": return "bg-warning";
case "available": return "bg-success";
case "pending": return "bg-secondary text-white";
default: return "bg-primary";
}
},
sortedLockers() {
if (!Array.isArray(this.lockers)) return [];
// Merge locker data with active rental data
const lockersWithRentals = [...this.lockers].map(locker => {
const rental = this.activeRentals.find(r => r.locker_id === locker.locker_id);
if (rental) {
// Check flags to determine the specific occupied status
if (rental.is_pending) {
locker.status = "pending"; // 🟢 SET PENDING STATUS
} else if (rental.is_reserved) {
locker.status = "reserved";
} else {
// Default active rental status
locker.status = "rented";
}
// Add student info for hover box and modal (used by openLocker)
locker.student_name = `${rental.f_name} ${rental.l_name}`;
locker.student_id_number = rental.stud_id;
locker.course_name = rental.course_name;
}
return locker;
});
return lockersWithRentals.sort((a, b) => {
const letterA = a.locker_number?.charAt(0).toUpperCase() || "";
const letterB = b.locker_number?.charAt(0).toUpperCase() || "";
const numA = parseInt(a.locker_number?.slice(1)) || 0;
const numB = parseInt(b.locker_number?.slice(1)) || 0;
// Secondary sort by number if letters are the same
if (letterA === letterB) return numA - numB;
// Primary sort by letter
return letterA.localeCompare(letterB);
});
},
leftBatch() {
return this.sortedLockers.filter(l => l.locker_number?.startsWith(this.currentBatchLetters[0]));
},
rightBatch() {
return this.sortedLockers.filter(l => l.locker_number?.startsWith(this.currentBatchLetters[1]));
},
computedAmountPaid() {
return this.form.paid_months * this.ratePerMonth;
},
computedBalance() {
return this.form.months * this.ratePerMonth - this.form.paid_months * this.ratePerMonth;
},
computedDueDate() {
if (this.form.paid_months <= 0) return "N/A";
const now = new Date();
now.setMonth(now.getMonth() + this.form.paid_months);
return now.toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
},
},
methods: {
// Custom hover box methods
showHoverBox(event, locker) {
// Show hover box for both 'rented' and 'reserved' status
if (['rented', 'reserved'].includes(locker.status)) {
this.hoveredLocker = locker;
const targetRect = event.currentTarget.getBoundingClientRect();
const container = this.$el.querySelector('.row.justify-content-center');
const containerRect = container ? container.getBoundingClientRect() : { left: 0, top: 0 };
// Adjust for custom-hover-box width (200px) and height/padding (approx 100px)
const left = targetRect.left - containerRect.left + (targetRect.width / 2) - 100;
const top = targetRect.top - containerRect.top - 110;
this.hoverBoxPosition = {
left: `${left}px`,
top: `${top}px`
};
} else {
this.hoveredLocker = null;
}
},
hideHoverBox() {
this.hoveredLocker = null;
},
// FIX: Logic to populate 'this.letters' moved here
async fetchLockers() {
try {
const [lockerRes, tenantRes] = await Promise.all([
axios.get(`${API_BASE_URL}/locker/lockers`),
axios.get(`${API_BASE_URL}/tenant-info`)
]);
this.lockers = Array.isArray(lockerRes.data) ? lockerRes.data : lockerRes.data.lockers || [];
this.activeRentals = Array.isArray(tenantRes.data) ? tenantRes.data : tenantRes.data.tenants || [];
// 🟢 CORRECTED LOGIC: Calculate and set letters here
const uniqueLetters = new Set(
this.lockers
.map(l => l.locker_number?.charAt(0).toUpperCase())
.filter(l => l)
);
this.letters = Array.from(uniqueLetters).sort();
} catch (error) {
console.error("Error fetching lockers or tenants:", error);
this.lockers = [];
this.activeRentals = [];
this.letters = []; // Also reset letters on failure
}
},
async addLocker() {
this.newLocker.locker_number = this.newLocker.locker_number.trim();
if (!this.newLocker.locker_number) {
        // 1. ADDED: Show modal for empty field validation
        this.warningMessage = "Please enter a locker number.";
        this.showWarningModal = true;
        return;
    }
// Close the "Add Locker" modal manually before sending the request
const addLockerModalEl = document.getElementById('addLockerModal');
const addLockerModal = bootstrap.Modal.getInstance(addLockerModalEl) || new bootstrap.Modal(addLockerModalEl);
addLockerModal.hide();
try {
const newLockerNumber = this.newLocker.locker_number;
 await axios.post(`${API_BASE_URL}/add-locker`, this.newLocker, { withCredentials: true });
// 🟢 SUCCESS LOGIC
this.newLockerNumberSuccess = newLockerNumber;
this.showSuccessModal = true;
// Reset form after successful submission
this.newLocker = { locker_number: "", location: "", remarks: "" };
// Refresh the list and letters array
await this.fetchLockers();
// Navigate to the correct page
const newLetter = newLockerNumber.charAt(0).toUpperCase();
const letterIndex = this.letters.indexOf(newLetter);
if (letterIndex !== -1) {
const newPageIndex = Math.ceil((letterIndex + 1) / 2);
this.goToPage(newPageIndex);
}
} catch (error) {
console.error("Add Locker Error:", error);
        // 2. ADDED: Show modal for API error/failure
        this.warningMessage = error.response?.data?.error || error.response?.data?.message || "Failed to add locker due to an unknown error.";
        this.showWarningModal = true;
}
},
// ... in methods: { ...
closeSuccessModal() {
    this.showSuccessModal = false;
    this.showTransactionSuccessModal = false;
    this.newLockerNumberSuccess = "";
    this.transactionMessage = "";
      document.querySelectorAll(".modal-backdrop").forEach(bd => bd.remove());
  document.body.classList.remove("modal-open");
  document.body.style.overflow = "auto";
},
// ...
statusColor(status) {
switch (status) {
case "rented": return "bg-danger";
case "reserved": return "bg-warning";
case "available": return "bg-success";
case "pending": return "bg-secondary";
default: return "bg-secondary";
}
},
openLocker(locker) {
// 1. Reset form and set selected locker
this.selectedLocker = locker;
this.form = { student_id: "", months: 1, paid_months: 1 };
if (['rented', 'reserved', 'pending'].includes(locker.status)) { // 🟢 ADDED 'pending'
const rental = this.activeRentals.find(r => r.locker_id === locker.locker_id);
if (rental) {
this.selectedLocker.renter_info = {
student_name: `${rental.f_name} ${rental.l_name}`,
student_id_number: rental.stud_id,
course_name: rental.course_name,
};
} else {
this.selectedLocker.renter_info = null;
}
} else {
this.selectedLocker.renter_info = null;
}
},
// ... in methods: { ...
async submitLockerAction() {
    this.form.student_id = this.form.student_id.trim();
    
    // --- VALIDATION FAILURES (Modal stays open for correction) ---
    if (!this.form.student_id) {
        this.warningMessage = "Please enter a Student ID.";
        this.showWarningModal = true;
        return;
    }
    if (this.form.months < 1 || this.form.paid_months < 0 || this.form.paid_months > this.form.months) {
        this.warningMessage = "Please check the months to rent and months paid fields are valid.";
        this.showWarningModal = true;
        return;
    }
    
    // --- TRANSACTION ATTEMPT ---
    try {
        const locker_id = this.selectedLocker.locker_id;
        const url = `${API_BASE_URL}/locker/transaction`;
        const payload = { locker_id, student_id: this.form.student_id, months: this.form.months, paid_months: this.form.paid_months, action_type: "rent", payment_method: "Cash" };
        const response = await axios.post(url, payload, { withCredentials: true });

        // ✅ CRITICAL FIX: Close the underlying transaction modal first
        this.selectedLocker = null; 
        
        // SUCCESS LOGIC (Replaces old alert)
        this.transactionMessage = response.data.message || `Locker ${this.selectedLocker.locker_number} rented successfully!`;
        this.showTransactionSuccessModal = true;
        
        await this.fetchLockers();
        
    } catch (error) {
        console.error("Locker transaction failed:", error.response?.data || error.message);
        
        // ✅ CRITICAL FIX: Close the underlying transaction modal first
        this.selectedLocker = null; 
        
        // WARNING LOGIC
        this.warningMessage = error.response?.data?.error || error.response?.data?.message || "Something went wrong during rental assignment.";
        this.showWarningModal = true;
    }
},
// ...
nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; },
prevPage() { if (this.currentPage > 1) this.currentPage--; },
goToPage(page) { this.currentPage = page; },
},
mounted() {
this.fetchLockers();
},
};
</script>

<style scoped>
/* Custom Hover Box Styling */
.row.justify-content-center {
/* Important for positioning the custom-hover-box relative to the whole grid */
position: relative;
}
.custom-hover-box {
position: absolute;
width: 200px;
background-color: white; /* Dark background */
color: white;
border-radius: 6px;
padding: 10px;
z-index: 1000; /* Ensure it stays on top of other elements */
box-shadow: 0 4px 8px rgba(0,0,0,0.4);
pointer-events: none; /* Allows clicks to pass through */
font-size: 14px;
line-height: 1.2;
}
.custom-hover-box p {
margin-bottom: 3px !important;
}
.modal-header{
color:rgb(236, 236, 236);
border-radius: 0px;
}
.custom-hover-box::after {
/* Simple arrow pointing down to the locker */
content: "";
position: absolute;
bottom: -8px;
left: 50%;
transform: translateX(-50%);
border-width: 8px 8px 0;
border-style: solid;
border-color: #343a40 transparent transparent transparent;
}
/* End Custom Hover Box Styling */
.locker-card.is-occupied {
background-color: rgb(224, 218, 218) !important;
border-color: #dee2e6;
}
.card-body.is-occupied {
opacity: 0.6;
filter: grayscale(100%);
}
/* Existing Styles */
.stats { margin-bottom: 60px; }
.dot { display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 4px; }
.locker-card { width: 90px; border: none; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.25)!important; transition: transform 0.2s ease; cursor: pointer; background: white; }
.locker-card:hover { transform: translateY(-4px); }
.locker-icon-wrapper { border-bottom: 3px solid #000; padding-bottom: 6px; display: flex; justify-content: center; }
.locker-icon { width: 45px; }
.locker-number { font-weight: bold; font-size: 14px; }
.status-dot { width: 10px; height: 10px; border-radius: 50%; margin: 0 auto; }
.pagination-footer { position: relative; bottom: -150px; background: white; padding: 10px 0; display: flex; justify-content: center; align-items: center; gap: 15px; }
.page-circle { width: 38px; height: 38px; border-radius: 50%; border: 2px solid #007bff; background-color: white; color: #007bff; font-weight: bold; font-size: 15px; text-align: center; line-height: 34px; cursor: pointer; }
.page-circle.active { background-color: #007bff; color: white; box-shadow: 0 0 8px rgba(0,123,255,0.5); }
@media (max-width: 768px) {
.stats { justify-content: flex-start; gap: 1.2rem; }
.locker-card { max-width: 90px; }
.locker-icon { width: 34px; }
.locker-number { font-size: 12px; }
.page-circle { width: 34px; height: 34px; font-size: 13px; line-height: 30px; }
.modal-content { border-radius: 0.5rem; }
}
</style>
