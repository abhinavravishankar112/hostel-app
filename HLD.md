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

**Shared Server Modules:**

| Module | Purpose |
|---|---|
| `utils/compatibility.js` | Pure scoring function shared by the directory and profile endpoints |

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

## 5. Real-Time Chat Architecture

```
User A Browser               Server (Socket.IO)          User B Browser
     │                             │                            │
     │── connect (JWT auth) ──────►│                            │
     │                             │── connect (JWT auth) ──────│
     │                             │                            │
     │                             │  socket.join(userId)       │
     │                             │  onlineUsers Map updated   │
     │                             │                            │
     │── emit('send_message',     ►│                            │
     │    {to: B_id, content})     │                            │
     │                             │  Message.create() → DB     │
     │                             │                            │
     │◄── emit('message_sent')    ─│                            │
     │                             │── io.to(B_id).emit(       ─│
     │                             │   'receive_message', msg)  │
     │                             │                            │
```

**Key Design Decisions:**
- Each socket joins a **room named by their own userId** on connection.
- Server uses `io.to(targetUserId).emit(...)` for point-to-point delivery.
- Messages are **persisted to MongoDB** before being emitted.
- Socket connections are authenticated via JWT in the `handshake.auth.token`.

---

## 6. Data Flow — Roommate Request Lifecycle

```
State Machine:

  [No Request]
       │
       ├──► sendRequest() ──────────► [Pending]
       │                                   │
       │                          ┌────────┤
       │                          │        │
       │                    accept()   reject()
       │                          │        │
       │                          ▼        ▼
       │                      [Accepted]  [Rejected]
       │                          │
       │                    unmatch()
       │                          │
       └──────────────────────────┘
       
  cancelRequest() can be called from [Pending] by the sender → [No Request]
```

---

## 7. Compatibility Scoring

Compatibility is computed **server-side** by a single pure module, `server/utils/compatibility.js`, which both student-facing read endpoints call. Keeping the rules out of the controllers means they are defined once, are unit-testable without a database, and cannot drift between the directory view and the profile view.

```
   GET /api/users/hostel                    GET /api/users/:id
           │                                         │
   caller's profile +                        caller's profile +
   every hostel member                       one target profile
           │                                         │
           └────────────────┬────────────────────────┘
                            ▼
         ┌────────────────────────────────────────────┐
         │        utils/compatibility.js               │
         │   computeCompatibility(mine, theirs)        │
         │                                             │
         │   1. score each dimension 0..1              │
         │   2. skip any dimension either side         │
         │      left blank                             │
         │   3. renormalize over the weights           │
         │      actually used                          │
         └────────────────────────────────────────────┘
                            │
           ┌────────────────┴────────────────┐
           ▼                                 ▼
   { score, confidence,              ...plus breakdown[]
     sharedHobbies }                 (per-dimension reasons)

   breakdown stripped from the       full explanation kept for
   list to keep it small             the profile page
```

**Dimensions and weights** — sleep schedule 30, study habits 25, social style 20, shared interests 15, year 10. The weights total 100, so the result reads directly as a percentage. Sleep schedule dominates because it is the most common cause of real roommate conflict; shared interests are deliberately a minority of the score, since living well with someone is not the same as sharing their hobbies.

**Handling incomplete profiles.** Most students fill in their profile gradually, so the common case is comparing against partial data. Rather than treating a blank field as a mismatch, the scorer skips any dimension either side has left empty and redistributes its weight across the rest. The result is an honest score over what is actually known, plus a `confidence` value reporting how much of the profile that covered. Two students with nothing comparable score `null`, not `0` — the difference between "we cannot say" and "you are incompatible" matters, and the UI renders them differently.

**Explainability over accuracy.** The score ships with a per-dimension `breakdown` carrying a plain-language reason for each contribution ("You're both night owls", "Quiet studying vs group studying"). A number a student cannot interrogate will not be trusted with a decision as consequential as who they live with, so the reasoning is treated as part of the feature rather than as debug output.

---

## 8. Deployment Architecture

```
┌─────────────────────┐         ┌─────────────────────┐
│     Vercel          │         │     Render           │
│  (Frontend CDN)     │◄───────►│  (Backend Server)    │
│                     │  HTTPS  │                      │
│  React SPA          │  WSS    │  Node.js + Express   │
│  hostel-app.vercel  │         │  + Socket.IO         │
│  .app               │         │                      │
└─────────────────────┘         └──────────┬──────────┘
                                            │
                                  ┌─────────┴────────────┐
                                  │   MongoDB Atlas       │
                                  │   (Cloud DB, US-East) │
                                  └──────────────────────┘
```

**CI/CD:**
- Frontend: Vercel auto-deploys on `git push` to `main`
- Backend: Render auto-deploys on `git push` to `main`

---

## 9. Key Design Decisions & Rationale

| Decision | Rationale |
|---|---|
| **JWT stored in localStorage** | Simple implementation for v1; acceptable given single-university scope. Consider httpOnly cookies for v2. |
| **Socket.IO room per userId** | Eliminates need for complex room management; each user is always reachable via their own ID room. |
| **Messages persisted before emit** | Guarantees message durability even if recipient is offline. |
| **Hostel-scoped requests** | Enforced at controller level — prevents cross-hostel requests, reducing noise and maintaining privacy. |
| **Cloudinary unsigned preset** | Simplifies client-side uploads without exposing API secrets; suitable for profile pictures. |
| **React Context for Auth/Socket** | Avoids prop drilling for globally needed auth state and socket instance; appropriate for app size. |
| **1:1 match constraint** | Mirrors real-world hostel room capacity (typically 2 students per room). |
| **Deterministic weighted scoring, not ML** | No historical match-outcome data exists to train on, and a hand-weighted model is explainable to students and tunable by hand. Learned weights are a v2.1 candidate once real outcomes accumulate. |
| **Scoring on the server** | One definition of the rules, shared by two endpoints, testable without a browser and not tamperable from the client. |
| **Redistributing weight for blank fields** | Incomplete profiles are the norm early on; penalising them would make every score meaningless at launch. Confidence carries that uncertainty instead. |
| **`null` score rather than `0`** | "Not enough data" and "incompatible" are different claims. Collapsing them would misrepresent students who simply have not filled in a profile yet. |
| **`breakdown` stripped from the list response** | The directory renders only the headline number; sending five reason strings per member would inflate the payload for data the page never shows. |

---

*Document Owner: Abhinav Ravishankar*  
*Last Updated: August 2026*
