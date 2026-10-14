/**
 * registration.js
 * ------------------------------------------------------------
 * Handles the event registration page:
 *   1. Loads event info from ?event_id=xxx
 *   2. Submits the registration form to POST /api/registrations
 *   3. Shows success / error message
 * ------------------------------------------------------------
 */

const API_BASE = 'http://localhost:3000/api';

// Get event_id from URL query string
const params = new URLSearchParams(window.location.search);
const eventId = params.get('event_id');

const eventInfoDiv = document.getElementById('reg-event-info');
const messageDiv = document.getElementById('reg-message');
const form = document.getElementById('registration-form');
const backBtn = document.getElementById('back-btn');

if (!eventId) {
  eventInfoDiv.innerHTML = '<p>Error: No event specified.</p>';
} else {
  loadEventInfo(eventId);
  backBtn.href = `event.html?id=${eventId}`;
}

// ------------------------------------------------------------
// Load event info to show on top of the form
// ------------------------------------------------------------
async function loadEventInfo(id) {
  try {
    const res = await fetch(`${API_BASE}/events/${id}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message);

    const e = json.data;
    eventInfoDiv.innerHTML = `
      <h2>${e.title}</h2>
      <p>📅 ${formatDate(e.event_date)} at ${e.start_time ? e.start_time.slice(0,5) : ''}</p>
      <p>📍 ${e.location}, ${e.city}</p>
      <p>💰 Ticket price: $${parseFloat(e.ticket_price).toFixed(2)}</p>
    `;
  } catch (err) {
    eventInfoDiv.innerHTML = `<p>Failed to load event: ${err.message}</p>`;
  }
}

// ------------------------------------------------------------
// Handle form submit
// ------------------------------------------------------------
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  messageDiv.innerHTML = '';

  const payload = {
    event_id: parseInt(eventId, 10),
    full_name: document.getElementById('full_name').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    ticket_quantity: parseInt(document.getElementById('ticket_quantity').value, 10)
  };

  try {
    const res = await fetch(`${API_BASE}/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();

    if (json.success) {
      messageDiv.innerHTML = `<div class="reg-message success">${json.message}</div>`;
      form.reset();
      // Redirect back to event detail after 2.5s
      setTimeout(() => {
        window.location.href = `event.html?id=${eventId}`;
      }, 2500);
    } else {
      messageDiv.innerHTML = `<div class="reg-message error">${json.message}</div>`;
    }
  } catch (err) {
    messageDiv.innerHTML = `<div class="reg-message error">Network error. Please try again.</div>`;
  }
});

// ------------------------------------------------------------
// Helper: format ISO date to readable string
// ------------------------------------------------------------
function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-AU', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}
