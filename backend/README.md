# ⚙️ Backend API - Joy University Seminar Registration System

RESTful API backend built with **Node.js**, **Express**, and **PostgreSQL**.

---

## 🚀 Quick Start (Backend)

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure `.env`**:
   Ensure `backend/.env` exists and matches your PostgreSQL credentials:
   ```env
   PORT=5000
   NODE_ENV=development
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=seminar_system_db
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/seminar_system_db
   JWT_SECRET=super_secret_jwt_key_university_seminar_2026_secure
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=http://localhost:5173
   ```

3. **Database Migration & Seeding**:
   ```bash
   # Run table migrations
   npm run migrate

   # Seed initial sample data & test accounts
   npm run seed
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Server will run on [http://localhost:5000](http://localhost:5000).

5. **API Health Check**:
   [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Demo Logins

- **Super Admin**: `admin@college.edu` / `Admin@123`
- **Event Admin**: `eventadmin@college.edu` / `Admin@123`
- **Student**: `rahul.sharma@college.edu` / `Student@123`

For full project documentation, see the main [README.md](../README.md).
