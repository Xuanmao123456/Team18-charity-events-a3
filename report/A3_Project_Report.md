# PROG2002 A3 - Charity Events Platform Project Report

**Team 18**
**Members**:
- Suping Li (24832368) - 李素萍
- Xinya Su (24832685) - 宿心雅

**Date**: October 2026

---

## 1. Project Overview

### 1.1 Project Description
Our project is a full-stack charity events platform that connects passionate organisers with caring supporters across the Gold Coast and Brisbane regions. The platform allows users to browse charity events, view event details, register for events, and includes an admin panel for event organisers to manage their events and view registrations.

### 1.2 Key Features
- **Client-side**: Browse events, search, view event details, register for events, view rescue stories
- **Admin-side**: Login, create/edit/delete events, view registrations, data dashboard
- **API Backend**: RESTful API with MySQL database, integrated Open-Meteo weather API
- **Responsive Design**: Works on desktop and mobile devices

### 1.3 Target Users
- **Event Supporters**: People who want to find and register for charity events
- **Event Organisers**: Charity organisations who want to list and manage their events

---

## 2. Technology Stack

### 2.1 Frontend (Client & Admin)
- **Framework**: Angular 22.2.2 (latest version)
- **Language**: TypeScript
- **Styling**: CSS3 with responsive design
- **Routing**: Angular Router
- **HTTP Client**: Angular HttpClient

**Why Angular + TypeScript?**
1. **Type Safety**: TypeScript provides compile-time type checking, reducing runtime errors
2. **Component Architecture**: Angular's component-based structure makes code more modular and maintainable
3. **Built-in Tools**: Angular CLI, Router, HttpClient, forms are all integrated out of the box
4. **Industry Standard**: Angular is widely used in enterprise applications, demonstrating professional development skills

### 2.2 Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **API Style**: RESTful API
- **Third-party API**: Open-Meteo Weather API

### 2.3 Development Tools
- **Version Control**: Git + GitHub
- **IDE**: Visual Studio Code
- **Testing**: Manual testing with Postman and browser DevTools

---

## 3. Database Design

### 3.1 Database Schema
We have designed a relational database with 3 main tables:

#### Table 1: `events`
Stores all charity event information.

| Field | Type | Description |
|-------|------|-------------|
| id | INT (PK) | Unique event identifier |
| title | VARCHAR(255) | Event title |
| description | TEXT | Event description |
| event_date | DATE | Event date |
| start_time | TIME | Event start time |
| end_time | TIME | Event end time |
| location | VARCHAR(255) | Event location |
| price | DECIMAL(10,2) | Ticket price |
| category | VARCHAR(50) | Event category (Fun Run, Gala Dinner, etc.) |
| image_url | VARCHAR(255) | Event banner image URL |
| latitude | DECIMAL(10,7) | Location latitude (for weather API) |
| longitude | DECIMAL(10,7) | Location longitude (for weather API) |
| organizer_name | VARCHAR(255) | Organising charity name |
| organizer_email | VARCHAR(255) | Organiser contact email |
| organizer_phone | VARCHAR(50) | Organiser contact phone |
| is_active | BOOLEAN | Whether event is active |
| is_custom | BOOLEAN | Whether event was created by admin (vs system default) |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Record last update time |

#### Table 2: `registrations`
Stores user registrations for events.

| Field | Type | Description |
|-------|------|-------------|
| id | INT (PK) | Unique registration identifier |
| event_id | INT (FK) | Reference to events.id |
| name | VARCHAR(255) | Registrant full name |
| email | VARCHAR(255) | Registrant email |
| phone | VARCHAR(50) | Registrant phone number |
| registration_date | TIMESTAMP | When registration was made |

#### Table 3: `admin_users` (for future admin login)
Stores admin user accounts.

| Field | Type | Description |
|-------|------|-------------|
| id | INT (PK) | Unique admin identifier |
| username | VARCHAR(100) | Admin username |
| password_hash | VARCHAR(255) | Hashed password |
| created_at | TIMESTAMP | Account creation time |

### 3.2 Database Relationships
- **One-to-Many**: One event can have many registrations
- **Foreign Key**: `registrations.event_id` references `events.id`

