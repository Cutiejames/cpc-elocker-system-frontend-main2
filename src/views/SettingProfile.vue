<template>
  <div class="container py-4">
    <!-- Header section -->
    <div class="profile-header d-flex align-items-center mb-4 border-bottom pb-3">
      <div class="position-relative me-4">
        <img
          v-if="form.profile_pic_url"
          :src="form.profile_pic_url"
          alt="Profile"
          class="rounded-circle border"
          width="120"
          height="120"
        />
        <img
          v-else
          :src="form.profile_pic_url || require('@/assets/logo.png')"
          alt="Profile"
          class="rounded-circle border"
          width="120"
          height="120"
        />

        <!-- hidden file input -->
        <input
          type="file"
          ref="fileInput"
          accept="image/*"
          class="d-none"
          @change="handleFileChange"
        />

        <!-- upload photo button -->
        <button
          class="btn btn-light btn-sm position-absolute upload-btn"
          @click.prevent="triggerFileInput"
        >
          <i class="bi bi-camera-fill"></i>
        </button>
      </div>

      <div class="user-info">
        <h4 class="fw-bold mb-1">{{ form.first_name }} {{ form.last_name }}</h4>
        <div class="text-muted">{{ form.course }}</div>
      </div>
    </div>

    <!-- Form section -->
    <form @submit.prevent="updateProfile">
      <div class="row mb-3">
        <div class="col-md-6 mb-3">
          <label for="idNumber" class="form-label">Student ID:</label>
          <input
            type="text"
            id="idNumber"
            class="form-control"
            v-model="form.student_id"
            disabled
          />
        </div>
        <div class="col-md-6 mb-3">
          <label for="course" class="form-label">Course:</label>
          <input
            type="text"
            id="course"
            class="form-control"
            v-model="form.course"
            disabled
          />
        </div>
      </div>

      <div class="row mb-3">
        <div class="col-md-6 mb-3">
          <label for="firstName" class="form-label">First Name:</label>
          <input
            type="text"
            id="firstName"
            class="form-control"
            v-model="form.first_name"
            disabled
          />
        </div>
        <div class="col-md-6 mb-3">
          <label for="lastName" class="form-label">Last Name:</label>
          <input
            type="text"
            id="lastName"
            class="form-control"
            v-model="form.last_name"
            disabled
          />
        </div>
      </div>

      <div class="row mb-4">
        <div class="col-md-6 mb-3">
          <label for="currentPassword" class="form-label">
            Current Password:
          </label>
          <input
            type="password"
            id="currentPassword"
            class="form-control"
            placeholder="Enter current password"
            v-model="form.currentPassword"
          />
        </div>
        <div class="col-md-6 mb-3">
          <label for="newPassword" class="form-label">New Password:</label>
          <input
            type="password"
            id="newPassword"
            class="form-control"
            placeholder="Enter new password"
            v-model="form.newPassword"
          />
        </div>
      </div>

      <button type="submit" class="btn btn-primary px-4">Save</button>
    </form>

    <!-- Success / Error messages -->
    <div v-if="message" class="mt-3 alert" :class="messageClass">
      {{ message }}
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "SettingProfile",
  data() {
    return {
      form: {
        user_id: "",
        student_id: "",
        first_name: "",
        last_name: "",
        course: "",
        username: "",
        role: "",
        profile_picture: "",
        profile_pic_url: "",
        currentPassword: "",
        newPassword: "",
      },
      message: "",
      messageClass: "",
      previewImage: null,
    };
  },

//   computed: {
//   profileImageUrl() {
//     // load from backend route using user_id
//     return this.form.user_id
//       ? `http://localhost:3001/profile-pic/${this.form.user_id}`
//       : require("@/assets/logo.png");
//   },
// },

  async created() {
    try {
      const response = await axios.get("http://localhost:3001/settings", {
        withCredentials: true,
      });

      if (response.data.user) {
        const user = response.data.user;
        this.form = {
          ...this.form,
          user_id: user.user_id,
          student_id: user.student_id,
          first_name: user.first_name,
          last_name: user.last_name,
          course: user.course,
          username: user.username,
          role: user.role,
        };
        // set image url from backend
        this.form.profile_pic_url = `http://localhost:3001/profile-pic/${user.user_id}`;
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      this.message = "Failed to load profile information.";
      this.messageClass = "alert-danger";
    }
  },

  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click();
    },

    handleFileChange(event) {
      const file = event.target.files[0];
      if (!file) return;

      // preview before upload
      this.previewImage = URL.createObjectURL(file);

      const formData = new FormData();
      formData.append("profile_pic", file);

      axios
        .post("http://localhost:3001/upload-profile-pic", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        })
        .then((res) => {
          this.message = res.data.message || "Profile picture updated!";
          this.messageClass = "alert-success";

          // refresh image from backend
          this.form.profile_pic_url = `http://localhost:3001/profile-pic/${this.form.user_id}?t=${Date.now()}`;
          this.previewImage = null;
        })
        .catch((err) => {
          console.error("Error uploading:", err);
          this.message =
            err.response?.data?.error || "Failed to upload image.";
          this.messageClass = "alert-danger";
          this.previewImage = null;
        });
    },

async updateProfile() {
  try {
    // check if password fields are filled
    if (this.form.currentPassword && this.form.newPassword) {
      const passwordData = {
        oldPassword: this.form.currentPassword,
        newPassword: this.form.newPassword,
      };

      const res = await axios.post(
        "http://localhost:3001/settings/update-password",
        passwordData,
        { withCredentials: true }
      );

      this.message = res.data.message || "Password changed successfully!";
      this.messageClass = "alert-success";
      this.form.currentPassword = "";
      this.form.newPassword = "";
    } else {
      this.message = "Please fill in both password fields.";
      this.messageClass = "alert-warning";
    }
  } catch (error) {
    console.error("Error updating password:", error);
    this.message =
      error.response?.data?.error || "Failed to change password.";
    this.messageClass = "alert-danger";
  }
},
  },
};
</script>

<style scoped>
.container {
  max-width: 700px;
}

/* header layout */
.profile-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 1.5rem;
}

.user-info h4 {
  font-size: 1.5rem;
  margin: 0;
}

.user-info .text-muted {
  font-size: 1rem;
}

.rounded-circle {
  object-fit: cover;
  border: 2px solid #ccc;
}

/* camera upload button styling */
.upload-btn {
  bottom: 5px;
  right: 10px;
  border-radius: 50%;
  padding: 5px 7px;
  background-color: white;
  border: 1px solid #ccc;
  transition: 0.2s;
}

.upload-btn:hover {
  background-color: #f8f9fa;
  transform: scale(1.05);
}
</style>