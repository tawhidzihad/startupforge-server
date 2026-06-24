# StartupForge Server

Backend API for StartupForge - Startup Team Builder Platform.

This server powers the StartupForge ecosystem by handling authentication, startup management, opportunities, applications, subscriptions, revenue analytics, and admin operations.

---

## 🚀 Live API

Deploy your API URL here

```txt
https://startupforge-server-six.vercel.app
```

---

## 📖 Overview

StartupForge Server is a RESTful API built with Express.js and MongoDB.

The server provides secure endpoints for:

- Authentication & Authorization
- Startup Management
- Opportunity Management
- Applications Management
- Subscription Management
- Revenue Analytics
- Admin Dashboard Operations

---

## ✨ Features

### 🔐 Authentication & Authorization

- Token Verification Middleware
- Session Validation
- Role-Based Access Control
- Blocked User Protection
- Protected Routes

### 👨‍💼 Founder Features

- Create Startup
- Update Startup
- Delete Startup
- Create Opportunities
- Manage Opportunities
- Accept Applications
- Reject Applications

### 👨‍💻 Collaborator Features

- Submit Applications
- Track Applications
- Browse Opportunities
- View Startups

### 🛡️ Admin Features

- View All Users
- Block / Unblock Users
- Approve Startups
- Reject Startups
- Delete Startups
- View Transactions
- Revenue Analytics

### 💳 Subscription Features

- Premium Plan Upgrades
- Subscription Records
- Revenue Tracking
- Monthly Revenue Analytics
- Total Revenue Analytics

### 📊 Analytics

- Total Revenue
- Monthly Revenue
- Subscription Statistics
- Dashboard Data

---

## 🛠️ Technologies Used

### Backend

- Node.js
- Express.js

### Database

- MongoDB
- MongoDB Aggregation Pipeline

### Utilities

- dotenv
- cors

---

## 📂 API Modules

### Users

```txt
GET    /api/admin/users
PATCH  /api/admin/users/:id
```

### Plans

```txt
GET    /api/plans
```

### Startups

```txt
POST   /api/startups
GET    /api/startups
PATCH  /api/startups/:id
DELETE /api/startups/:id
```

### Opportunities

```txt
POST   /api/opportunities
GET    /api/opportunities
PATCH  /api/opportunities/:id
DELETE /api/opportunities/:id
```

### Applications

```txt
POST   /api/applications
GET    /api/applications
PATCH  /api/applications/:id
```

### Public APIs

```txt
GET /api/public/startups
GET /api/public/startups/:id

GET /api/public/opportunities
GET /api/public/opportunities/:id

GET /api/public/opportunity/:id
```

### Subscriptions

```txt
POST /api/success/subscriptions
GET  /api/success/subscriptions
```

---

## 🔒 Security

StartupForge Server includes:

- Token Verification Middleware
- Session Validation
- Role Based Authorization
- Blocked User Detection
- Protected Routes
- MongoDB Query Protection

---

## 📈 Revenue Analytics

The API provides:

### Total Revenue

```json
{
	"totalRevenue": 2499.75
}
```

### Monthly Revenue

```json
[
	{
		"month": "Jun",
		"revenue": 399.96
	},
	{
		"month": "Jul",
		"revenue": 799.92
	}
]
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory.

```env
PORT=

MONGO_DB_URI=
```

---

## 📦 Installation

### Clone Repository

```bash
git clone https://github.com/tawhidzihad/startupforge-server.git
```

### Install Dependencies

```bash
npm install
```

### Run Server

```bash
npm run server
```

---

## 📁 Project Structure

```txt
startupforge-server
│
├── index.js
├── package.json
├── .env
│
└── MongoDB Collections
    ├── user
    ├── session
    ├── startups
    ├── opportunities
    ├── applications
    ├── plans
    └── subscriptions
```

---

## 🔗 Related Repositories

### Client Repository

https://github.com/tawhidzihad/startupforge-client

### Live Website

https://startupforge-platform.vercel.app/

---

## 👨‍💻 Author

**Md Tawhidul Islam Zihad** MERN Stack Developer

StartupForge - Startup Team Builder Platform
