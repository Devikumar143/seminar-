# 🎓 Joy University - Online Seminar Registration System

A full-stack seminar registration and management platform built with **React 19**, **TypeScript**, **Tailwind CSS**, **Node.js / Express**, and **PostgreSQL**. The platform features digital QR entry passes, real-time QR attendance scanning, automated certificate issuance & verification, and a comprehensive admin analytics dashboard.

---

## 📋 Table of Contents
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [How to Start the Application](#-how-to-start-the-application)
  - [Step 1: Database Setup](#step-1-database-setup-postgresql)
  - [Step 2: Backend Setup & Launch](#step-2-backend-setup--launch)
  - [Step 3: Frontend Setup & Launch](#step-3-frontend-setup--launch)
- [Application URLs](#-application-urls)
- [Demo Credentials](#-demo-credentials)
- [Project Structure](#-project-structure)
- [Features](#-features)
- [Troubleshooting](#-troubleshooting)

---

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, React Router v7, Lucide Icons, Axios, HTML5 QR Scanner
- **Backend**: Node.js, Express.js, PostgreSQL (`pg`), JWT authentication, Bcrypt, PDFKit, QRCode, Helmet, Morgan
- **Database**: PostgreSQL

---

## ⚙️ Prerequisites

Before starting, ensure you have the following installed on your machine:
1. **Node.js** (v18.0.0 or higher recommended) - [Download Node.js](https://nodejs.org/)
2. **PostgreSQL** (v14 or higher) - [Download PostgreSQL](https://www.postgresql.org/)
3. **npm** (comes bundled with Node.js)

---

## 🚀 How to Start the Application

Follow these steps in order to get both the backend and frontend up and running:

### Step 1: Database Setup (PostgreSQL)

1. Ensure your PostgreSQL service is running on your machine.
2. Create the target database using `psql` or **pgAdmin**:
   ```sql
   CREATE DATABASE seminar_system_db;
   ```

---

### Step 2: Backend Setup & Launch

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   - Check or edit the `.env` file in the `backend/` folder (you can copy `.env.example` to `.env` if missing).
   - Ensure the database credentials match your local PostgreSQL configuration:
     ```env
     PORT=5000
     NODE_ENV=development

     DB_USER=postgres
     DB_PASSWORD=your_postgres_password
     DB_HOST=localhost
     DB_PORT=5432
     DB_NAME=seminar_system_db

     DATABASE_URL=postgresql://postgres:your_postgres_password@localhost:5432/seminar_system_db

     JWT_SECRET=super_secret_jwt_key_university_seminar_2026_secure
     JWT_EXPIRES_IN=7d
     FRONTEND_URL=http://localhost:5173
     ```

4. Run database migrations (creates all required tables):
   ```bash
   npm run migrate
   ```

5. Seed sample demo data (creates demo accounts, seminars, registrations & passes):
   ```bash
   npm run seed
   ```

6. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend will start on **`http://localhost:5000`**.*

---

### Step 3: Frontend Setup & Launch

1. Open a **new separate terminal** and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will start on **`http://localhost:5173`**.*

---

## 🌐 Application URLs

| Service | URL | Description |
| :--- | :--- | :--- |
| **Frontend Web App** | [http://localhost:5173](http://localhost:5173) | Main UI (Student & Admin portal) |
| **Backend API** | [http://localhost:5000](http://localhost:5000) | REST API server |
| **API Health Check** | [http://localhost:5000/api/health](http://localhost:5000/api/health) | Confirms backend server status |

---

## 🔑 Demo Credentials

The database seeder automatically creates test accounts with full sample records:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@college.edu` | `Admin@123` | Full administrative control, all settings & analytics |
| **Event Admin** | `eventadmin@college.edu` | `Admin@123` | Create & manage seminars, attendance scanner |
| **Student (Demo)** | `rahul.sharma@college.edu` | `Student@123` | Student dashboard, registration, QR pass & certificate |

> **Note:** You can also register a new student account directly from the **Register** page on the frontend!

---

## 📁 Project Structure

```text
online-seminar/
├── backend/
│   ├── database/
│   │   ├── migrate.js        # Migration runner script
│   │   ├── schema.sql         # PostgreSQL database schema & tables
│   │   └── seed.js           # Demo database seeder script
│   ├── src/
│   │   ├── config/           # Database connection pool setup
│   │   ├── controllers/      # Route controllers (Auth, Seminars, etc.)
│   │   ├── middleware/       # JWT auth & error handling middlewares
│   │   ├── routes/           # Express API route endpoints
│   │   ├── services/         # QR, email & PDF certificate services
│   │   └── server.js         # Backend entry point
│   ├── .env                  # Environment variables
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/       # Reusable UI components & modals
    │   ├── context/          # React Auth & Notification Contexts
    │   ├── layouts/          # Student, Admin & Public layouts
    │   ├── pages/            # Page views (Home, Seminars, Admin, etc.)
    │   ├── services/         # Axios API client & endpoints
    │   ├── App.tsx           # Router configuration
    │   └── main.tsx          # React application root
    ├── vite.config.ts        # Vite configuration with API proxy
    └── package.json
```

---

## ✨ Features

- 🎟️ **Seminar Discovery & Registration**: Browse upcoming seminars, view speaker details, topics, seat availability, and register instantly.
- 📱 **Digital QR Entry Pass**: Unique encrypted QR code generated for every confirmed registration with downloadable pass.
- 📷 **Live QR Attendance Scanner**: Built-in camera scanner for event organizers to scan student passes and mark attendance in real time.
- 📜 **Automated PDF Certificates**: Attendee certificates generated on-the-fly with unique verification IDs and downloadable PDF format.
- 🔍 **Certificate Verification Portal**: Public verification page to validate certificate authenticity via certificate ID or QR code.
- 📊 **Admin Dashboard & Analytics**: Real-time stats on registrations, attendance rate, department participation, and capacity tracking.

---

## ❓ Troubleshooting

- **Database Connection Error (`ECONNREFUSED` or password authentication failed)**:
  - Verify PostgreSQL service is active in Windows Services (`services.msc`) or pgAdmin.
  - Double check your `DB_USER`, `DB_PASSWORD`, `DB_PORT`, and `DB_NAME` in `backend/.env`.
- **Port 5000 or 5173 already in use**:
  - Backend: Change `PORT=5001` in `backend/.env` and update the proxy target in `frontend/vite.config.ts`.
  - Frontend: Vite will automatically offer an alternative port (e.g. `5174`), or specify `--port 5174`.
- **API calls failing from frontend**:
  - Ensure the backend server is running in its terminal before interacting with the frontend app.
