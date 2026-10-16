# Charity Events Platform — PROG2002 Assignment 3

**Team 18**
**Members**: Suping Li (24832368), Xinya Su (24832685)

A full-stack charity events platform that connects passionate organisers with caring supporters across the Gold Coast and Brisbane region of Australia. This assignment builds upon A2 by migrating the frontend to **Angular 22 + TypeScript** and adding a dedicated admin panel for event organisers.

---

## ✨ Key Features

### Client-side (Public Website)
- Hero carousel with 3 rotating slides
- Dynamic event listing (7 charity events)
- Search and filter events
- Event detail pages with registration form
- Rescue stories with before-and-after photos
- About us page
- Our impact statistics
- Adoptable pets gallery
- Weather integration for event locations (Open-Meteo API)

### Admin-side (Organiser Dashboard)
- Admin login
- Event management (Create / Read / Update / Delete)
- Registration management
- Data dashboard

---

## 🛠 Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend (Client) | Angular 22 + TypeScript + CSS3 |
| Frontend (Admin) | Angular 22 + TypeScript + CSS3 |
| Backend | Node.js + Express.js |
| Database | MySQL |
| API Style | RESTful API |
| Third-party API | Open-Meteo Weather API |
| Version Control | Git + GitHub |

---

## 📁 Project Structure

```
Team18-charity-events-a3/
├── database/
│   └── charityevents_db.sql          # Full schema + seed data (import this first)
├── api/                               # Backend RESTful API
│   ├── package.json
│   ├── server.js                      # Main Express server
│   ├── event_db.js                    # MySQL connection pool
│   └── routes/
│       ├── events.js                  # Event API routes
│       └── registrations.js           # Registration API routes
├── client-angular/                    # Client-side Angular SPA (port 4200)
│   ├── src/
│   │   ├── app/
│   │   │   ├── home/                  # Home page component
│   │   │   ├── search/                # Search page component
│   │   │   ├── event-detail/          # Event detail page component
│   │   │   ├── registration/          # Registration page component
│   │   │   ├── about/                 # About us page component
│   │   │   ├── stories/               # Rescue stories page component
│   │   │   ├── impact/                # Our impact page component
│   │   │   └── adopt/                 # Adoptable pets page component
│   │   └── assets/
│   │       └── images/                # Local image assets
│   ├── angular.json
│   ├── proxy.conf.json                # API proxy configuration
│   └── package.json
├── admin-angular/                     # Admin-side Angular SPA (port 4300)
│   └── (same structure as client-angular)
├── report/
│   └── A3_Project_Report.md          # Project documentation
├── API_DOCUMENTATION.md              # Full API endpoint documentation
├── .gitignore
└── README.md
```

---

## 🚀 How to Run

### Step 1: Set up the Database
1. Open MySQL Workbench
2. Run `database/charityevents_db.sql`
3. You should see `charityevents_db` with 12 events and 10 registrations

### Step 2: Configure Database Connection
Edit `api/event_db.js` and set your MySQL password:
```js
password: 'YOUR_MYSQL_PASSWORD'
```

### Step 3: Start the API Server
```bash
cd api
npm install
npm start
```
API runs on `http://localhost:3000`

### Step 4: Start the Client-side Angular App
```bash
cd client-angular
npm install
npm start
```
Client app runs on `http://localhost:4200`

### Step 5: Start the Admin-side Angular App
```bash
cd admin-angular
npm install
npm start
```
Admin app runs on `http://localhost:4300`

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/events` | Get all active events | Public |
| GET | `/api/events/:id` | Get single event details | Public |
| POST | `/api/events` | Create new event | Admin |
| PUT | `/api/events/:id` | Update event | Admin |
| DELETE | `/api/events/:id` | Delete event | Admin (except system defaults) |
| POST | `/api/registrations` | Create new registration | Public |
| GET | `/api/registrations?event_id=:id` | Get registrations for an event | Admin |
| GET | `/api/weather?latitude=:lat&longitude=:lon` | Get weather for location | Public |

Full API documentation: `API_DOCUMENTATION.md`

---

## ✅ Assignment Checklist

### Database (5%)
- [x] Database schema with events, registrations tables
- [x] 12 events across multiple categories and locations
- [x] 10 registration seed records
- [x] Latitude/longitude fields for weather API

### API (10%)
- [x] RESTful API with GET/POST/PUT/DELETE endpoints
- [x] Registration endpoints
- [x] Protected system data (cannot delete seed events)
- [x] Weather API proxy integration

### Client-side (30%)
- [x] Angular 22 + TypeScript
- [x] Home page with carousel and dynamic event listing
- [x] Search and filter functionality
- [x] Event detail pages with registration form
- [x] Rescue stories with before/after photos
- [x] Responsive design
- [x] Navigation bar on all pages

### Admin-side (30%)
- [x] Admin Angular framework
- [x] Admin login
- [x] Event management (CRUD)
- [x] Registration management
- [x] Data dashboard

### Conceptual Understanding (10%)
- [x] Project report written
- [x] Technology stack explained
- [x] Architecture documented

### Teamwork (15%)
- [x] GitHub repository with collaboration
- [ ] Peer evaluation form
- [ ] Demo video (≤15 min)
- [ ] cPanel deployment

---

## 📄 License

GPL-3.0
