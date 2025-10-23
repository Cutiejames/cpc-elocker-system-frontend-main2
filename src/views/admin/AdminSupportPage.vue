<template>
  <div class="container-fluid py-4">
    <div class="row g-0 w-100">
      <div v-if="!isMobile" class="col-4 border-end pe-3 d-flex flex-column">
        <h4 class="mb-3">Support Tickets</h4>

        <div class="mb-3">
          <select v-model="filter" class="form-select">
            <option>All</option>
            <option>Pending</option>
            <option>Answered</option>
          </select>
        </div>

        <div class="ticket-list-container flex-grow-1">
          <ul class="list-group mb-0">
            <li
              v-for="ticket in filteredTickets"
              :key="ticket.ticket_id"
              class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
              :class="{
                active: selectedTicket && selectedTicket.ticket_id === ticket.ticket_id,
              }"
              @click="selectTicket(ticket)"
            >
              <div>
                <strong>{{ ticket.subject }}</strong
                ><br />
                <small>Status: {{ ticket.status || ticket.ticket_status }}</small>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div v-if="!isMobile" class="col-8 ps-3 d-flex flex-column">
        <div
          v-if="!selectedTicket"
          class="text-center mt-5 flex-grow-1 d-flex align-items-center justify-content-center"
        >
          <h5>Select a ticket to view messages</h5>
        </div>

        <div v-else class="d-flex flex-column h-100">
          <h4 class="mb-3">
            Ticket #{{ selectedTicket.ticket_id }} - {{ selectedTicket.subject }}
          </h4>

          <div class="chat-box border rounded p-3 mb-3 flex-grow-1">
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
                    :class="[
                      'd-inline-block p-2 rounded',
                      msg.sender === 'Admin'
                        ? 'bg-primary text-white'
                        : 'bg-light border',
                    ]"
                    style="max-width: 70%;"
                  >
                    <strong>{{ msg.sender === 'Admin' ? 'Admin' : msg.name }}</strong>
                    <p class="mb-1">{{ msg.text }}</p>
                    <small
                      :class="{ 'text-muted': msg.sender !== 'Admin', 'text-white-50': msg.sender === 'Admin' }"
                    >
                      {{ formatDate(msg.date) }}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="input-group mt-auto">
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

      <div v-if="isMobile" class="col-12 d-flex flex-column p-0">
        <div v-if="!showMessagesMobile" class="flex-grow-1 w-100 p-3">
          <h4 class="mb-3">Support Tickets</h4>
          <div class="mb-3">
            <select v-model="filter" class="form-select">
              <option>All</option>
              <option>Pending</option>
              <option>Answered</option>
            </select>
          </div>
          <div class="ticket-list-mobile-container"> 
            <ul class="list-group w-100">
              <li
                v-for="ticket in filteredTickets"
                :key="ticket.ticket_id"
                class="list-group-item list-group-item-action w-100"
                @click="selectTicketMobile(ticket)"
              >
                <strong>{{ ticket.subject }}</strong>
                <small class="d-block">Status: {{ ticket.status || ticket.ticket_status }}</small>
              </li>
            </ul>
          </div>
        </div>

        <div
          v-else-if="selectedTicket"
          class="mobile-overlay d-flex justify-content-center align-items-center"
        >
          <div class="mobile-chat-container d-flex flex-column">
            <div class="d-flex align-items-center p-3 border-bottom flex-shrink-0">
              <button class="btn btn-light me-2" @click="showMessagesMobile = false">
                <i class="bi bi-arrow-left"></i>
              </button>
              <h6 class="mb-0 text-truncate">
                Ticket #{{ selectedTicket.ticket_id }} - {{ selectedTicket.subject }}
              </h6>
            </div>

            <div class="flex-grow-1 overflow-auto p-3 chat-box mobile-messages">
              <div v-if="loadingMessages" class="text-center text-muted py-3">
                Loading messages...
              </div>
              <div v-else-if="messages.length === 0" class="text-center text-muted py-3">
                No messages yet.
              </div>
              <div v-else>
                <div v-for="msg in messages" :key="msg.id" class="mb-3">
                  <div :class="msg.sender === 'Admin' ? 'text-end' : 'text-start'">
                    <div
                      :class="[
                        'd-inline-block p-2 rounded',
                        msg.sender === 'Admin'
                          ? 'bg-primary text-white'
                          : 'bg-light border',
                      ]"
                      style="max-width: 85%;"
                    >
                      <strong>{{ msg.sender === 'Admin' ? 'Admin' : msg.name }}</strong>
                      <p class="mb-1">{{ msg.text }}</p>
                       <small
                          :class="{ 'text-muted': msg.sender !== 'Admin', 'text-white-50': msg.sender === 'Admin' }"
                      >
                        {{ formatDate(msg.date) }}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="p-2 border-top mobile-reply flex-shrink-0">
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
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import axios from "axios";

