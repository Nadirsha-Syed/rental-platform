# Rental Platform (MERN)

A scalable multi-category rental backend system built using Node.js, Express, and MongoDB.

This platform supports rentals for various asset types including:

- 🚗 Cars
- 🏍 Bikes
- 📷 Cameras
- 🚜 Harvesters
- 🛠 Equipment
- and other rentable assets under a unified architecture.

---

## 🚀 Tech Stack

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- bcryptjs
- dotenv

---

## 🏗 Architecture

- MVC pattern (Routes → Controllers → Models)
- Stateless JWT-based authentication
- Middleware-driven route protection
- Secure password hashing
- Environment-based configuration
- Cloud database integration (MongoDB Atlas)

---

# 📅 Development Log

---

## ✅ Day 1 – Backend Foundation

- Express server initialized
- Clean MVC folder structure created
- MongoDB Atlas connected
- Environment variables configured securely
- Database connection error handling implemented
- Initial API testing completed

✔ Established a scalable backend base for future feature implementation.

---

## ✅ Day 2 – Authentication System

### Features Implemented

- User Registration API
- User Login API
- Password hashing using bcrypt (salt rounds = 10)
- JWT token generation
- Custom authentication middleware
- Protected route implementation
- Proper 401 handling for unauthorized access
- Secure token verification using middleware

### Security Architecture

- Passwords stored as hashed values (never plain text)
- Stateless authentication using JWT
- Route-level protection using middleware
- Proper error handling for invalid or missing tokens

✔ Authentication layer fully functional and production-structured.

---

## ✅ Day 3 – Rental Creation Module (Protected)

### Rental Model Designed With:

- `title`
- `category` (car, bike, camera, harvester, etc.)
- `description`
- `pricePerHour`
- `location`
- `owner` (linked to User model)
- `isAvailable`
- Automatic timestamps

### Features Implemented

- Protected route for creating rental listings
- Owner auto-assigned from authenticated user (`req.user._id`)
- JWT verification before database write
- Error handling for invalid input
- Proper middleware flow execution

### API Endpoint

**POST** `/api/rentals`

Headers:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

Example Body:
```json
{
  "title": "Honda City 2022",
  "category": "car",
  "description": "Well maintained car",
  "pricePerHour": 250,
  "location": "Hyderabad"
}
```

✔ Only authenticated users can create listings  
✔ Ownership securely enforced at backend level  

---

# 🔐 Security Highlights

- JWT-based route protection
- bcrypt password hashing
- Middleware-based authorization
- Owner linking enforced server-side
- Proper HTTP status code handling

---

# 📌 Upcoming Features

- GET all rentals
- GET single rental
- Category-based filtering
- Search by location
- Booking system (hourly pricing logic)
- Razorpay payment integration
- Role-based access control (Admin / Vendor / User)
- React frontend integration

---

# 📊 Current Status

✔ Authentication system completed  
✔ Rental creation module completed  
🚧 Booking and payment modules in progress  

---

## 💡 Vision

To build a scalable multi-category rental marketplace that can serve:

- Urban vehicle rentals
- Agricultural equipment sharing
- Event & camera rentals
- Local equipment marketplaces

Designed with extensibility and production-readiness in mind.

---

