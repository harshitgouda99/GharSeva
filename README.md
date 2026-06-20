# GharSeva - Local Service Marketplace Platform

GharSeva is a production-ready, full-stack marketplace application (similar to Urban Company) designed for customers to find and book local service providers, for providers to manage bookings and earnings, and for admins to monitor and control the platform.

---

## Technical Stack
* **Frontend**: React (Vite), Tailwind CSS, Context API, Axios, Recharts, Lucide Icons
* **Backend**: Node.js, Express.js, JWT, Multer
* **Database**: MySQL

---

## Features
- **Role-Based Portals**: Interfaces tailored for Customers, Providers, and Admins.
- **Authentication**: JWT validation, registration, login, profile updates, and mock password reset.
- **Service Browsing**: Search, categories filtering, and range sorting.
- **Booking Flow**: Complete lifecycle (Pending ➜ Accepted/Rejected ➜ Completed).
- **Reviews**: Star rating and testimonial feedback.
- **Favorites**: Personal bookmarks dashboard.
- **Notifications**: Instant user action notifications and unread badges.
- **Complaints**: Ticket management for customer problems.
- **Analytics & Graphs**: Statistics on earnings, orders, and registrations.

---

## Setup Instructions

### 1. Database Setup
1. Open your MySQL client (e.g., phpMyAdmin, MySQL Workbench, or Command Line).
2. Create a database named `gharseva`:
   ```sql
   CREATE DATABASE gharseva;
   ```
3. Import the SQL schema file:
   ```bash
   mysql -u root -p gharseva < database/schema.sql
   ```

### 2. Environment Configurations
Configure the backend server by creating or updating `backend/.env` (a `.env.example` has been provided):
```env
PORT=5000
JWT_SECRET=supersecretjwtkey12345
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=gharseva
```

### 3. Installation
Run the following command at the project root to automatically install dependencies for the root, backend, and frontend:
```bash
npm install
```

### 4. Running the Platform
Start both servers concurrently with a single command from the project root:
```bash
npm start
```
The application will launch:
- **Frontend client**: http://localhost:5173
- **Backend server**: http://localhost:5000

---

## Test Accounts
Use these preseeded credentials to test the portals:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@gharseva.com` | `Password123` |
| **Provider (Approved)** | `provider@gharseva.com` | `Password123` |
| **Customer** | `customer@gharseva.com` | `Password123` |
| **Provider (Pending)** | `pending@gharseva.com` | `Password123` |
