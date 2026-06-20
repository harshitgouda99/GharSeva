# GharSeva – Local Service Marketplace Platform

**Ramaiah Institute of Technology**
**Master of Computer Applications 2026**

---

## Table of Contents

1. [Abstract](#abstract)
2. [Introduction](#1-introduction)
   - 1.1. [Problem Definition](#11-problem-definition)
3. [Implementation](#2-implementation)
   - 2.1. [Code Snippets](#21-code-snippets)
4. [User Interface Screenshots](#3-user-interface-screenshots)
5. [Conclusion and Future Enhancement](#4-conclusion-and-future-enhancement)

---

## ABSTRACT

GharSeva is a full-stack, production-ready local service marketplace web application inspired by platforms such as Urban Company. It connects customers seeking household and professional services with verified local service providers, while giving administrators complete oversight through a dedicated management dashboard. The platform is built on the **MERN stack** — MongoDB, Express.js, React (Vite), and Node.js — and features **role-based access control** for three distinct user types: Customers, Providers, and Admins.

The system addresses the growing need for digitizing unorganized local services by offering a structured booking lifecycle (Pending → Accepted/Rejected → Completed), a star-rating and review system, real-time in-app notifications, provider application and approval workflows, complaint ticket management, and comprehensive admin analytics with chart-based visualizations. Security is enforced via JSON Web Token (JWT) authentication, bcrypt password hashing, and middleware-level role authorization.

The frontend employs React with Redux Toolkit for centralized state management, Tailwind CSS for responsive styling, and Recharts for data visualization. The backend follows a modular MVC architecture with 11 route modules, 12 Mongoose data models, and dedicated middleware for authentication and file uploads. This report documents the problem statement, system architecture, implementation details with code snippets, user interface design, and future enhancements planned for the platform.

---

## 1. Introduction

The home services industry in India has traditionally been dominated by unorganized, word-of-mouth referrals. Customers often struggle to find reliable electricians, plumbers, cleaners, or other service professionals in their locality. On the other hand, skilled service providers lack a digital platform to showcase their expertise, manage bookings, and grow their businesses. Existing solutions like Urban Company cater primarily to metro cities, leaving a significant gap for tier-2 and tier-3 cities.

**GharSeva** (meaning "Home Service" in Hindi) bridges this gap by providing a full-featured, role-based marketplace where:

- **Customers** can browse services by category, search by keyword, filter by price and rating, book services at their saved addresses, leave reviews, save favorites, and file complaints.
- **Service Providers** can register and apply for verification, list their services with images and pricing, manage incoming booking requests (accept/reject/complete), and track earnings.
- **Admins** can monitor platform-wide statistics via analytics dashboards, approve or reject provider applications, manage user accounts (suspend/reactivate), broadcast notifications, and view activity logs.

The application is designed with a clean separation of concerns — a RESTful API backend and a single-page application (SPA) frontend — making it scalable, maintainable, and suitable for real-world deployment.

### 1.1. Problem Definition

The key problems this project aims to solve are:

1. **Lack of Discoverability**: Local service providers have no centralized digital platform to list their services, leading to poor visibility and limited customer reach.

2. **Trust Deficit**: Without verified profiles, ratings, or reviews, customers have no reliable way to evaluate the quality of a service provider before booking.

3. **No Booking Lifecycle Management**: Traditional phone-based booking is informal, with no status tracking, confirmation, or completion records — leading to disputes and missed appointments.

4. **Absence of Quality Control**: There is no admin-level oversight to vet providers, handle customer complaints, or maintain platform standards.

5. **No Earnings Transparency**: Service providers lack a structured way to track their completed jobs, pending payments, and overall revenue.

**Objective**: To design and develop a full-stack web application that digitizes the entire home-service booking experience — from service discovery and provider verification to booking management, review feedback, and administrative analytics — using the MERN technology stack.

---

## 2. Implementation

The system follows a **Model–View–Controller (MVC)** architecture and is organized into two independent modules:

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 (Vite), Redux Toolkit, Tailwind CSS, Axios, Recharts, Lucide Icons | Single-page application with role-based routing |
| **Backend** | Node.js, Express.js 4, Mongoose ODM, JWT, Multer, Bcrypt.js, Nodemailer | RESTful API with authentication and file upload support |
| **Database** | MongoDB (via Mongoose) | Document-oriented storage with 12 collections |

**System Architecture Diagram:**

```
┌──────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)              │
│  ┌─────────┐  ┌────────────┐  ┌───────────────────────┐ │
│  │ Pages   │  │ Components │  │ Redux Store (9 slices)│ │
│  │ (15)    │  │ (4)        │  │ auth, services,       │ │
│  │         │  │ Navbar     │  │ bookings, reviews,    │ │
│  │         │  │ Sidebar    │  │ notifications,        │ │
│  │         │  │ Protected  │  │ favorites, complaints,│ │
│  │         │  │ Route      │  │ addresses, admin      │ │
│  └────┬────┘  └──────┬─────┘  └───────────┬───────────┘ │
│       │              │                    │              │
│       └──────────────┴────────────────────┘              │
│                     Axios HTTP Client                    │
└─────────────────────────┬────────────────────────────────┘
                          │  REST API (JSON)
                          ▼
┌──────────────────────────────────────────────────────────┐
│                  BACKEND (Node.js + Express)              │
│  ┌──────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Routes   │  │ Controllers │  │ Middleware           │ │
│  │ (11)     │  │ (11)        │  │ • authMiddleware     │ │
│  │          │  │             │  │ • uploadMiddleware   │ │
│  └────┬─────┘  └──────┬──────┘  └──────────┬──────────┘ │
│       │               │                    │             │
│       └───────────────┴────────────────────┘             │
│                    Mongoose ODM                          │
└─────────────────────────┬────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────┐
│              DATABASE (MongoDB)                          │
│  Collections: User, Service, ServiceCategory, Booking,   │
│  Review, Earning, Favorite, Notification, Complaint,     │
│  Address, ProviderApplication, ActivityLog               │
└──────────────────────────────────────────────────────────┘
```

**API Endpoints Summary:**

| Module | Base Path | Key Endpoints |
|---|---|---|
| Auth | `/api/auth` | POST `/register`, POST `/login`, GET `/profile`, PUT `/profile`, PUT `/change-password`, POST `/forgot-password`, POST `/reset-password/:token` |
| Services | `/api/services` | GET `/` (search/filter), GET `/:id`, POST `/` (create), PUT `/:id`, DELETE `/:id`, GET `/provider/my`, GET/POST `/categories` |
| Bookings | `/api/bookings` | POST `/`, PUT `/:id/accept`, PUT `/:id/reject`, PUT `/:id/complete`, PUT `/:id/cancel`, GET `/customer`, GET `/provider` |
| Reviews | `/api/reviews` | POST `/`, PUT `/:id`, DELETE `/:id`, GET `/service/:serviceId` |
| Favorites | `/api/favorites` | GET `/`, POST `/`, DELETE `/:serviceId` |
| Notifications | `/api/notifications` | GET `/`, PUT `/:id/read`, PUT `/read-all` |
| Complaints | `/api/complaints` | POST `/`, GET `/`, GET `/admin` |
| Addresses | `/api/addresses` | GET `/`, POST `/`, PUT `/:id`, DELETE `/:id` |
| Admin | `/api/admin` | GET `/stats`, GET `/users`, PUT `/users/:id/toggle-status`, GET `/logs`, POST `/broadcast`, GET `/providers/pending`, PUT `/providers/:id/approve`, PUT `/providers/:id/reject` |
| Earnings | `/api/earnings` | GET `/provider` |

### 2.1. Code Snippets

#### 2.1.1. User Model with Password Hashing (backend/models/User.js)

The User model uses Mongoose schema with a `pre('save')` hook that automatically hashes passwords using bcrypt before persisting to the database:

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, trim: true,
              lowercase: true, index: true },
  password: { type: String, required: true },
  phone:    { type: String, required: true, trim: true },
  role:     { type: String, enum: ['customer', 'provider', 'admin'],
              default: 'customer' },
  approvalStatus: { type: String,
              enum: ['pending', 'approved', 'rejected'],
              default: 'approved' },
  profileImage:        { type: String, default: '' },
  isActive:            { type: Boolean, default: true },
  resetPasswordToken:  { type: String },
  resetPasswordExpires:{ type: Date },
  createdAt:           { type: Date, default: Date.now }
});

// Pre-save hook — hash password before storing
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method — compare candidate password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

---

#### 2.1.2. JWT Authentication Middleware (backend/middleware/authMiddleware.js)

A two-layer middleware system: `protect` verifies the JWT token and attaches the user object to the request, while `authorize` restricts route access based on user roles.

```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token,
        process.env.JWT_SECRET || 'supersecretjwtkey1234567890');

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({
          success: false, message: 'User not found'
        });
      }
      if (!req.user.isActive) {
        return res.status(403).json({
          success: false, message: 'User account is deactivated'
        });
      }
      next();
    } catch (error) {
      return res.status(401).json({
        success: false, message: 'Not authorized, token failed'
      });
    }
  }
  if (!token) {
    return res.status(401).json({
      success: false, message: 'Not authorized, no token provided'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'none'}'
                  is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
```

---

#### 2.1.3. Booking Lifecycle Controller (backend/controllers/bookingController.js)

The booking controller manages the complete lifecycle — creation, acceptance, rejection, completion, and cancellation — with notification triggers at each stage:

```javascript
const createBooking = async (req, res) => {
  try {
    const { serviceId, bookingDate, addressId } = req.body;
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false, message: 'Service not found'
      });
    }

    const booking = await Booking.create({
      customerId:    req.user._id,
      providerId:    service.providerId,
      serviceId,
      bookingDate:   new Date(bookingDate),
      addressId,
      bookingStatus: 'pending'
    });

    // Notify Provider
    await Notification.create({
      userId:  service.providerId,
      type:    'booking_created',
      title:   'New Booking Request',
      message: `You have received a new request for
                "${service.serviceTitle}".`
    });

    // Notify Customer
    await Notification.create({
      userId:  req.user._id,
      type:    'booking_created',
      title:   'Booking Placed',
      message: `Your booking request for
                "${service.serviceTitle}" has been submitted.`
    });

    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
};
```

---

#### 2.1.4. Service Search with Filtering & Pagination (backend/controllers/serviceController.js)

Advanced search supporting keyword, category, price range, rating, sorting, and pagination:

```javascript
const getServices = async (req, res) => {
  try {
    const { keyword, category, minPrice, maxPrice, rating, sort }
      = req.query;
    let query = {};

    // Filter by category (supports ObjectId or name)
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.categoryId = category;
      } else {
        const cat = await ServiceCategory.findOne({
          name: { $regex: category, $options: 'i' }
        });
        if (cat) query.categoryId = cat._id;
      }
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Rating filter
    if (rating) {
      query.averageRating = { $gte: Number(rating) };
    }

    // Sorting options
    let sortOption = { createdAt: -1 };
    if (sort === 'priceLow')  sortOption = { price: 1 };
    if (sort === 'priceHigh') sortOption = { price: -1 };
    if (sort === 'rating')    sortOption = { averageRating: -1 };

    // Pagination
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip  = (page - 1) * limit;

    const total = await Service.countDocuments(query);
    const services = await Service.find(query)
      .populate('providerId', 'fullName email phone profileImage')
      .populate('categoryId', 'name icon')
      .sort(sortOption).skip(skip).limit(limit);

    res.json({
      success: true, services,
      pagination: { total, page, limit,
                    pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

---

#### 2.1.5. Redux Store Configuration (frontend/src/store/store.js)

Centralized state management using Redux Toolkit with 9 feature slices:

```javascript
import { configureStore } from '@reduxjs/toolkit';
import authReducer          from './slices/authSlice';
import servicesReducer      from './slices/servicesSlice';
import bookingsReducer      from './slices/bookingsSlice';
import notificationsReducer from './slices/notificationsSlice';
import favoritesReducer     from './slices/favoritesSlice';
import complaintsReducer    from './slices/complaintsSlice';
import addressesReducer     from './slices/addressesSlice';
import reviewsReducer       from './slices/reviewsSlice';
import adminReducer         from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    auth:          authReducer,
    services:      servicesReducer,
    bookings:      bookingsReducer,
    notifications: notificationsReducer,
    favorites:     favoritesReducer,
    complaints:    complaintsReducer,
    addresses:     addressesReducer,
    reviews:       reviewsReducer,
    admin:         adminReducer
  }
});
export default store;
```

---

#### 2.1.6. Protected Route Component (frontend/src/components/ProtectedRoute.jsx)

Client-side route guard that enforces role-based access on the frontend:

```jsx
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token } = useSelector(state => state.auth);

  if (!token) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default ProtectedRoute;
