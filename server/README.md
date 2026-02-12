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
- Environment-based configuration
- Cloud database integration (MongoDB Atlas)

---

# Development Log

## Day 1 – Backend Foundation

- Express server initialized
- Clean MVC folder structure created
- MongoDB Atlas connected
- Environment variables configured securely
- Basic server testing completed

Established a scalable backend base for future feature implementation.

---

## Day 2 – Authentication System

- User Registration API
- User Login API
- Password hashing using bcrypt (salt rounds = 10)
- JWT token generation
- Custom authentication middleware
- Protected route implementation
- Proper 401 handling for unauthorized access

This authentication layer enables secure user-based bookings and payment integration in upcoming phases.

---

## Next Phase

- Rental Item Model (multi-category support)
- Booking system with hourly pricing logic
- Razorpay payment integration
- Role-based access control (Admin / Vendor / User)
- React frontend integration

---

## Current Status

Authentication layer completed.  
Rental module under development.
