/**
 * event.js (A3 upgraded)
 * ------------------------------------------------------------
 * A2: Fetches event detail and renders the page.
 * A3 adds:
 *   - Register button now links to registration.html
 *   - Shows "Who's Coming" registration list (newest first)
 *   - Shows live weather forecast from Open-Meteo (bonus)
 * ------------------------------------------------------------
 */

const container = document.getElementById('event-detail');
const API_BASE = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', loadEventDetail);

function loadEventDetail() {
  const params = new URLSearchParams(window.location.search);
  const eventId = params.get('id');

  if (!eventId) {
    container.innerHTML = `
      <div class="error-state">
        <h3>No event selected</h3>
        <p>Please choose an event from the <a href="index.html">homepage</a> or <a href="search.html">search page</a>.</p>
      </div>`;
    return;
  }

  fetch(`${API_BASE}/events/${eventId}`)
    .then(response => {
      if (response.status === 404) throw new Error('Event not found');
      if (!response.ok) throw new Error('Server error');
      return response.json();
    })
    .then(result => {
      if (result.success) {
        // A3: result now includes data, registrations[], registration_stats
        renderDetail(result.data, result.registrations || [], result.registration_stats || {});
        // Bonus: fetch weather if the event has coordinates
        if (result.data.latitude && result.data.longitude) {
          loadWeather(result.data.latitude, result.data.longitude);
        }
      } else {
        throw new Error(result.message || 'Failed to load event');
      }
    })
    .catch(error => {
      console.error(error);
      container.innerHTML = `
        <div class="error-state">
          <h3>Event not found</h3>
          <p>The event you're looking for doesn't exist or has been removed.</p>
          <p><a href="index.html">← Back to Home</a></p>
        </div>`;
    });
}

function renderDetail(event, registrations, regStats) {
  const priceText = event.ticket_price == 0
    ? 'FREE'
    : '$' + parseFloat(event.ticket_price).toFixed(2);

  const goal = parseFloat(event.goal_amount) || 0;
  const raised = parseFloat(event.raised_amount) || 0;
  const percent = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;

  // --- A3: Build the "Who's Coming" registration list HTML ---
  let regListHtml = '';
  if (registrations.length === 0) {
    regListHtml = '<p style="color:var(--text-light);font-style:italic;">No registrations yet — be the first!</p>';
  } else {
    regListHtml = `
      <p style="margin-bottom:0.8rem;">
        <strong>${regStats.registration_count}</strong> person(s) registered,
        <strong>${regStats.total_tickets}</strong> tickets sold.
      </p>
      <ul style="list-style:none;padding:0;">
        ${registrations.map(r => `
          <li style="padding:0.5rem 0;border-bottom:1px dashed var(--border);display:flex;justify-content:space-between;align-items:center;">
            <span>👤 ${escapeHtml(r.full_name)}</span>
            <span style="color:var(--mist-blue-dark);font-size:0.9rem;">
              ${r.ticket_quantity} ticket(s) · ${formatDate(r.registered_at)}
            </span>
          </li>
        `).join('')}
      </ul>
    `;
  }

  container.innerHTML = `
    <img class="detail-image"
         src="${event.image_url || 'https://via.placeholder.com/900x400?text=Charity+Event'}"
         alt="${event.title}"
         onerror="this.src='https://via.placeholder.com/900x400?text=Event'">

    <div class="detail-header">
      <span class="category-badge ${getCategoryClass(event.category_name)}">${event.category_name}</span>
      <h1>${event.title}</h1>
      <p style="color:var(--text-light);font-size:1.1rem;">Organised by <strong>${event.org_name}</strong></p>
    </div>

    <div class="detail-grid">
      <div>
        <div class="detail-section section-orange">
          <h3>About This Event</h3>
          <p>${event.description}</p>
        </div>

        <div class="detail-section section-green">
          <h3>About the Charity</h3>
          <p>${event.org_description || ''}</p>
          <p style="margin-top:0.5rem;">
            📧 ${event.contact_email} &nbsp;|&nbsp; 📞 ${event.phone}
          </p>
        </div>

        <!-- A3: Who's Coming / Registration list -->
        <div class="detail-section section-lavender">
          <h3>👥 Who's Coming</h3>
          <div id="reg-list">${regListHtml}</div>
        </div>
      </div>

      <div>
        <div class="detail-section section-blue">
          <h3>Event Details</h3>
          <p>📅 <strong>Date:</strong> ${formatDate(event.event_date)}</p>
          <p>🕐 <strong>Time:</strong> ${formatTime(event.start_time)} – ${formatTime(event.end_time)}</p>
          <p>📍 <strong>Venue:</strong> ${event.location}</p>
          <p>🏠 <strong>Address:</strong> ${event.address}, ${event.city}</p>
          <p>🎟️ <strong>Ticket:</strong> <span style="color:#b88469;font-weight:700;font-size:1.1rem;">${priceText}</span></p>
          <!-- A3 bonus: weather slot (filled by loadWeather) -->
          <div id="weather-box" style="margin-top:0.8rem;padding-top:0.8rem;border-top:1px dashed var(--border);"></div>
        </div>
      </div>
    </div>

    <!-- Fundraising Goal + Register at bottom -->
    <div class="bottom-actions">
      <div class="detail-section fundraising-section section-purple">
        <h3>Fundraising Goal</h3>
        <p style="font-size:1.8rem;font-weight:700;color:#b8a9b8;margin-bottom:0.5rem;">${percent}%</p>
        <div class="progress-bar">
          <div class="fill" style="width:${percent}%;background:linear-gradient(90deg,#b8a9b8,#94a8b8);"></div>
        </div>
        <p style="margin-top:0.5rem;font-size:0.95rem;color:var(--text-light);">
          Raised $${formatMoney(raised)} of $${formatMoney(goal)}
        </p>
      </div>

      <!-- A3: Register button now links to registration.html -->
      <a href="registration.html?event_id=${event.event_id}" class="btn btn-register" style="text-decoration:none;display:inline-block;text-align:center;">
        ✨ Register Now ✨
      </a>
    </div>

    <div class="back-button-wrapper">
      <a href="javascript:history.back()" class="back-btn">
        ← Back to Events
      </a>
    </div>
  `;
}

// ------------------------------------------------------------
// A3 bonus: load weather from our /api/weather proxy
// ------------------------------------------------------------
async function loadWeather(lat, lon) {
  const box = document.getElementById('weather-box');
  try {
    const res = await fetch(`${API_BASE}/weather?latitude=${lat}&longitude=${lon}`);
    const json = await res.json();
    if (json.success) {
      box.innerHTML = `
        <p>🌤️ <strong>Weather forecast:</strong> ${json.temperature_c}°C, ${json.weather_label}</p>
      `;
    }
  } catch (e) {
    // Silent fail — weather is a bonus, don't break the page
    console.warn('Weather unavailable:', e.message);
  }
}

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
function formatDate(dateStr) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateStr).toLocaleDateString('en-AU', options);
}

function formatTime(timeStr) {
  if (!timeStr) return 'N/A';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h, 10);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${suffix}`;
}

function formatMoney(n) {
  return n.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function getCategoryClass(categoryName) {
  const name = categoryName.toLowerCase();
  if (name.includes('run')) return 'badge-fun-run';
  if (name.includes('gala')) return 'badge-gala-dinner';
  if (name.includes('auction')) return 'badge-silent-auction';
  if (name.includes('concert')) return 'badge-charity-concert';
  if (name.includes('fair')) return 'badge-community-fair';
  return 'badge-charity-concert';
}

// Prevent HTML injection from user-submitted names
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
