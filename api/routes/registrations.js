/**
 * routes/registrations.js
 * ------------------------------------------------------------
 * A3 endpoints for event ticket registrations.
 *
 * Endpoints:
 *   POST /api/registrations  -> submit a new ticket registration
 *   GET  /api/registrations?event_id=..  -> list registrations (admin)
 * ------------------------------------------------------------
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../event_db');

// ------------------------------------------------------------
// POST /api/registrations
// Body: { event_id, full_name, email, phone, ticket_quantity }
// Creates a registration. Rejects duplicates via the UNIQUE
// (email, event_id) constraint, and checks event capacity.
// ------------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const { event_id, full_name, email, phone, ticket_quantity } = req.body;

    // --- Validation ---
    if (!event_id || !full_name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: event_id, full_name, email'
      });
    }

    const qty = parseInt(ticket_quantity, 10) || 1;
    if (qty < 1 || qty > 10) {
      return res.status(400).json({
        success: false,
        message: 'ticket_quantity must be between 1 and 10'
      });
    }

    // --- Check the event exists and is active ---
    const [events] = await pool.query(
      'SELECT event_id, status, capacity FROM events WHERE event_id = ?',
      [event_id]
    );
    if (events.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    const event = events[0];
    if (event.status !== 'active') {
      return res.status(409).json({
        success: false,
        message: 'This event is not open for registration'
      });
    }

    // --- Check capacity: sum existing tickets + new qty ---
    const [[used]] = await pool.query(
      'SELECT COALESCE(SUM(ticket_quantity), 0) AS booked FROM registrations WHERE event_id = ?',
      [event_id]
    );
    if (event.capacity && used.booked + qty > event.capacity) {
      return res.status(409).json({
        success: false,
        message: `Only ${event.capacity - used.booked} ticket(s) left for this event`
      });
    }

    // --- Insert registration (UNIQUE constraint catches duplicates) ---
    try {
      const [result] = await pool.query(`
        INSERT INTO registrations (event_id, full_name, email, phone, ticket_quantity)
        VALUES (?, ?, ?, ?, ?)
      `, [event_id, full_name, email, phone || null, qty]);

      return res.status(201).json({
        success: true,
        message: 'Registration successful! We will email your tickets shortly.',
        data: { registration_id: result.insertId }
      });
    } catch (dupErr) {
      // ER_DUP_ENTRY = duplicate (email, event_id)
      if (dupErr.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          message: 'This email has already registered for this event'
        });
      }
      throw dupErr;
    }
  } catch (err) {
    console.error('POST /api/registrations error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to submit registration' });
  }
});

// ------------------------------------------------------------
// GET /api/registrations?event_id=..
// Admin endpoint: list registrations, optionally filtered by event.
// ------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const { event_id } = req.query;
    let sql = `
      SELECT r.registration_id, r.event_id, r.full_name, r.email,
             r.phone, r.ticket_quantity, r.registered_at,
             e.title AS event_title
      FROM registrations r
      JOIN events e ON r.event_id = e.event_id
    `;
    const params = [];
    if (event_id) {
      sql += ' WHERE r.event_id = ?';
      params.push(event_id);
    }
    sql += ' ORDER BY r.registered_at DESC';

    const [rows] = await pool.query(sql, params);
    res.status(200).json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    console.error('GET /api/registrations error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch registrations' });
  }
});

module.exports = router;
