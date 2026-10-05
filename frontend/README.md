# 🎓 Frontend - Joy University Seminar Registration System

This is the client-side single-page application built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS**.

---

## 🚀 Quick Start (Frontend)

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```
   The application will be available at [http://localhost:5173](http://localhost:5173).

3. **Build for production**:
   ```bash
   npm run build
   ```

4. **Linting**:
   ```bash
   npm run lint
   ```

---

## 🔗 Backend Connection

- Vite is preconfigured in `vite.config.ts` to proxy all `/api/*` requests directly to `http://localhost:5000`.
- Ensure the backend server is running concurrently on port 5000.
- For complete setup instructions (including PostgreSQL database and backend server), refer to the root [README.md](../README.md).