```

---

#### 2.1.7. Review System with Rating Aggregation (backend/controllers/reviewController.js)

The review controller allows customers to rate completed bookings. A helper function recalculates the service's average rating using a MongoDB aggregation pipeline:

```javascript
// Helper — recalculate service average rating
const updateServiceRatingStats = async (serviceId) => {
  const stats = await Review.aggregate([
    { $match: { serviceId } },
    { $group: {
        _id: '$serviceId',
        averageRating: { $avg: '$rating' },
        totalReviews:  { $sum: 1 }
    }}
  ]);

  if (stats.length > 0) {
    await Service.findByIdAndUpdate(serviceId, {
      averageRating: parseFloat(stats[0].averageRating.toFixed(1)),
      totalReviews:  stats[0].totalReviews
    });
  } else {
    await Service.findByIdAndUpdate(serviceId, {
      averageRating: 0, totalReviews: 0
    });
  }
};

// Add a review (only for completed bookings)
const addReview = async (req, res) => {
  try {
    const { bookingId, rating, reviewText } = req.body;
    const booking = await Booking.findById(bookingId);

    if (booking.bookingStatus !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'You can only review completed services'
      });
    }

    const review = await Review.create({
      customerId: req.user._id,
      providerId: booking.providerId,
      serviceId:  booking.serviceId,
      bookingId,
      rating:     Number(rating),
      reviewText
    });

    await updateServiceRatingStats(booking.serviceId);
    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

