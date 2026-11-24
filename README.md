# Planova – Personal Task Management System V1.0

A complete full-stack personal productivity app with an elegant **Purple Haze** theme.

## Features

- Dashboard with live MongoDB statistics
- Full task CRUD (create, read, update, delete)
- Recurring / repeat tasks with automatic occurrence generation
- Today view for due-today tasks
- Search, filter, and sort
- List & grid views
- Light / dark mode (saved in localStorage)
- Framer Motion animations & toast notifications
- Fully responsive layout

## Tech Stack

| Layer    | Stack                                      |
|----------|--------------------------------------------|
| Frontend | React, Vite, Tailwind CSS, React Router, Axios, Framer Motion, Recharts |
| Backend  | Node.js, Express, MongoDB, Mongoose        |

## Prerequisites

- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas URI)

## Setup

### 1. Backend

```bash
cd backend
npm install
```

Create / edit `backend/.env`:

```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/taskora
FRONTEND_URL=http://localhost:5173
```

Start the API:

```bash
npm run dev
```

API runs at `http://localhost:5000`

### 2. Frontend

```bash
cd frontend
npm install
```

Create / edit `frontend/.env`:

```
VITE_API_URL=http://localhost:5000/api
```

Start the app:

```bash
npm run dev
```

App runs at `http://localhost:5173`

## Live Backend (Render)

```
https://planova-web-aa8s.onrender.com
```

Health check: `https://planova-web-aa8s.onrender.com/api/health`

Frontend production build uses:

```
VITE_API_URL=https://planova-web-aa8s.onrender.com/api
```


## API Endpoints

| Method | Endpoint                 | Purpose                |
|--------|--------------------------|------------------------|
| GET    | /api/tasks               | Get all tasks          |
| GET    | /api/tasks/:id           | Get one task           |
| POST   | /api/tasks               | Create task            |
| PUT    | /api/tasks/:id           | Update task            |
| PATCH  | /api/tasks/:id/status    | Update status          |
| DELETE | /api/tasks/:id           | Delete task            |
| DELETE | /api/tasks               | Clear all tasks        |
| GET    | /api/tasks/today         | Today's tasks          |
| GET    | /api/dashboard/stats     | Dashboard statistics   |
| GET    | /api/recurring-tasks     | List recurring schedules |
| POST   | /api/recurring-tasks     | Create recurring schedule |

## Color Theme – Purple Haze

- Deep Purple `#211A35`
- Primary Purple `#7656D6`
- Soft Lavender `#B69AF7`
- Background `#F5F1FC`
- Light Purple `#D9C9F5`

## Project Structure

```
Planova/
├── frontend/     # React + Vite app
└── backend/      # Express + MongoDB API
```

## Notes

- No authentication — personal single-user V1
- Theme preference persists via localStorage
- All task data is stored in MongoDB