---

## 4. API Design

### 4.1 RESTful Principles
We followed RESTful API design principles:
- **Resource-based URLs**: `/events`, `/registrations`
- **HTTP Methods**: GET (read), POST (create), PUT (update), DELETE (delete)
- **JSON Format**: All requests and responses use JSON
- **Stateless**: Each request contains all information needed

### 4.2 API Endpoints Summary

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/events | Get all active events | Public |
| GET | /api/events/:id | Get single event details (with registrations) | Public |
| POST | /api/events | Create new event | Admin |
| PUT | /api/events/:id | Update existing event | Admin |
| DELETE | /api/events/:id | Delete event | Admin (except system defaults) |
| POST | /api/registrations | Create new registration | Public |
| GET | /api/registrations?event_id=:id | Get registrations for an event | Admin |
| GET | /api/weather?latitude=:lat&longitude=:lon | Get weather for event location | Public |

### 4.3 API Response Format
All responses follow a consistent format:

**Success Response**:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

**Error Response**:
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 5. Architecture

### 5.1 Overall Architecture
We implemented a **3-tier architecture**:

1. **Presentation Layer**: Angular client-side and admin-side (separate SPAs)
2. **Application Layer**: Node.js + Express API server
3. **Data Layer**: MySQL database

### 5.2 Frontend Architecture
- **Client-side SPA**: Angular app for end users (port 4200)
- **Admin-side SPA**: Separate Angular app for organisers (port 4300)
- **Proxy Configuration**: Angular dev server proxies API requests to Express backend (port 3000)

### 5.3 Backend Architecture
- **Express Server**: Handles HTTP requests, routing, middleware
- **Routes**: Separate route files for events and registrations
- **Database Connection**: MySQL connection pool for efficient queries
- **Third-party Integration**: Open-Meteo weather API proxy

---

## 6. Teamwork

### 6.1 Division of Work

#### Suping Li (李素萍)
- Database design and implementation
- Backend API development (all endpoints)
- Client-side Angular development (all public pages)
- Weather API integration
- API documentation
- cPanel deployment (client-side + API)

#### Xinya Su (宿心雅)
- Admin-side Angular development
  - Admin login page
  - Event management (CRUD operations)
  - Registration management
  - Data dashboard
- cPanel deployment (admin-side)
- Peer evaluation form

### 6.2 Collaboration Tools
- **GitHub**: Shared repository with version control
- **Git Branches**: Feature branches for each team member
- **Communication**: WeChat for daily coordination

---

## 7. Challenges and Solutions

### 7.1 Challenge 1: Migrating from Vanilla JS to Angular
**Problem**: We originally built the client-side with plain HTML/CSS/JS (A2), but for A3 we needed to migrate to Angular to achieve HD grade.

**Solution**: 
- Recreated all pages as Angular components
- Used Angular services for API calls
- Kept the same UI design and layout to maintain consistency

### 7.2 Challenge 2: Change Detection Issues
**Problem**: Data was loading from API but pages stayed in "Loading" state.

**Solution**:
- Injected `ChangeDetectorRef` and manually triggered change detection after data load
- This was needed because Angular's zone.js wasn't detecting changes from certain async operations

### 7.3 Challenge 3: Image Path Issues
**Problem**: Local images weren't loading after migration.

**Solution**:
- Configured `angular.json` assets correctly
- Fixed image paths to match the `src/assets` input configuration

---

## 8. Future Improvements

1. **User Authentication**: Implement JWT-based login for both clients and admins
2. **User Profiles**: Allow users to view their registration history
3. **Payment Integration**: Add Stripe/PayPal for paid event registration
4. **Search Enhancements**: Add filters by category, date range, location
5. **Email Notifications**: Send confirmation emails after registration
6. **Mobile App**: Build a native mobile version using Angular + Ionic

---

## 9. Conclusion

This project demonstrates our ability to build a full-stack web application using modern technologies. We successfully implemented:
- A complete RESTful API with MySQL database
- Two separate Angular single-page applications (client and admin)
- Integration with a third-party weather API
- Professional code structure and documentation

The project meets all the A3 requirements and is designed to be easily deployable and maintainable.
