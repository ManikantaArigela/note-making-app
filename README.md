# ApexPulse - Professional Personal Productivity SaaS

ApexPulse is a minimalist, modern, personal productivity SaaS application built with the **MERN** stack (**M**ongoDB, **E**xpress, **R**eact, **N**ode.js).

Designed to help users plan their day, execute work, complete tasks, track consistency, and visualize progress.

---

## 🚀 Features

- **Dashboard**: Complete productivity status, Today's completion rate %, Focus hours, Current streak counter, Weekly productivity bar chart (Recharts), Task category breakdown, Goal progress summary, and Motivational productivity insights.
- **GitHub-Style Activity Heatmap**: Signature 365-day contribution heatmap powered by real MongoDB `ActivityEvent` data, with interactive day inspection modals.
- **Today & Tomorrow Views**: Dedicated day execution and planning screens with instant checkbox completion, automatic activity recording, and task shifting between Today / Tomorrow / Inbox.
- **Inbox**: Unscheduled task capture with search, category/priority filters, and quick scheduling.
- **Universal Add Task Modal**: Access anywhere to specify title, description, due date, time, priority, category, project, goal, estimated duration, recurrence (daily, weekday, weekly, monthly, yearly), and subtasks.
- **Goals & Projects**: Outcome-focused goals and multi-task project workspaces with progress tracking.
- **Focus Zone**: Interactive Pomodoro (25m/50m) and custom timer connected to tasks and projects with audio chime completion synthesis.
- **Multi-User Social Friends**: Search users, send/accept friend requests, and view friend productivity streak leaderboards (private tasks strictly protected).
- **Smart Notifications**: Motivational web push alerts, in-app notifications, quiet hours customization, and optional email alerts.
- **Gamification**: XP points, Leveling system, Badges, and Milestones.
- **Mobile & PWA**: Fully responsive layout with mobile bottom navigation bar and service worker support.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React Icons, Recharts, Axios.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB & Mongoose.
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs password hashing.
- **Notifications**: Web Push (`web-push`), Nodemailer.

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/productivity_app
JWT_SECRET=super_secret_productivity_jwt_key_2026
VAPID_PUBLIC_KEY=BEl62iUYgUivxIkv69yViEuiBIa-m9GYv54L356v5Yk
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_EMAIL=admin@productivityapp.local
```

---

## 🏃 Quick Start (Local Development)

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Seed Initial Test Data (Optional)

```bash
cd backend
npm run seed
```

This creates a demo account:
- **Email**: `demo@example.com`
- **Password**: `password123`

### 3. Run Backend Server

```bash
cd backend
npm run dev
```

*Backend runs at http://localhost:5000*

### 4. Run Frontend Development Server

```bash
cd frontend
npm run dev
```

*Frontend runs at http://localhost:5173*

---

## 🚢 Deployment Guide

### Frontend → Vercel

1. Push your repository to GitHub.
2. Import project into Vercel dashboard.
3. Set **Root Directory** to `frontend`.
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-render-backend-url.onrender.com/api`

### Backend → Render

1. Create a Web Service on Render pointing to your GitHub repository.
2. Set **Root Directory** to `backend`.
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Environment Variables:
   - `MONGODB_URI`: *Your MongoDB Atlas connection string*
   - `JWT_SECRET`: *Your JWT Secret*
   - `VAPID_PUBLIC_KEY` & `VAPID_PRIVATE_KEY`

---

## 🌐 Database Setup (MongoDB Atlas)

1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a Database User and whitelist `0.0.0.0/0` in Network Access.
3. Copy connection string into `MONGODB_URI` environment variable.
