<template>
  <div class="container py-4">
    <h2 class="text-center fw-bold mb-4 text-primary">RENTAL STATUS</h2>

    <div class="row justify-content-center">
      <div
        v-for="(rental, index) in rentals"
        :key="index"
        class="col-md-6 col-lg-5 d-flex justify-content-center"
      >
        <div class="card rental-card shadow-bottom border-0 m-3">
          <div
            class="card-body d-flex justify-content-between align-items-center text-center"
          >
            <!-- LEFT SIDE -->
            <div class="left-section w-50">
              <div class="d-flex flex-column align-items-center mb-3">
                <img
                  :src="profile.profile_pic_url || require('@/assets/user.png')"
                  alt="Profile"
                  class="rounded-circle border mb-2"
                  width="70"
                  height="70"
                />
              </div>

              <div>
                <p class="mb-1"><strong>Student ID:</strong> {{ rental.stud_id }}</p>
                <p class="mb-1">
                  <strong>Student Name:</strong> {{ rental.f_name }} {{ rental.l_name }}
                </p>
                <p class="mb-1"><strong>Course:</strong> {{ rental.course_name }}</p>
                <p class="mb-1"><strong>Email:</strong> {{ rental.email }}</p>
              </div>
            </div>

            <!-- RIGHT SIDE -->
            <div class="right-section w-50">
              <div class="mb-2">
                <i class="bi bi-hdd-stack fs-3 text-secondary"></i>
                <div class="fw-bold">{{ rental.locker_number }}</div>
              </div>

              <div>
                <p class="mb-1">
                  <strong>Rental Start:</strong><br />{{ formatDate(rental.start_date) }}
                </p>
                <p class="mb-3">
                  <strong>Rental End:</strong><br />{{ formatDate(rental.due_date) }}
                </p>
              </div>

              <div class="d-flex flex-column align-items-center gap-2">
                <button class="btn btn-primary btn-sm">Payment History</button>
                <button class="btn btn-outline-primary btn-sm">Renew Locker</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- NO DATA -->
      <div v-if="rentals.length === 0" class="text-muted text-center mt-5">
        <i class="bi bi-info-circle"></i> No rental records found
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "RentStatus",
  data() {
    return {
      rentals: [],
      profile: {
        user_id: "",
        profile_pic_url: "",
      },
    };
  },
  methods: {
    async fetchRentals() {
      try {
        const res = await axios.get("http://localhost:3001/rent-status", {
          withCredentials: true,
        });
        this.rentals = res.data;
      } catch (err) {
        console.error("Error fetching rent status:", err);
      }
    },

    async fetchProfile() {
      try {
        const res = await axios.get("http://localhost:3001/settings", {
          withCredentials: true,
        });
        if (res.data.user) {
          this.profile.user_id = res.data.user.user_id;
          this.profile.profile_pic_url = `http://localhost:3001/profile-pic/${res.data.user.user_id}`;
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    },

    formatDate(dateStr) {
      if (!dateStr) return "—";
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
  },
  mounted() {
    this.fetchRentals();
    this.fetchProfile();
  },
};
</script>


<style scoped>
/* Card style */
.rental-card {
  width: 550px;
  border-radius: 14px;
  background-color: #fff;
  padding: 18px 20px;
  margin: 15px; /* ✅ add proper space between cards */
}

/* Soft bottom shadow only */
.shadow-bottom {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

.card-body {
  font-size: 14px;
  color: #333;
}

.left-section,
.right-section {
  text-align: center;
}

/* Buttons */
.btn {
  border-radius: 20px;
  font-weight: 500;
  padding: 6px 18px;
}

.btn-primary {
  background-color: #007bff;
  border: none;
}

.btn-outline-primary {
  border: 1px solid #007bff;
  color: #007bff;
}

.btn-outline-primary:hover {
  background-color: #007bff;
  color: #fff;
}

/* Image */
img {
  object-fit: cover;
  border: 2px solid #ddd;
}

/* Add small hover lift */
.rental-card:hover {
  transform: translateY(-4px);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.18);
}
</style>