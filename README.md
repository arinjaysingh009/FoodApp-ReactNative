# 🍕 FoodApp - React Native Food Ordering System

[![React Native](https://img.shields.io/badge/React%20Native-0.73-blue.svg)](https://reactnative.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green.svg)](https://www.mongodb.com/)
[![Kafka](https://img.shields.io/badge/Kafka-3.6-orange.svg)](https://kafka.apache.org/)

## 🚀 Complete Full-Stack Food Ordering Application

### ✨ Key Features

#### 👤 User Features
- **OTP Login**: Login/Register using OTP via Email OR Mobile (SMS)
- **Forgot Password**: Reset password using OTP verification
- **Browse Menu**: View all available food items with images, prices, ratings
- **Add to Cart**: Manage cart items with quantity selection
- **Checkout & Payment**: Multiple payment methods (Card, Cash, UPI, Wallet)
- **Order Tracking**: Real-time order tracking with live location updates
- **Rate & Review**: Rate food items and delivery partners
- **Real-time Notifications**: SMS/Email/Push notifications for order status

#### 👨‍💼 Admin Features
- **Food Management**: Add/Edit/Delete food items with image uploads
- **Enable/Disable Items**: Toggle food availability in real-time
- **Order Management**: View and manage all orders
- **Analytics Dashboard**: Sales reports and insights
- **Category Management**: Organize food items by categories

#### 🔧 Technical Features
- **Dual Database**: PostgreSQL (relational data) + MongoDB (cart/sessions)
- **Kafka Integration**: Order tracking events and real-time updates
- **WebSocket**: Live order status updates
- **JWT Authentication**: Secure token-based auth
- **Image Upload**: Cloudinary integration for food images
- **Payment Gateway**: Stripe integration
- **Email Service**: Nodemailer for email OTP
- **SMS Service**: Twilio for SMS OTP

---

## 📁 Project Structure

```
FoodApp-ReactNative/
├── backend/                    # Node.js Express Backend
│   ├── config/
│   │   ├── database.js        # PostgreSQL & MongoDB
│   │   ├── kafka.js           # Kafka producer/consumer
│   │   └── twilio.js          # SMS config
│   ├── controllers/
│   │   ├── authController.js  # Login, Register, OTP
│   │   ├── userController.js
│   │   ├── adminController.js
│   │   ├── orderController.js
│   │   └── ratingController.js
│   ├── middleware/
│   │   ├── authMiddleware.js  # JWT verification
│   │   └── upload.js          # Multer image upload
│   ├── models/
│   │   ├── User.js            # MongoDB User model
│   │   └── Cart.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── user.js
│   │   ├── admin.js
│   │   └── order.js
│   ├── services/
│   │   ├── otpService.js      # OTP generation
│   │   ├── emailService.js    # Nodemailer
│   │   ├── smsService.js      # Twilio
│   │   └── kafkaService.js
│   ├── database/
│   │   ├── schema.sql         # PostgreSQL schema
│   │   └── seed.sql
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js
│
├── mobile/                     # React Native App
│   ├── src/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── navigation/
│   │   ├── services/
│   │   └── context/
│   ├── .env.example
│   ├── package.json
│   └── App.js
│
├── docker-compose.yml
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- PostgreSQL 16+ ([Download](https://www.postgresql.org/download/))
- MongoDB 7.0+ ([Download](https://www.mongodb.com/try/download/community))
- Apache Kafka 3.6+ ([Download](https://kafka.apache.org/downloads))
- React Native CLI
- Android Studio (for Android development)

### 📦 Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/arinjaysingh009/FoodApp-ReactNative.git
cd FoodApp-ReactNative
```

#### 2. Setup Backend

```bash
cd backend
npm install
```

#### 3. Create Environment Variables

Create `.env` file in `backend/` directory:

```env
# Server
PORT=5000
NODE_ENV=development

# PostgreSQL
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=foodapp
PG_USER=postgres
PG_PASSWORD=your_password

# MongoDB
MONGO_URI=mongodb://localhost:27017/foodapp

# JWT
JWT_SECRET=your_secret_key_change_in_production
JWT_EXPIRES_IN=7d

# Twilio (SMS)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Kafka
KAFKA_BROKER=localhost:9092
KAFKA_CLIENT_ID=foodapp
KAFKA_TOPIC_ORDER_TRACKING=order-tracking-events

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

#### 4. Setup PostgreSQL Database

```bash
# Create database
psql -U postgres
CREATE DATABASE foodapp;
\q

# Run schema
psql -U postgres -d foodapp -f database/schema.sql

# (Optional) Load seed data
psql -U postgres -d foodapp -f database/seed.sql
```

#### 5. Start Backend Server

```bash
npm run dev
# Server runs on http://localhost:5000
```

#### 6. Setup React Native Mobile App

```bash
cd ../mobile
npm install
```

Create `.env` in `mobile/` directory:

```env
API_BASE_URL=http://localhost:5000/api
SOCKET_URL=http://localhost:5001
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
GOOGLE_MAPS_API_KEY=your_maps_key
```

#### 7. Run React Native App

```bash
# Start Metro bundler
npx react-native start

# In another terminal, run Android
npx react-native run-android
```

---

## 🗄️ Database Schema

### PostgreSQL Tables

1. **users** - User accounts (admin/user/delivery)
2. **otp_verifications** - OTP codes for login/forgot password
3. **categories** - Food categories
4. **food_items** - Menu items with images
5. **orders** - Customer orders
6. **order_items** - Order line items
7. **delivery_partners** - Delivery personnel
8. **order_tracking** - Real-time tracking with Kafka
9. **ratings** - Food and delivery ratings
10. **notifications** - SMS/Email/Push notifications

### MongoDB Collections

1. **carts** - Shopping cart sessions
2. **users** - User session data
3. **logs** - Application logs

---

## 📱 API Endpoints

### Authentication
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/send-otp
POST /api/auth/verify-otp
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

### User Routes
```
GET  /api/user/menu
GET  /api/user/food/:id
POST /api/user/cart/add
GET  /api/user/cart
POST /api/user/checkout
GET  /api/user/orders
GET  /api/user/order/:id/track
POST /api/user/rating
```

### Admin Routes
```
POST /api/admin/food
PUT  /api/admin/food/:id
DELETE /api/admin/food/:id
PATCH /api/admin/food/:id/toggle
GET  /api/admin/orders
PUT  /api/admin/order/:id/status
```

---

## 🔑 Default Login Credentials

### Admin
- Email: `admin@foodapp.com`
- Password: `Admin@123`

### User
- Email: `user@foodapp.com`
- Password: `User@123`

---

## 🚦 Order Status Flow

1. **Pending** → Order received
2. **Confirmed** → Restaurant confirmed
3. **Preparing** → Food is being prepared
4. **Ready** → Food ready for pickup
5. **Out for Delivery** → On the way
6. **Delivered** → Order completed
7. **Cancelled** → Order cancelled

---

## 📸 Screenshots

_(Add screenshots here after running the app)_

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Databases**: PostgreSQL, MongoDB
- **Message Queue**: Apache Kafka
- **Authentication**: JWT
- **File Upload**: Multer + Cloudinary
- **Email**: Nodemailer
- **SMS**: Twilio
- **Payment**: Stripe
- **Real-time**: Socket.IO

### Mobile
- **Framework**: React Native
- **Navigation**: React Navigation
- **State Management**: Context API / Redux
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **Maps**: React Native Maps
- **Image Picker**: React Native Image Picker

---

## 📝 Environment Setup Guide

### Get Twilio Credentials (SMS OTP)
1. Sign up at [twilio.com](https://www.twilio.com)
2. Get Account SID and Auth Token
3. Buy a phone number

### Get Gmail App Password (Email OTP)
1. Enable 2-Factor Authentication on Gmail
2. Go to Google Account → Security → App Passwords
3. Generate password for "Mail"

### Get Cloudinary Credentials (Image Upload)
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get Cloud Name, API Key, API Secret

### Get Stripe Keys (Payment)
1. Sign up at [stripe.com](https://stripe.com)
2. Get test keys from Dashboard

---

## 🐳 Docker Setup (Optional)

Run all services using Docker Compose:

```bash
docker-compose up -d
```

This starts:
- PostgreSQL on port 5432
- MongoDB on port 27017
- Kafka on port 9092
- Zookeeper on port 2181

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

---

## 📞 Support

For questions or issues:
- Create an issue on GitHub
- Email: arinjaysingh009@gmail.com

---

## 🎯 Roadmap

- [ ] Add iOS support
- [ ] Implement push notifications (FCM)
- [ ] Add multi-language support
- [ ] Implement loyalty points system
- [ ] Add promo codes and discounts
- [ ] Restaurant multi-tenancy
- [ ] Driver mobile app
- [ ] Web admin dashboard

---

**Made with ❤️ for learning and practice**
