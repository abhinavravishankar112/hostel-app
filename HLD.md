# High-Level Design (HLD)
# HostelMatch — Roommate Matching Platform

**Version:** 1.0  
**Date:** August 2026  

---

## 1. System Overview

HostelMatch is a full-stack web application with a **React (Vite) SPA frontend**, a **Node.js/Express REST API backend**, **MongoDB Atlas** as the database, and **Socket.IO** for real-time communication. Profile images are stored and served via **Cloudinary CDN**.

---

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
│                                                                   │
│   React SPA (Vite)                                                │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│   │  Auth Pages   │  │ Browse/Match │  │   Real-time Chat     │  │
│   │ Login/Register│  │ Pages        │  │   (Socket.IO Client) │  │
│   └──────────────┘  └──────────────┘  └──────────────────────┘  │
│            │                │                    │               │
│        Axios REST       Axios REST           Socket.IO WS        │
└────────────┼────────────────┼────────────────────┼───────────────┘
             │                │                    │
             ▼                ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND SERVER (Render)                       │
│                                                                   │
│   Node.js + Express.js                                            │
│   ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│   │  REST API   │  │  Auth        │  │  Socket.IO Server   │   │
│   │  /api/*     │  │  Middleware  │  │  (WS Gateway)       │   │
│   └─────────────┘  └──────────────┘  └─────────────────────┘   │
│          │                                       │               │
│     Controllers                           Message Handler        │
│  ┌───────┴────────┐                             │               │
│  │ auth / users / │                             │               │
│  │ matches /      │                             │               │
│  │ messages       │                             │               │
│  └───────┬────────┘                             │               │
└──────────┼───────────────────────────────────────┼──────────────┘
           │                                       │
           ▼                                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATA LAYER (MongoDB Atlas)                     │
│                                                                   │
│   Collections:  Users | Hostels | MatchRequests | Messages       │
└─────────────────────────────────────────────────────────────────┘
           
           Cloudinary CDN
           ┌──────────────────────────┐
           │  Profile Picture Storage │
           │  (Uploaded directly from │
           │   the client browser)    │
           └──────────────────────────┘
```

---

## 3. Component Overview

### 3.1 Frontend (Client)

| Component | Technology | Hosting |
|---|---|---|
| SPA Framework | React 18 + Vite | Vercel |
| Routing | React Router DOM v6 | — |
| HTTP Client | Axios | — |
| Real-time Comms | Socket.IO Client | — |
| Image Upload | Cloudinary Upload API (unsigned preset) | Cloudinary CDN |
| State Management | React Context API (AuthContext, SocketContext) | — |

**Key Pages:**

| Route | Page | Auth Required |
|---|---|---|
| `/` | Landing | No |
| `/register` | Register | No |
| `/login` | Login | No |
| `/browse` | Hostel Directory | Yes |
| `/profile/:id` | Student Profile View | Yes |
| `/me` | My Profile (edit) | Yes |
| `/requests` | Requests Inbox/Sent | Yes |
| `/chat/:userId` | Real-Time Chat | Yes |

### 3.2 Backend (Server)

| Component | Technology | Hosting |
|---|---|---|
| Runtime | Node.js v18+ | Render |
| Web Framework | Express.js v5 | — |
| WebSocket Server | Socket.IO v4 | — |
| Auth | JWT (jsonwebtoken) + bcryptjs | — |
| ORM/ODM | Mongoose v9 | — |

**API Route Groups:**

| Prefix | Module | Purpose |
|---|---|---|
| `/api/auth` | authController | Register, Login |
| `/api/users` | userController | Profile CRUD, Hostel Directory |
| `/api/matches` | matchController | Request lifecycle + Unmatch |
| `/api/messages` | messages route | Fetch chat history |

### 3.3 Database (MongoDB Atlas)

| Collection | Purpose |
|---|---|
| `users` | Student accounts and profile data |
| `hostels` | Hostel names and valid roll number lists |
| `matchrequests` | Roommate request lifecycle (pending/accepted/rejected) |
| `messages` | Chat messages between matched students |

### 3.4 External Services

| Service | Purpose | Free Tier Limit |
|---|---|---|
| **MongoDB Atlas** | Primary database | 512MB storage |
| **Cloudinary** | Profile picture storage & CDN delivery | 25 credits/month |
| **Render** | Backend hosting | 750 hours/month, sleeps after 15min idle |
| **Vercel** | Frontend hosting | Unlimited hobby deploys |

---

## 4. Authentication & Security Flow

```
Client                        Server                      DB
  │                              │                          │
  │──── POST /api/auth/login ───►│                          │
  │       {email, password}      │                          │
  │                              │──── findOne({email}) ───►│
  │                              │◄────────── user ─────────│
  │                              │                          │
  │                              │  bcrypt.compare()        │
  │                              │  jwt.sign({id, hostel})  │
  │                              │                          │
  │◄────── {token, user} ────────│                          │
  │                              │                          │
  │  (stored in localStorage)    │                          │
  │                              │                          │
  │── GET /api/users/hostel ────►│                          │
  │   Authorization: Bearer <JWT>│                          │
  │                              │  auth middleware:         │
  │                              │  jwt.verify(token)       │
  │                              │  req.user = {id, hostel} │
  │                              │──── query hostel ───────►│
  │◄────── [student list] ───────│                          │
```

**Token Lifecycle:**
- Issued on login or registration, expires in **7 days**
- Stored in browser **localStorage**
- Sent as `Authorization: Bearer <token>` header on every protected request
- Verified in `auth.js` middleware before any protected controller runs

---


---
*Draft — August 2026*
