/*
  CUSTOMER CHAT FRONTEND
  ----------------------
  The chat UI works immediately with a demo reply.

  NEXT STEP:
  Replace USE_N8N = false with true and put your n8n Webhook URL below.

  Expected n8n response:
  {
    "reply": "Hello! How can I help you?"
  }

  You can also return:
  { "output": "..." }
*/

const USE_N8N = true;

const N8N_WEBHOOK_URL = "https://noni003.app.n8n.cloud/webhook/chatbot";

const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const chatMessages = document.getElementById("chatMessages");
const typing = document.getElementById("typing");
const sendBtn = document.getElementById("sendBtn");
const clearChat = document.getElementById("clearChat");
const attachBtn = document.getElementById("attachBtn");

const STORAGE_KEY = "customer_chat_messages_v1";

function getTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function addMessage(text, sender, save = true) {
  const row = document.createElement("div");
  row.className = `message-row ${sender === "customer" ? "customer-row" : "bot-row"}`;

  const bubble = document.createElement("div");
  bubble.className = `message ${sender === "customer" ? "customer-message" : "bot-message"}`;

  const p = document.createElement("p");
  p.textContent = text;

  const time = document.createElement("span");
  time.className = "message-time";
  time.textContent = getTime();

  bubble.appendChild(p);
  bubble.appendChild(time);
  row.appendChild(bubble);
  chatMessages.appendChild(row);

  chatMessages.scrollTop = chatMessages.scrollHeight;

  if (save) saveMessages();
}

function saveMessages() {
  const messages = [...chatMessages.querySelectorAll(".message")].map(el => ({
    sender: el.classList.contains("customer-message") ? "customer" : "bot",
    text: el.querySelector("p")?.textContent || ""
  }));

  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

function loadMessages() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");

  if (!saved || !saved.length) return;

  chatMessages.innerHTML = "";

  saved.forEach(item => addMessage(item.text, item.sender, false));
}

function setTyping(show) {
  typing.classList.toggle("hidden", !show);
  sendBtn.disabled = show;
  messageInput.disabled = show;
}

async function sendToN8N(message) {
  const payload = {
    message,
    sessionId: getSessionId(),
    timestamp: new Date().toISOString(),
    source: "website-chat",
    customer: {
      name: "Website Customer"
    }
  };

  const response = await fetch(N8N_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`n8n returned HTTP ${response.status}`);
  }

  const data = await response.json();

  return data.reply ?? data.output ?? data.message ?? "Thanks! We received your message.";
}

function getSessionId() {
  let id = localStorage.getItem("customer_chat_session_id");

  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : `session-${Date.now()}`;
    localStorage.setItem("customer_chat_session_id", id);
  }

  return id;
}

async function getBotReply(message) {
  if (USE_N8N) {
    return await sendToN8N(message);
  }

  // Demo response until n8n is connected.
  const lower = message.toLowerCase();

  if (lower.includes("hello") || lower.includes("hi")) {
    return "Hello! 👋 Thanks for contacting us. How can I help you?";
  }

  if (lower.includes("price") || lower.includes("cost")) {
    return "Thanks for asking. Our team can provide the latest pricing details.";
  }

  return "Thanks for your message! This is a demo reply. Connect the n8n webhook in script.js to enable your AI customer-support response.";
}

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = messageInput.value.trim();
  if (!message) return;

  addMessage(message, "customer");
  messageInput.value = "";

  setTyping(true);

  try {
    const reply = await getBotReply(message);
    addMessage(reply, "bot");
  } catch (error) {
    console.error(error);
    addMessage("Sorry, we couldn't process your message right now. Please try again.", "bot");
  } finally {
    setTyping(false);
    messageInput.focus();
  }
});

clearChat.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  chatMessages.innerHTML = "";
  addMessage("Hello! 👋 How can we help you today?");
});

attachBtn.addEventListener("click", () => {
  alert("File/image upload can be connected to n8n in the next step.");
});

loadMessages();
messageInput.focus();
