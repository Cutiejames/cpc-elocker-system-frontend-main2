<template>
  <div class="container py-4">
    <h2 class="text-center fw-bold mb-4">ADMIN DASHBOARD</h2>

    <!-- Date Filter -->
    <div class="d-flex flex-wrap gap-3 mb-4">
      <div class="input-group" style="width: 300px">
        <span class="input-group-text">Start</span>
        <input type="date" v-model="startDate" class="form-control" />
      </div>
      <div class="input-group" style="width: 300px">
        <span class="input-group-text">End</span>
        <input type="date" v-model="endDate" class="form-control" />
      </div>
      <button class="btn btn-primary" @click="fetchAll">Apply</button>
      <button class="btn btn-danger" @click="downloadReport">Download PDF</button>
    </div>

    <!-- Top Summary Cards -->
    <div class="row g-4 mb-4">
      <div class="col-md-3" v-for="(item, key) in summary" :key="key">
        <div class="card text-center shadow-sm">
          <div class="card-body">
            <h6 class="card-title text-uppercase">{{ key.replace('_', ' ') }}</h6>
            <p class="fs-4 fw-bold">
              {{ item.value }}
              <span
                :class="{
                  'text-success': item.trend === 'up',
                  'text-danger': item.trend === 'down',
                  'text-secondary': item.trend === 'neutral'
                }"
              >
                <span v-if="item.trend === 'up'">▲</span>
                <span v-else-if="item.trend === 'down'">▼</span>
                <span v-else>→</span>
                {{ item.percent_change }}%
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="row g-4">
      <div class="col-md-6">
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title text-center">Rent Stats by Course</h5>
            <canvas id="courseChart"></canvas>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title text-center">Tenants (Rent vs Reserve)</h5>
            <canvas id="tenantsChart"></canvas>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title text-center">Income Per Day</h5>
            <canvas id="incomeChart"></canvas>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title text-center">Reservations Per Day</h5>
            <canvas id="reservationChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import axios from "axios"
import Chart from "chart.js/auto"

const summary = ref({})
const startDate = ref("2025-08-10")
const endDate = ref("2025-09-10")

let courseChart, tenantsChart, incomeChart, reservationChart

// Summary
const fetchSummary = async () => {
  try {
    const res = await axios.get(
      `http://localhost:3001/dashboard/summary?start_date=${startDate.value}&end_date=${endDate.value}`
    )
    summary.value = res.data.summary || {}
  } catch (err) {
    console.error("Error fetching summary:", err)
  }
}

// Rent by course
const fetchCourseStats = async () => {
  try {
    const res = await axios.get(
      `http://localhost:3001/dashboard/rent-by-course?start_date=${startDate.value}&end_date=${endDate.value}`
    )
    const raw = res.data.data || []
    const labels = raw.map(i => i.course_name)
    const rentValues = raw.map(i => Number(i.total_rent) || 0)
    const reserveValues = raw.map(i => Number(i.total_reserve) || 0)

    if (courseChart) courseChart.destroy()
    courseChart = new Chart(document.getElementById("courseChart"), {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "Rentals", data: rentValues, backgroundColor: "rgba(75,192,192,0.6)" },
          { label: "Reservations", data: reserveValues, backgroundColor: "rgba(255,99,132,0.6)" }
        ]
      }
    })
  } catch (err) {
    console.error("Error fetching rent by course:", err)
  }
}

// Tenants
const fetchTenants = async () => {
  try {
    const res = await axios.get(
      `http://localhost:3001/dashboard/tenants?start_date=${startDate.value}&end_date=${endDate.value}`
    )
    const raw = res.data.data || []
    const labels = raw.map(i => i.month)
    const rentValues = raw.map(i => Number(i.rent_count) || 0)
    const reserveValues = raw.map(i => Number(i.reserve_count) || 0)

    if (tenantsChart) tenantsChart.destroy()
    tenantsChart = new Chart(document.getElementById("tenantsChart"), {
      type: "line",
      data: {
        labels,
        datasets: [
          { label: "Rented", data: rentValues, borderColor: "green", fill: false },
          { label: "Reserved", data: reserveValues, borderColor: "blue", fill: false }
        ]
      }
    })
  } catch (err) {
    console.error("Error fetching tenants:", err)
  }
}

// Income
const fetchIncome = async () => {
  try {
    const res = await axios.get(
      `http://localhost:3001/dashboard/income?start_date=${startDate.value}&end_date=${endDate.value}`
    )
    const raw = res.data.data || []
    const labels = raw.map(i => new Date(i.date).toLocaleDateString())
    const values = raw.map(i => Number(i.daily_income) || 0)

    if (incomeChart) incomeChart.destroy()
    incomeChart = new Chart(document.getElementById("incomeChart"), {
      type: "line",
      data: {
        labels,
        datasets: [{ label: "Daily Income", data: values, borderColor: "orange", fill: false }]
      }
    })
  } catch (err) {
    console.error("Error fetching income:", err)
  }
}

// Reservations
const fetchReservations = async () => {
  try {
    const res = await axios.get(
      `http://localhost:3001/dashboard/reservations?start_date=${startDate.value}&end_date=${endDate.value}`
    )
    const raw = res.data.data || []
    const labels = raw.map(i => new Date(i.date).toLocaleDateString())
    const values = raw.map(i => Number(i.total_reservations) || 0)

    if (reservationChart) reservationChart.destroy()
    reservationChart = new Chart(document.getElementById("reservationChart"), {
      type: "line",
      data: {
        labels,
        datasets: [{ label: "Reservations", data: values, borderColor: "purple", fill: false }]
      }
    })
  } catch (err) {
    console.error("Error fetching reservations:", err)
  }
}

// Download PDF
const downloadReport = async () => {
  try {
    const res = await axios.get(
      `http://localhost:3001/dashboard/report/pdf?start_date=${startDate.value}&end_date=${endDate.value}`,
      { responseType: "blob" }
    )
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "dashboard-report.pdf")
    document.body.appendChild(link)
    link.click()
  } catch (err) {
    console.error("Error downloading report:", err)
  }
}

// Fetch all
const fetchAll = () => {
  fetchSummary()
  fetchCourseStats()
  fetchTenants()
  fetchIncome()
  fetchReservations()
}

onMounted(fetchAll)
</script>

<style scoped>
.card {
  border-radius: 12px;
}
.card-body {
  padding: 1rem;
}
canvas {
  max-height: 400px;
}
</style>