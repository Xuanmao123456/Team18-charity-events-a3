-- ============================================================
-- PROG2002 Assignment 3: Charity Events Database
-- Database: charityevents_db
-- Team 18: Suping Li (24832368) & Xinya Su (24832685)
-- Description: Full schema with registrations table, seed data
--              and latitude/longitude for Weather API bonus.
-- ============================================================

DROP DATABASE IF EXISTS charityevents_db;
CREATE DATABASE charityevents_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE charityevents_db;

-- ============================================================
-- Table: organizations
-- Purpose: Stores charitable organisations hosting the events
-- ============================================================
CREATE TABLE organizations (
    org_id          INT AUTO_INCREMENT PRIMARY KEY,
    org_name        VARCHAR(150) NOT NULL,
    description     TEXT,
    contact_email   VARCHAR(100) NOT NULL,
    phone           VARCHAR(30),
    website         VARCHAR(200),
    address         VARCHAR(255),
    city            VARCHAR(100) NOT NULL DEFAULT 'Gold Coast',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Table: categories
-- Purpose: Classifies events into types (fun run, gala, etc.)
-- ============================================================
CREATE TABLE categories (
    category_id     INT AUTO_INCREMENT PRIMARY KEY,
    category_name  VARCHAR(100) NOT NULL,
    description     TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Table: events
-- Purpose: Main table holding all charity events
-- Status: active = shown on home page, suspended = hidden,
--         past = event_date < CURDATE()
-- NEW in A3: latitude / longitude for Weather API,
--            is_custom flag protects initial seed data.
-- ============================================================
CREATE TABLE events (
    event_id        INT AUTO_INCREMENT PRIMARY KEY,
    org_id          INT NOT NULL,
    category_id     INT NOT NULL,
    title           VARCHAR(200) NOT NULL,
    description     TEXT NOT NULL,
    event_date      DATE NOT NULL,
    start_time      TIME,
    end_time        TIME,
    location        VARCHAR(200) NOT NULL,
    address         VARCHAR(255),
    city            VARCHAR(100) NOT NULL DEFAULT 'Gold Coast',
    ticket_price    DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    capacity        INT,
    goal_amount     DECIMAL(12,2) DEFAULT 0.00,
    raised_amount   DECIMAL(12,2) DEFAULT 0.00,
    status          ENUM('active','suspended','past') DEFAULT 'active',
    image_url       VARCHAR(255),
    -- A3 bonus: coordinates for Open-Meteo weather lookup
    latitude        DECIMAL(9,6),
    longitude       DECIMAL(9,6),
    -- A2/A3: 0 = protected seed data, 1 = user-created custom record
    is_custom       TINYINT(1) NOT NULL DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organizations(org_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE RESTRICT,
    INDEX idx_event_date (event_date),
    INDEX idx_city (city),
    INDEX idx_category (category_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Table: registrations  (NEW in A3)
-- Purpose: Tracks who has registered for / purchased tickets
--          to each event. One user can register for multiple
--          events, but each (email, event_id) pair is unique.
-- ============================================================
CREATE TABLE registrations (
    registration_id  INT AUTO_INCREMENT PRIMARY KEY,
    event_id         INT NOT NULL,
    full_name        VARCHAR(150) NOT NULL,
    email            VARCHAR(100) NOT NULL,
    phone            VARCHAR(30),
    ticket_quantity  INT NOT NULL DEFAULT 1,
    registered_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- A user cannot register twice for the same event
    UNIQUE KEY uq_email_event (email, event_id),
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    INDEX idx_event (event_id),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Seed: Organizations
-- ============================================================
INSERT INTO organizations (org_name, description, contact_email, phone, website, address, city) VALUES
('Heart Foundation Australia',
 'The Heart Foundation funds lifesaving heart research and supports people living with heart disease across Australia.',
 'info@heartfoundation.org.au', '+61 7 5555 1001', 'https://www.heartfoundation.org.au',
 'Level 1, 123 Merthon St, South Brisbane', 'Brisbane'),

('Cancer Council Queensland',
 'Cancer Council Queensland works to beat cancer through research, prevention and support for patients and families.',
 'contact@cancerqld.org.au', '+61 7 5555 2002', 'https://www.cancerqld.org.au',
 '555 Wickham Terrace, Spring Hill', 'Brisbane'),

('RSPCA Queensland',
 'RSPCA Queensland is the leading animal welfare charity, protecting animals from cruelty and finding them loving homes.',
 'happy@rspcaqld.org.au', '+61 7 5555 3003', 'https://www.rspcaqld.org.au',
 'Main Road, Wacol', 'Brisbane'),

('Starlight Childrens Foundation',
 'Starlight brightens the lives of seriously ill children and young people through hospital programs and wish granting.',
 'hello@starlight.org.au', '+61 7 5555 4004', 'https://www.starlight.org.au',
 'Suite 2, 88 Pacific Highway, Southport', 'Gold Coast'),

('Beyond Blue',
 'Beyond Blue provides support and promotes mental health awareness to help everyone in Australia achieve their best possible mental health.',
 'support@beyondblue.org.au', '+61 7 5555 5005', 'https://www.beyondblue.org.au',
 'Level 3, 200 Creek Street, Surfers Paradise', 'Gold Coast');

-- ============================================================
-- Seed: Categories
-- ============================================================
INSERT INTO categories (category_name, description) VALUES
('Fun Run',       'Community running and walking events to raise fitness and funds.'),
('Gala Dinner',   'Formal evening dinners with auctions, entertainment and fine dining.'),
('Silent Auction','Online or live silent auctions featuring donated goods and experiences.'),
('Charity Concert','Live music performances featuring local and national artists.'),
('Community Fair','Family-friendly outdoor fairs with stalls, rides and activities.');

-- ============================================================
-- Seed: Events (12 events, with lat/lng for Weather API)
-- ============================================================
INSERT INTO events
(org_id, category_id, title, description, event_date, start_time, end_time,
 location, address, city, ticket_price, capacity, goal_amount, raised_amount, status, image_url,
 latitude, longitude, is_custom) VALUES

-- 1. Heart Foundation - Gold Coast Fun Run (Southport Broadwater)
(1, 1, 'Gold Coast Half Marathon & Fun Run',
 'Join thousands of runners along the beautiful Southport Broadwater. Choose from 5km, 10km or half marathon distances. Every dollar helps fund vital heart research.',
 '2026-10-18', '06:30:00', '11:00:00',
 'Southport Broadwater Parklands', 'Marine Parade, Southport', 'Gold Coast',
 45.00, 5000, 250000.00, 128500.00, 'active',
 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800',
 -27.960000, 153.410000, 0),

-- 2. Cancer Council - Pink Ribbon Gala (Broadbeach)
(2, 2, 'Pink Ribbon Gala Dinner 2026',
 'An unforgettable evening of fine dining, live entertainment and auctions supporting breast cancer research. Black tie optional. Includes three-course meal and matched beverages.',
 '2026-11-07', '18:30:00', '23:30:00',
 'Jupiters Hotel & Ballroom', '1 Casino Drive, Broadbeach', 'Gold Coast',
 180.00, 300, 150000.00, 62000.00, 'active',
 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800',
 -28.030000, 153.430000, 0),

-- 3. RSPCA - Silent Auction (Burleigh Heads)
(3, 3, 'Paws for Hope Silent Auction',
 'Bid on luxury getaways, dining experiences and pet-related prizes. 100% of proceeds help rescue and rehome animals across Queensland. Online bidding opens 2 weeks prior.',
 '2026-10-05', '10:00:00', '20:00:00',
 'Online + In-person at Burleigh Pavilion', '43 Goodwin Terrace, Burleigh Heads', 'Gold Coast',
 25.00, 500, 50000.00, 18750.00, 'active',
 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800',
 -28.100000, 153.450000, 0),

-- 4. Starlight - Charity Concert (Burleigh Heads)
(4, 4, 'Starlight Sunset Concert Night',
 'An evening under the stars featuring top Australian bands. All profits bring joy to seriously ill children in Gold Coast hospitals. Food trucks and market stalls from 5pm.',
 '2026-10-25', '17:00:00', '22:30:00',
 'Burleigh Heads State School Oval', '1753 Gold Coast Highway, Burleigh Heads', 'Gold Coast',
 65.00, 2000, 80000.00, 34200.00, 'active',
 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
 -28.095000, 153.450000, 0),

-- 5. Beyond Blue - Community Fair (Surfers Paradise)
(5, 5, 'Mental Health Awareness Community Fair',
 'A free family day promoting mental wellbeing with yoga, art therapy workshops, live music and information stalls. Entry by gold coin donation. All welcome.',
 '2026-11-15', '09:00:00', '15:00:00',
 'Civic Centre Lawn, Surfers Paradise', '13 Bundall Road, Surfers Paradise', 'Gold Coast',
 0.00, 1000, 30000.00, 9800.00, 'active',
 'https://images.unsplash.com/photo-1533106418989-88406c7cc4af?w=800',
 -27.995000, 153.425000, 0),

-- 6. Cancer Council - Brisbane Fun Run (South Bank)
(2, 1, 'Brisbane River Run for Cancer',
 'Run or walk along the Brisbane River from South Bank to Kangaroo Point. 5km and 10km courses. Register as an individual or team. Includes event t-shirt and post-run breakfast.',
 '2026-10-11', '06:00:00', '10:30:00',
 'South Bank Piazza', 'South Bank, South Brisbane', 'Brisbane',
 55.00, 4000, 300000.00, 175600.00, 'active',
 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800',
 -27.480000, 153.020000, 0),

-- 7. Heart Foundation - Brisbane Gala (South Brisbane)
(1, 2, 'Heart of Brisbane Ball',
 'A black-tie gala at the Brisbane Convention Centre honouring heart disease survivors and raising funds for research. Includes gourmet dinner, live auction and celebrity guest speakers.',
 '2026-11-21', '19:00:00', '23:59:00',
 'Brisbane Convention & Exhibition Centre', 'Cnr Grey St & Glenelg St, South Brisbane', 'Brisbane',
 250.00, 500, 200000.00, 98000.00, 'active',
 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
 -27.475000, 153.025000, 0),

-- 8. RSPCA - Million Paws Walk (Broadbeach)
(3, 5, 'RSPCA Million Paws Walk - Gold Coast',
 'Australias biggest animal welfare event! Bring your dog for a 3km walk through Kurrawa Parklands. Pet markets, vet checks, dog agility and family activities all day.',
 '2026-10-04', '08:00:00', '13:00:00',
 'Kurrawa Parklands', 'Old Burleigh Road, Broadbeach', 'Gold Coast',
 30.00, 1500, 40000.00, 21300.00, 'active',
 'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=800',
 -28.040000, 153.435000, 0),

-- 9. Starlight - Silent Auction (Broadbeach)
(4, 3, 'Starlight Dream Auction',
 'Bid on exclusive experiences: private chef dinners, weekend getaways, sports memorabilia and more. All funds make dreams come true for seriously ill children.',
 '2026-10-18', '09:00:00', '18:00:00',
 'The Star Grand Gold Coast', '1 Casino Drive, Broadbeach', 'Gold Coast',
 40.00, 200, 60000.00, 22400.00, 'active',
 'https://images.unsplash.com/photo-1533106418989-88406c7cc4af?w=800',
 -28.030000, 153.430000, 0),

-- 10. Beyond Blue - Charity Concert (Robina, Bond University)
(5, 4, 'Mind Matters Charity Concert',
 'An uplifting evening of acoustic performances by local artists raising awareness for youth mental health. All ages welcome. Includes free community mental health resources on the night.',
 '2026-11-01', '18:00:00', '22:00:00',
 'Soundlounge, Bond University', '14 University Drive, Robina', 'Gold Coast',
 35.00, 800, 45000.00, 12600.00, 'active',
 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
 -28.060000, 153.400000, 0),

-- 11. Past event (Brisbane City Hall)
(2, 2, 'Brisbane Moonlight Gala 2025',
 'Our annual flagship gala held last year at the Brisbane City Hall. Thank you to everyone who attended and helped us raise over $120,000.',
 '2025-09-20', '18:00:00', '23:00:00',
 'Brisbane City Hall', '64 Adelaide Street, Brisbane', 'Brisbane',
 150.00, 400, 120000.00, 128500.00, 'past',
 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800',
 -27.470000, 153.030000, 0),

-- 12. Suspended event (Burleigh Heads National Park)
(3, 1, 'RSPCA Coastal Walk',
 'This event has been temporarily suspended due to track maintenance. We will announce a new date shortly. Registered participants will be contacted directly.',
 '2026-10-09', '07:00:00', '11:00:00',
 'Burleigh Heads National Park', 'Burleigh Headland, Burleigh Heads', 'Gold Coast',
 20.00, 300, 15000.00, 3200.00, 'suspended',
 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800',
 -28.090000, 153.455000, 0);

-- ============================================================
-- Seed: Registrations (10 rows across multiple events)
-- Demonstrates: one user -> multiple events,
--               same event -> multiple users,
--               unique (email, event_id) constraint.
-- ============================================================
INSERT INTO registrations (event_id, full_name, email, phone, ticket_quantity) VALUES
-- Event 1: Gold Coast Half Marathon (3 registrations)
(1, 'Emma Wilson',    'emma.wilson@example.com',    '+61 412 345 001', 2),
(1, 'Michael Chen',   'michael.chen@example.com',  '+61 412 345 002', 1),
(1, 'Sarah O''Connor','sarah.oconnor@example.com', '+61 412 345 003', 4),

-- Event 2: Pink Ribbon Gala (2 registrations)
(2, 'Jessica Taylor', 'jessica.taylor@example.com','+61 412 345 004', 2),
(2, 'David Brown',    'david.brown@example.com',    '+61 412 345 005', 1),

-- Event 4: Starlight Sunset Concert (2 registrations)
(4, 'Lisa Martinez',  'lisa.martinez@example.com', '+61 412 345 006', 3),
(4, 'James Wilson',   'james.wilson@example.com',  '+61 412 345 007', 2),

-- Event 6: Brisbane River Run (2 registrations)
(6, 'Amy Zhang',      'amy.zhang@example.com',     '+61 412 345 008', 1),
(6, 'Chris Johnson',  'chris.johnson@example.com',  '+61 412 345 009', 2),

-- Event 9: Starlight Dream Auction (1 registration)
(9, 'Nina Kowalski',  'nina.kowalski@example.com', '+61 412 345 010', 1);

-- ============================================================
-- Verification queries
-- ============================================================
SELECT 'Organizations' AS table_name, COUNT(*) AS total FROM organizations
UNION ALL
SELECT 'Categories', COUNT(*) FROM categories
UNION ALL
SELECT 'Events', COUNT(*) FROM events
UNION ALL
SELECT 'Registrations', COUNT(*) FROM registrations
UNION ALL
SELECT 'Active Events', COUNT(*) FROM events WHERE status = 'active' AND event_date >= CURDATE()
UNION ALL
SELECT 'Past Events', COUNT(*) FROM events WHERE status = 'past' OR event_date < CURDATE();