---

#### 2.1.8. Admin Dashboard Statistics API (backend/controllers/adminController.js)

Aggregation pipeline for platform analytics including monthly booking trends and category distribution:

```javascript
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers     = await User.countDocuments({ role: 'customer' });
    const totalProviders = await User.countDocuments({ role: 'provider' });
    const totalServices  = await Service.countDocuments();
    const totalBookings  = await Booking.countDocuments();
    const completedBookings = await Booking.countDocuments({
      bookingStatus: 'completed'
    });

    // Revenue aggregation
    const revenueStats = await Earning.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueStats.length > 0
      ? revenueStats[0].total : 0;

    // Monthly booking trends (for Recharts visualization)
    const monthlyStats = await Booking.aggregate([
      { $group: {
          _id: { $month: '$createdAt' },
          bookings:  { $sum: 1 },
          completed: { $sum: {
            $cond: [{ $eq: ['$bookingStatus', 'completed'] }, 1, 0]
          }}
      }},
      { $sort: { _id: 1 } }
    ]);

    // Category distribution of services
    const categoryStats = await Service.aggregate([
      { $group: { _id: '$categoryId', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: { totalUsers, totalProviders, totalServices,
               totalBookings, completedBookings, totalRevenue },
      analytics: { monthlyBookings, categoryDistribution }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

---

#### 2.1.9. Automated Email Notifications via Mongoose Hooks (backend/models/Notification.js)

To ensure users receive critical updates (e.g., booking confirmations, provider approvals), a Mongoose `post('save')` hook automatically dispatches an email via Nodemailer whenever a new in-app notification is persisted to the database.

```javascript
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Post-save hook to trigger email delivery
notificationSchema.post('save', async function(doc) {
  try {
    const User = mongoose.model('User');
    const user = await User.findById(doc.userId);
    if (user && user.email) {
      const { sendNotificationEmail } = require('../utils/emailService');
      await sendNotificationEmail(user.email, doc.title, doc.message);
    }
  } catch (error) {
    console.error('Error sending notification email:', error);
  }
});