const filter = ref("All");
const tickets = ref([]);
const selectedTicket = ref(null);
const messages = ref([]);
const newMessage = ref("");
const loadingMessages = ref(false);
const token = localStorage.getItem("token");

// --- Responsiveness State & Logic ---
const isMobile = ref(window.innerWidth <= 800);
const showMessagesMobile = ref(false);

const onResize = () => {
  isMobile.value = window.innerWidth <= 800;
  // If we switch to desktop, hide the mobile message view
  if (!isMobile.value) showMessagesMobile.value = false;
};

onMounted(() => window.addEventListener("resize", onResize));
onBeforeUnmount(() => window.removeEventListener("resize", onResize));
// ------------------------------------

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

// Select ticket (Used by Desktop and Mobile after selection)
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
    // Scroll logic for both desktop and mobile chat boxes
    const chatBox = document.querySelector(".chat-box");
    if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
  } catch (err) {
    console.error("Error fetching messages:", err);
    messages.value = [];
  } finally {
    loadingMessages.value = false;
  }
};

// Mobile-specific selection method
const selectTicketMobile = async (ticket) => {
  await selectTicket(ticket);
  showMessagesMobile.value = true;
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

    // Refresh messages and clear input
    await selectTicket(selectedTicket.value);
    newMessage.value = "";
    
    // Ensure the chat box scrolls to the bottom after sending a message
    await nextTick();
    const chatBox = document.querySelector(isMobile.value ? ".mobile-messages" : ".chat-box");
    if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
    
  } catch (err) {
    console.error("Error sending message:", err);
  }
};

onMounted(fetchTickets);
</script>

<style scoped>
/* 🧾 Ticket List */
.ticket-list-container {
  max-height: 600px;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding-right: 5px;
}

.ticket-list-container::-webkit-scrollbar {
  width: 6px;
}
.ticket-list-container::-webkit-scrollbar-thumb {
  background-color: #0d6efd;
  border-radius: 10px;
}
.ticket-list-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

/* 🧾 Chat Box */
.chat-box {
  height: 600px;
  overflow-y: auto;
  background: #f9f9f9;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 15px;
}

.chat-box::-webkit-scrollbar {
  width: 6px;
}
.chat-box::-webkit-scrollbar-thumb {
  background-color: #0d6efd;
  border-radius: 10px;
}
.chat-box::-webkit-scrollbar-track {
  background: #f1f1f1;
}

/* ✅ Adjusted layout to prevent sidebar overlap */
.container-fluid {
  margin-left: 90px; /* shifts content away from sidebar */
  max-width: calc(100% - 100px);
}

.row.g-0.w-100 {
  width: 98%;
  margin: 0 auto;
}

/* ✅ Make ticket list and chat area slightly narrower */
.col-4 {
  flex: 0 0 30%;
  max-width: 30%;
}

.col-8 {
  flex: 0 0 68%;
  max-width: 68%;
  margin-left: 2%;
}

/* Make chat box align a bit to the right */
.col-8 .chat-box {
  margin-left: 5px;
}

/* Highlight selected ticket */
.list-group-item.active {
  background-color: #0d6efd;
  color: white;
}

/* --- MOBILE STYLES (Max-width: 800px) --- */
@media (max-width: 800px) {
  /* Hide the desktop's two-column layout */
  .col-4.border-end,
  .col-8 {
    display: none !important;
  }

  /* Ensure mobile column is visible */
  .col-12 {
    display: flex !important;
    min-height: 100vh;
  }

  /* New style for mobile ticket list container - makes it scrollable */
  .ticket-list-mobile-container {
    max-height: calc(100vh - 150px);
    overflow-y: auto;
  }

  .list-group-item.list-group-item-action.w-100 {
    width: 95% !important;
    margin-left: auto;
    font-size: 0.9em;
  }

  .list-group {
    padding-right: 5px;
  }

  .ticket-list-mobile-container::-webkit-scrollbar {
    width: 6px;
  }
  .ticket-list-mobile-container::-webkit-scrollbar-thumb {
    background-color: #0d6efd;
    border-radius: 10px;
  }
  .ticket-list-mobile-container::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  .mobile-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: white;
    z-index: 2000;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .mobile-chat-container {
    background: #fff;
    width: 100%;
    height: 100vh;
    border-radius: 0;
    box-shadow: none;
    display: flex;
    flex-direction: column;
  }

  .chat-box.mobile-messages {
    height: auto;
    border: none !important;
    border-radius: 0;
    padding: 15px 10px;
  }

  .container-fluid {
    margin-left: 0;
    max-width: 100%;
  }
}
</style>