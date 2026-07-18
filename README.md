# GharSeva - Local Service Marketplace Platform

GharSeva is a production-ready, full-stack marketplace application (similar to Urban Company) designed for customers to find and book local service providers, for providers to manage bookings and earnings, and for admins to monitor and control the platform.

---

## Technical Stack
* **Frontend**: React (Vite), Tailwind CSS, Redux Toolkit, Axios, Recharts, Lucide Icons
* **Backend**: Node.js, Express.js, JWT, Multer
* **Database**: MongoDB (Mongoose)

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
1. Ensure you have **MongoDB Community Server** installed and running on your local machine.
2. The database will be created automatically (default name is `gharseva`).
3. To populate the database with sample users, services, categories, and bookings, seed the database by running the following command from the backend folder:
   ```bash
   cd backend
   node seed.js
   ```

### 2. Environment Configurations
Configure the backend server by creating or updating `backend/.env` (a `.env.example` has been provided):
```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/gharseva
JWT_SECRET=supersecretjwtkey1234567890
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=gharsevalocalservice@gmail.com
EMAIL_PASS=your_email_password
EMAIL_FROM="GharSeva <gharsevalocalservice@gmail.com>"
```

### 3. Installation
Run the following command at the project root to automatically install dependencies for the root, backend, and frontend:
```bash
npm run install-all
```

### 4. Running the Platform
Start both servers concurrently with a single command from the project root:
```bash
npm start
```
The application will launch:
- **Frontend client**: http://localhost:5173
- **Backend server**: http://localhost:5001

---

## Test Accounts
Use these preseeded credentials to test the portals:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@gharseva.com` | `Password123` |
| **Provider (Approved)** | `provider@gharseva.com` | `Password123` |
| **Customer** | `customer@gharseva.com` | `Password123` |
| **Provider (Pending)** | `pending@gharseva.com` | `Password123` |