module.exports = mongoose.model('Notification', notificationSchema);
```

---

## 3. User Interface Screenshots

> **Note**: The following describes the key screens of the GharSeva application. Screenshots should be captured from the running application at `http://localhost:5173` and inserted below.

### 3.1. Landing Page
The landing page presents a hero section with the GharSeva branding, a brief tagline ("Find Trusted Local Services at Your Doorstep"), and call-to-action buttons for Login and Register. It uses a gradient background with modern typography.

*(Insert Screenshot Here)*

### 3.2. Registration Page
A multi-field form collecting Full Name, Email, Phone, Password, and Role selection (Customer or Provider). Provider registration triggers an admin approval workflow.

*(Insert Screenshot Here)*

### 3.3. Login Page
A clean login form with email and password fields, along with a "Forgot Password?" link and a redirect to the registration page.

*(Insert Screenshot Here)*

### 3.4. Customer Dashboard
Displays a welcome greeting, quick-access cards for Browse Services, My Bookings, Favorites, and Manage Addresses. Shows recent booking summaries with status badges (Pending, Accepted, Completed, Rejected).

*(Insert Screenshot Here)*

### 3.5. Services Browsing Page
A grid layout of service cards with thumbnails, titles, prices, and star ratings. Includes a top filter bar with keyword search, category dropdown, price range slider, rating filter, and sort options (Newest, Price Low→High, Price High→Low, Top Rated). Supports pagination.

