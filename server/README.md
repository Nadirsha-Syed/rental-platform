# Rental Platform (MERN)

A scalable multi-category rental backend system built using Node.js, Express, and MongoDB.

This platform is designed to support rentals for various asset types including vehicles, agricultural equipment, cameras, and other rentable items under a unified architecture.

---

## Tech Stack

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- bcryptjs

---

## Architecture

- MVC pattern (Routes → Controllers → Models)
- Stateless JWT-based authentication
- Middleware-driven route protection
- Environment-based configuration management
- Cloud database integration (MongoDB Atlas)

---

## Development Progress

### Backend Foundation
- Express server initialized
- Clean MVC folder structure
- MongoDB Atlas connected
- Environment variables configured

### Authentication System
- User Registration & Login APIs
- Password hashing using bcrypt
- JWT token generation
- Protected routes via custom middleware
- Proper 401 handling for unauthorized access

---

## Next Phase

- Rental Item Model (multi-category support)
- Booking system with hourly pricing logic
- Razorpay payment integration
- Role-based access control (Admin / Vendor / User)
- React frontend integration

---

## Status

Authentication layer completed.  
Rental module under development.
