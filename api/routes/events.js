/**
 * routes/events.js
 * ------------------------------------------------------------
 * RESTful API endpoints for charity events.
 *
 * Endpoints:
 *   GET  /api/events              -> list active + upcoming events
 *   GET  /api/events/search       -> search events by date/location/category
 *   GET  /api/events/:id         -> single event detail
 *   GET  /api/categories         -> list all event categories
 * ------------------------------------------------------------
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../event_db');

// ------------------------------------------------------------
// GET /api/events
// Homepage: return all active, upcoming events with category
// and organisation names.
// ------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        e.event_id,
        e.title,
        e.description,
        e.event_date,
        e.start_time,
        e.end_time,
        e.location,
        e.address,
        e.city,
        e.ticket_price,
        e.goal_amount,
        e.raised_amount,
        e.image_url,
        c.category_id,
        c.category_name,
        o.org_id,
        o.org_name
      FROM events e
      JOIN categories c ON e.category_id = c.category_id
      JOIN organizations o ON e.org_id = o.org_id
      WHERE e.status = 'active'
        AND e.event_date >= CURDATE()
      ORDER BY e.event_date ASC
    `);

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (err) {
    console.error('GET /api/events error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch events' });
  }
});

// ------------------------------------------------------------
// GET /api/events/all
// Management page: return ALL events (any status) with
// category name, org name and is_custom flag.
// ------------------------------------------------------------
router.get('/all', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        e.event_id, e.title, e.description, e.event_date,
        e.start_time, e.end_time, e.location, e.address, e.city,
        e.ticket_price, e.goal_amount, e.raised_amount, e.status,
        e.image_url, e.is_custom,
        c.category_id, c.category_name,
        o.org_id, o.org_name
      FROM events e
      JOIN categories c ON e.category_id = c.category_id
      JOIN organizations o ON e.org_id = o.org_id
      ORDER BY e.event_date DESC
    `);
    res.status(200).json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    console.error('GET /api/events/all error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch all events' });
  }
});

// ------------------------------------------------------------
// GET /api/events/search
// Query params: date, location, category_id
// All optional — combine any number of filters.
// Uses prepared statements to prevent SQL injection.
// ------------------------------------------------------------
router.get('/search', async (req, res) => {
  try {
    const { date, location, category_id } = req.query;

    let sql = `
      SELECT
        e.event_id, e.title, e.description, e.event_date,
        e.start_time, e.end_time, e.location, e.address, e.city,
        e.ticket_price, e.goal_amount, e.raised_amount, e.image_url,
        c.category_id, c.category_name,
        o.org_id, o.org_name
      FROM events e
      JOIN categories c ON e.category_id = c.category_id
      JOIN organizations o ON e.org_id = o.org_id
      WHERE e.status = 'active'
        AND e.event_date >= CURDATE()
    `;

    const params = [];

    // Filter by exact date (YYYY-MM-DD)
    if (date) {
      sql += ' AND e.event_date = ?';
      params.push(date);
    }

    // Filter by location (city or location name — partial match)
    if (location) {
      sql += ' AND (e.city LIKE ? OR e.location LIKE ?)';
      params.push(`%${location}%`, `%${location}%`);
    }

    // Filter by category (exact category_id)
    if (category_id) {
      sql += ' AND e.category_id = ?';
      params.push(category_id);
    }

    sql += ' ORDER BY e.event_date ASC';

    const [rows] = await pool.query(sql, params);

    res.status(200).json({
      success: true,
      count: rows.length,
      filters: { date: date || null, location: location || null, category_id: category_id || null },
      data: rows
    });
  } catch (err) {
    console.error('GET /api/events/search error:', err.message);
    res.status(500).json({ success: false, message: 'Search failed. Please try again.' });
  }
});

// ------------------------------------------------------------
// GET /api/events/:id
// A3: Return event details + list of registrations (by date).
// The registrations list powers the "who is coming" section
// on the event detail page.
// ------------------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const eventId = parseInt(req.params.id, 10);

    if (isNaN(eventId) || eventId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid event ID' });
    }

    // 1) Event details
    const [rows] = await pool.query(`
      SELECT
        e.*,
        c.category_name,
        o.org_name,
        o.description AS org_description,
        o.contact_email,
        o.phone,
        o.website
      FROM events e
      JOIN categories c ON e.category_id = c.category_id
      JOIN organizations o ON e.org_id = o.org_id
      WHERE e.event_id = ?
    `, [eventId]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    const event = rows[0];

    // 2) Registrations for this event (newest first)
    const [regs] = await pool.query(`
      SELECT registration_id, full_name, email, ticket_quantity, registered_at
      FROM registrations
      WHERE event_id = ?
      ORDER BY registered_at DESC
    `, [eventId]);

    // 3) Total tickets sold for this event
    const [[stats]] = await pool.query(`
      SELECT COUNT(*) AS registration_count,
             COALESCE(SUM(ticket_quantity), 0) AS total_tickets
      FROM registrations WHERE event_id = ?
    `, [eventId]);

    res.status(200).json({
      success: true,
      data: event,
      registrations: regs,
      registration_stats: stats
    });
  } catch (err) {
    console.error('GET /api/events/:id error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch event details' });
  }
});

// ------------------------------------------------------------
// POST /api/events
// Add a new custom event (is_custom = 1).
// ------------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const {
      title, description, event_date, start_time, end_time,
      location, address, city, ticket_price, category_id, org_id,
      goal_amount, image_url
    } = req.body;

    // Basic validation
    if (!title || !description || !event_date || !location || !category_id) {
      return res.status(400).json({ success: false, message: 'Missing required fields: title, description, event_date, location, category_id' });
    }

    const [result] = await pool.query(`
      INSERT INTO events
        (org_id, category_id, title, description, event_date, start_time, end_time,
         location, address, city, ticket_price, goal_amount, status, image_url, is_custom)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, 1)
    `, [
      org_id || 1, category_id, title, description, event_date,
      start_time || null, end_time || null, location, address || null,
      city || 'Gold Coast', ticket_price || 0, goal_amount || 0, image_url || null
    ]);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: { event_id: result.insertId, is_custom: 1 }
    });
  } catch (err) {
    console.error('POST /api/events error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to create event' });
  }
});

// ------------------------------------------------------------
// PUT /api/events/:id
// A3: Admin update an existing event. Validates required fields.
// Works for both seed events and custom events.
// ------------------------------------------------------------
router.put('/:id', async (req, res) => {
  try {
    const eventId = parseInt(req.params.id, 10);
    if (isNaN(eventId) || eventId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid event ID' });
    }

    const {
      title, description, event_date, start_time, end_time,
      location, address, city, ticket_price, category_id, org_id,
      goal_amount, raised_amount, status, image_url, latitude, longitude
    } = req.body;

    if (!title || !event_date || !location) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, event_date, location'
      });
    }

    // Make sure the event exists first
    const [exists] = await pool.query('SELECT event_id FROM events WHERE event_id = ?', [eventId]);
    if (exists.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    await pool.query(`
      UPDATE events SET
        title = ?, description = ?, event_date = ?, start_time = ?, end_time = ?,
        location = ?, address = ?, city = ?, ticket_price = ?, category_id = ?, org_id = ?,
        goal_amount = ?, raised_amount = ?, status = ?, image_url = ?, latitude = ?, longitude = ?
      WHERE event_id = ?
    `, [
      title, description || null, event_date,
      start_time || null, end_time || null,
      location, address || null, city || 'Gold Coast',
      ticket_price || 0, category_id || 1, org_id || 1,
      goal_amount || 0, raised_amount || 0,
      status || 'active', image_url || null,
      latitude || null, longitude || null,
      eventId
    ]);

    res.status(200).json({ success: true, message: 'Event updated successfully' });
  } catch (err) {
    console.error('PUT /api/events/:id error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to update event' });
  }
});

// ------------------------------------------------------------
// DELETE /api/events/:id
// A2: Only custom events (is_custom = 1) can be deleted.
// A3: ALSO blocked if the event has any registrations (409).
// ------------------------------------------------------------
router.delete('/:id', async (req, res) => {
  try {
    const eventId = parseInt(req.params.id, 10);
    if (isNaN(eventId) || eventId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid event ID' });
    }

    // Check if event exists
    const [rows] = await pool.query('SELECT event_id, is_custom FROM events WHERE event_id = ?', [eventId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // A2 protection: initial seed data cannot be deleted
    if (rows[0].is_custom === 0) {
      return res.status(403).json({ success: false, message: 'Initial seed events cannot be deleted' });
    }

    // A3 protection: custom events with registrations cannot be deleted
    const [[regStats]] = await pool.query(
      'SELECT COUNT(*) AS n FROM registrations WHERE event_id = ?', [eventId]
    );
    if (regStats.n > 0) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete: this event has ${regStats.n} registration(s). Please contact an administrator.`
      });
    }

    await pool.query('DELETE FROM events WHERE event_id = ?', [eventId]);
    res.status(200).json({ success: true, message: 'Event deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/events/:id error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to delete event' });
  }
});

module.exports = router;