*(Insert Screenshot Here)*

### 3.6. Service Details Page
A detailed view of a single service showing the service image, title, description, price, provider information (name, contact), average rating, total reviews, and a "Book Now" button. Below is a reviews section with star ratings and customer testimonials.

*(Insert Screenshot Here)*

### 3.7. Booking Flow
A modal/form to select booking date and delivery address (from saved addresses). After submission, the booking enters "Pending" status and notifications are sent to both customer and provider.

*(Insert Screenshot Here)*

### 3.8. Provider Dashboard
Tabbed interface showing: (a) Incoming booking requests with Accept/Reject buttons, (b) Active/completed bookings, (c) My Services with CRUD actions, (d) Earnings summary. Includes a "Create New Service" form with image upload.

*(Insert Screenshot Here)*

### 3.9. Admin Dashboard
A comprehensive analytics dashboard with:
- Summary stat cards (Total Users, Providers, Services, Bookings, Revenue)
- Monthly Bookings bar chart (Recharts)
- Category Distribution pie chart
- User management table with suspend/reactivate toggles
- Pending provider applications list with approve/reject actions
- Activity log viewer
- Broadcast notification form

*(Insert Screenshot Here)*

### 3.10. Notifications Page
A chronological list of notifications with type icons, titles, messages, and read/unread indicators. Includes a "Mark All as Read" action.

*(Insert Screenshot Here)*

### 3.11. Profile & Settings
Profile view with avatar, name, email, phone, and role. Edit Profile form for updating name, phone, and profile image. Separate Change Password page with current and new password fields.

*(Insert Screenshot Here)*

---

## 4. Conclusion and Future Enhancement

### 4.1. Conclusion

GharSeva successfully demonstrates a complete, production-quality local service marketplace built on the MERN stack. The application provides a seamless experience for all three user roles:

- **Customers** enjoy an intuitive service discovery interface with search, filters, booking management, reviews, and complaint filing.
- **Providers** benefit from a structured workflow for service listing, booking management, and earnings tracking, along with an admin-verified onboarding process.
- **Admins** gain full platform visibility through analytics dashboards, user management, provider approval workflows, and broadcast notifications.

Key technical achievements include:

- A **modular MVC architecture** with 11 route/controller pairs and 12 data models.
- **JWT-based authentication** with bcrypt password hashing and role-based authorization middleware.
- **Redux Toolkit** for predictable, centralized frontend state management across 9 feature slices.
- **MongoDB aggregation pipelines** for real-time analytics and rating statistics.
- **Complete booking lifecycle** with automated in-app and email notification triggers at every stage.
- **Automated Email Delivery** using Nodemailer and Mongoose post-save hooks for OTPs and notifications.
- **File upload support** via Multer for service images and profile photos.
- **Activity logging** for audit trails across all user actions.
- **Security Best Practices** including environment variable protection (`.gitignore`) for secure cloud deployment (e.g., Vercel).

### 4.2. Future Enhancements

| Enhancement | Description |
|---|---|
| **Real-Time Notifications** | Integrate Socket.IO or WebSockets for push-based, real-time notification delivery instead of polling. |
| **Payment Gateway** | Integrate Razorpay or Stripe for online payments, enabling secure transactions and automated earning payouts to providers. |
| **Geolocation & Maps** | Use Google Maps API to show nearby providers, enable location-based search, and provide delivery tracking. |
| **Chat System** | Add a real-time messaging system between customers and providers for pre-booking communication. |
| **Mobile Application** | Develop native Android and iOS apps using React Native to extend platform reach. |
| **AI-Powered Recommendations** | Implement a recommendation engine using collaborative filtering to suggest services based on user behavior and preferences. |
| **Multi-Language Support** | Add i18n support for Hindi, Kannada, and other regional languages to improve accessibility. |
| **OTP-Based Authentication** | Replace email/password login with OTP verification via SMS using Twilio or Firebase Auth. |
| **Service Scheduling** | Allow providers to set availability calendars and customers to pick time slots for bookings. |
| **Advanced Admin Reports** | Export analytics data as PDF/Excel reports and add date-range filters for historical trend analysis. |
| **Provider Verification** | Implement document upload (Aadhaar, PAN) and background verification for provider trust. |
| **Progressive Web App (PWA)** | Convert the frontend to a PWA for offline support, push notifications, and home screen installation. |

---

*GharSeva — Bringing Trusted Home Services to Your Doorstep.*

**Ramaiah Institute of Technology | Master of Computer Applications | 2026**
