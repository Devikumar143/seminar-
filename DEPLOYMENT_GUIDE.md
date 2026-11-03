# 🚀 Full-Stack Deployment Guide: Joy University Seminar System

This guide walks you through making your seminar system live online for **100% free** using standard cloud providers:

- **Database**: Cloud PostgreSQL via [Neon.tech](https://neon.tech) (Free tier)
- **Backend API**: Node.js/Express Web Service via [Render.com](https://render.com) (Free tier)
- **Frontend App**: React/Vite SPA via [Vercel](https://vercel.com) (Free tier)

---

## 🗄️ Step 1: Create Free Cloud PostgreSQL Database (Neon)

1. Go to [https://neon.tech](https://neon.tech) and sign up / log in with your GitHub account.
2. Click **Create Project**:
   - **Project Name**: `seminar-system-db`
   - **Postgres version**: `16` (or latest)
   - Click **Create Project**.
3. In your Neon dashboard under **Connection Details**:
   - Select **Connection string**
   - Choose **Postgres** (or Node.js)
   - Copy the full connection string URL. It looks like:
     ```text
     postgresql://neondb_owner:AbCd1234@ep-cool-fog-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
     ```
   *(Keep this string handy for Step 2 and Step 3!)*

---

## ⚙️ Step 2: Initialize Database Tables & Demo Data

You can run the migrations directly from your local computer against the new Neon database!

1. Open your terminal in the `backend` folder:
   ```bash
   cd backend
   ```
2. Run migration using your new Neon `DATABASE_URL` (replace with your actual Neon connection string):
   - **On Windows PowerShell**:
     ```powershell
     $env:DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@YOUR_HOST/neondb?sslmode=require"
     npm run migrate
     npm run seed
     ```
   - **On Git Bash / macOS / Linux**:
     ```bash
     DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@YOUR_HOST/neondb?sslmode=require" npm run migrate
     DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@YOUR_HOST/neondb?sslmode=require" npm run seed
     ```
3. You will see:
   ```text
   ✅ Migrations completed successfully! All tables created.
   🌱 Seeding database with demo data...
   ✅ Seeding completed successfully!
   ```

---

## 🖥️ Step 3: Deploy Backend API (Render)

1. Go to [https://render.com](https://render.com) and log in with GitHub.
2. Click **New +** > **Web Service**.
3. Choose **Build and deploy from a Git repository** and connect `Devikumar143/seminar-`.
4. Configure the Web Service settings:
   - **Name**: `seminor-backend` (or your choice)
   - **Region**: Choose the closest region (e.g. Frankfurt, Oregon, Singapore)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Scroll down to **Environment Variables** and add:
   - `DATABASE_URL` = *(Paste your Neon connection string from Step 1)*
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
   - `JWT_SECRET` = `super_secret_jwt_key_university_seminar_2026_secure`
   - `FRONTEND_URL` = `https://your-frontend-project.vercel.app` *(You can update this after Step 4)*
6. Click **Deploy Web Service**.
7. Wait 2 minutes until it shows **Live**.
8. Copy your backend URL: e.g. `https://seminor-backend.onrender.com`.
   - Test it by visiting `https://seminor-backend.onrender.com/api/health` in your browser. It should return:
     `{"status":"online","service":"Joy University Seminar System API"}`

---

## 🎨 Step 4: Deploy Frontend (Vercel)

1. Go to [https://vercel.com](https://vercel.com) and log in with GitHub.
2. Click **Add New...** > **Project**.
3. Select your repository: `seminar-`.
4. Configure Project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: click **Edit** and choose `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand **Environment Variables**:
   - Name: `VITE_API_URL`
   - Value: `https://seminor-backend.onrender.com/api` *(Your Render backend URL with `/api` at the end)*
6. Click **Deploy**.
7. In ~60 seconds, your site will be live at `https://<your-project-name>.vercel.app`!

---

## 🔄 Step 5: Final Link & Test

1. Go back to [Render.com](https://render.com) > your `seminor-backend` service > **Environment**.
2. Update `FRONTEND_URL` with your final Vercel URL (e.g. `https://your-project-name.vercel.app`) without trailing slash.
3. Save changes (Render will automatically redeploy).
4. Visit your live Vercel URL:
   - Login with demo admin: `admin@college.edu` / `Admin@123`
   - Test seminar browsing, registering, QR code pass, attendance scanner, and certificate verification!

