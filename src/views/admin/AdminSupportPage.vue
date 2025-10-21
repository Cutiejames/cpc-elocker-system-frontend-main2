<template>
  <div class="container-fluid py-4">
    <div class="row">
      <!-- Sidebar with tickets -->
      <div class="col-4 border-end">
        <h4 class="mb-3">Support Tickets</h4>

        <!-- Filter -->
        <div class="mb-3">
          <select v-model="filter" class="form-select">
            <option>All</option>
            <option>Pending</option>
            <option>Answered</option>
          </select>
        </div>

        <!-- Ticket list -->
        <ul class="list-group">
          <li
            v-for="ticket in filteredTickets"
            :key="ticket.ticket_id"
            class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
            :class="{ active: selectedTicket && selectedTicket.ticket_id === ticket.ticket_id }"
            @click="selectTicket(ticket)"
          >
            <div>
              <strong>{{ ticket.subject }}</strong><br />
              <small>Status: {{ ticket.status || ticket.ticket_status }}</small>
            </div>
            <!-- <span class="badge bg-primary rounded-pill">
              {{ ticket.priority || "N/A" }}
            </span> -->
          </li>
        </ul>
      </div>

      <!-- Messages -->
      <div class="col-8">
        <div v-if="!selectedTicket" class="text-center mt-5">
          <h5>Select a ticket to view messages</h5>
        </div>

        <div v-else>
          <h4 class="mb-3">
            Ticket #{{ selectedTicket.ticket_id }} - {{ selectedTicket.subject }}
          </h4>

          <div class="chat-box border rounded p-3 mb-3" style="height: 400px; overflow-y: auto;">
            <div v-if="loadingMessages" class="text-center text-muted">
              Loading messages...
            </div>

            <div v-else-if="messages.length === 0" class="text-center text-muted">
              No messages yet for this ticket.
            </div>

            <div v-else>
              <div v-for="msg in messages" :key="msg.id" class="mb-3">
                <div :class="msg.sender === 'Admin' ? 'text-end' : 'text-start'">
                  <div
                    :class="[ 'd-inline-block p-2 rounded',
                      msg.sender === 'Admin'
                        ? 'bg-primary text-white'
                        : 'bg-light border'
                    ]"
                    style="max-width: 70%;"
                  >
                    <!-- 🧑 Show the name or username -->
                    <strong>{{ msg.sender === 'Admin' ? 'Admin' : msg.name }}</strong>
                    <p class="mb-1">{{ msg.text }}</p>
                    <small class="text-muted">{{ formatDate(msg.date) }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Reply box -->
          <div class="input-group">
            <input
              v-model="newMessage"
              type="text"
              class="form-control"
              placeholder="Type your reply..."
              @keyup.enter="sendMessage"
            />
            <button class="btn btn-primary" @click="sendMessage">Send</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import axios from "axios";

const filter = ref("All");
const tickets = ref([]);
const selectedTicket = ref(null);
const messages = ref([]);
const newMessage = ref("");
const loadingMessages = ref(false);

const token = localStorage.getItem("token");

// 🧩 Map backend messages to include username or full name
const mapMessages = (data) =>
  data.map((msg) => ({
    id: msg.message_id || msg.id,
    text: msg.message,
    date: msg.created_at,
    sender: msg.role?.toLowerCase() === "admin" ? "Admin" : "User",
    name:
      msg.username ||
      `${msg.f_name || ""} ${msg.l_name || ""}`.trim() ||
      "Unknown User",
  }));

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleString();
};

// Fetch tickets
const fetchTickets = async () => {
  try {
    const res = await axios.get("http://localhost:3001/tickets", {
      headers: { Authorization: `Bearer ${token}` },
    });
    tickets.value = Array.isArray(res.data) ? res.data : res.data.data || [];
  } catch (err) {
    console.error("Error fetching tickets:", err);
    tickets.value = [];
  }
};

// Filtered tickets
const filteredTickets = computed(() => {
  if (filter.value === "All") return tickets.value;
  return tickets.value.filter(
    (t) => t.status === filter.value || t.ticket_status === filter.value
  );
});

// Select ticket
const selectTicket = async (ticket) => {
  selectedTicket.value = ticket;
  messages.value = [];
  loadingMessages.value = true;

  try {
    const res = await axios.get(
      `http://localhost:3001/tickets/${ticket.ticket_id}/messages`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const raw = Array.isArray(res.data) ? res.data : res.data.data || [];
    messages.value = mapMessages(raw);

    await nextTick();
    const chatBox = document.querySelector(".chat-box");
    if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
  } catch (err) {
    console.error("Error fetching messages:", err);
    messages.value = [];
  } finally {
    loadingMessages.value = false;
  }
};

// Send reply
const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedTicket.value) return;

  try {
    await axios.post(
      `http://localhost:3001/tickets/${selectedTicket.value.ticket_id}/reply`,
      {
        message: newMessage.value,
        role: "admin",
        created_at: new Date().toISOString(),
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Refresh messages
    await selectTicket(selectedTicket.value);
    newMessage.value = "";
  } catch (err) {
    console.error("Error sending message:", err);
  }
};

onMounted(fetchTickets);
</script>

<style scoped>
.chat-box {
  background: #f9f9f9;
}
.list-group-item.active {
  background-color: #0d6efd;
  color: white;
}
</style>
