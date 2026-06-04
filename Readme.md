# 🏠 HostelMatch

A roommate-matching platform for university hostel students. Browse profiles of students in your hostel, send roommate requests, and find your ideal living partner — all before move-in day.

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Roadmap](#roadmap)

---

## About

HostelMatch solves a real problem — hostel roommate assignments are random and students have no way to find compatible roommates beforehand. This platform lets students browse everyone assigned to their hostel, view detailed profiles, and send/accept roommate requests before the semester begins.

Currently built for a single university, with plans to expand to more hostels over time.

---

## Features

- 🔐 **Secure Authentication** — Register and login with roll number verification. Only students with a valid roll number assigned to a hostel can sign up.
- 👤 **Detailed Profiles** — Sleep schedule, study habits, social style, hobbies, year, course and more.
- 📷 **Profile Pictures** — Upload custom profile images to stand out.
- 🏘️ **Hostel Directory** — Browse every student in your hostel regardless of their match status.
- 💌 **Roommate Requests** — Send, accept, reject and cancel roommate requests.
- ✅ **Match System** — Once a request is accepted, both students are marked as matched. Button states on the browse page reflect the current match status of every student.
- 💬 **Real-time Chat** — In-app messaging between matched students using WebSockets.
- 🔒 **Protected Routes** — All pages except login and register require authentication.

---

## Tech Stack

**Frontend**
- React (Vite)
- React Router DOM
- Socket.IO Client
- Cloudinary (Image Uploads)
- Axios
- Hosted on Vercel

**Backend**
- Node.js
- Express.js
- Socket.IO (WebSockets)
- JSON Web Tokens (JWT)
- bcryptjs
- Hosted on Render

**Database**
- MongoDB Atlas (Free Tier)
- Mongoose

---

## Getting Started

### Prerequisites
- Node.js v18+
- A MongoDB Atlas account
- Git

### Clone the repository

```bash
git clone https://github.com/yourusername/hostel-app.git
cd hostel-app
```

### Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` folder:

```env
PORT=5001
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
```

Seed your hostel data by temporarily adding a seed route (see [Getting Started with Hostels](#)) then run:

```bash
npm run dev
```

Server will start at `http://localhost:5001`

### Frontend Setup

```bash
cd client
npm install
```

Create a `.env` file in the `client` folder:

```env
VITE_API_URL=http://localhost:5001
```

Then run:

```bash
npm run dev
```

Client will start at `http://localhost:5173`

---

## Environment Variables

### Server (`/server/.env`)

| Variable | Description |
|---|---|
| `PORT` | Port the server runs on (use 5001 on macOS) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |

### Client (`/client/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API (use `https://hostel-app-server.onrender.com` for production or `http://localhost:5001` for local dev) |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name for profile picture uploads |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Cloudinary unsigned upload preset name |

---

## API Reference

### Auth
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Register with roll number verification | ❌ |
| POST | `/api/auth/login` | Login and receive JWT token | ❌ |

### Users
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/users/me` | Get your own profile | ✅ |
| PUT | `/api/users/me` | Update your profile | ✅ |
| GET | `/api/users/hostel` | Get all students in your hostel | ✅ |
| GET | `/api/users/:id` | Get a specific student's profile | ✅ |

### Matches
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/matches/request/:id` | Send a roommate request | ✅ |
| PUT | `/api/matches/accept/:id` | Accept a roommate request | ✅ |
| PUT | `/api/matches/reject/:id` | Reject a roommate request | ✅ |
| DELETE | `/api/matches/cancel/:id` | Cancel a request you sent | ✅ |
| GET | `/api/matches/requests` | View all incoming requests | ✅ |
| GET | `/api/matches/sent` | View all sent pending requests | ✅ |

---

## Project Structure

```
hostel-app/
├── server/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   └── matchController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Hostel.js
│   │   ├── Message.js
│   │   └── MatchRequest.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── messages.js
│   │   └── matches.js
│   └── server.js
│
└── client/
    └── src/
        ├── api/
        │   └── axios.js
        ├── components/
        │   ├── ImageUpload.jsx
        │   ├── Navbar.jsx
        │   ├── Navbar.css
        │   ├── ProtectedRoute.jsx
        │   ├── StudentCard.jsx
        │   └── StudentCard.css
        ├── context/
        │   ├── AuthContext.jsx
        │   └── SocketContext.jsx
        ├── pages/
        │   ├── Landing.jsx / Landing.css
        │   ├── Login.jsx / Auth.css
        │   ├── Register.jsx
        │   ├── Browse.jsx / Browse.css
        │   ├── Profile.jsx / Profile.css
        │   ├── MyProfile.jsx / MyProfile.css
        │   ├── Chat.jsx
        │   └── Requests.jsx / Requests.css
        ├── App.jsx
        ├── App.css
        ├── main.jsx
        └── index.css
```

---

## Roadmap

- [x] Profile picture upload
- [x] In-app messaging between matched students
- [ ] Add more hostels within the university
- [ ] Notifications for incoming requests
- [x] Mobile responsive design

---

## Contributing

This project is currently built for internal use at one university. If you're a student at the same institution and want to contribute, feel free to open a pull request.

---

## License

MIT License — feel free to fork and adapt for your own university.