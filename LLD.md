# Low-Level Design (LLD)
# HostelMatch — Roommate Matching Platform

**Version:** 1.0  
**Date:** August 2026  

---

## 1. Database Schema (MongoDB / Mongoose)

### 1.1 `users` Collection

**Model file:** `server/models/User.js`

```js
{
  _id:        ObjectId,           // auto-generated
  name:       String,  required
  email:      String,  required, unique
  password:   String,  required  // bcrypt hash
  rollNumber: String,  required, unique
  hostel:     String,  required  // matches Hostel.name

  profile: {
    age:           Number,
    course:        String,
    year:          Number,
    bio:           String,
    sleepSchedule: "early bird" | "night owl" | "flexible",
    studyHabits:   "quiet studier" | "group studier" | "flexible",
    socialStyle:   "introverted" | "extroverted" | "mixed",
    hobbies:       [String],
    instagram:     String,
    profilePic:    String        // Cloudinary URL
  },

  createdAt:  Date,              // timestamps: true
  updatedAt:  Date
}
```

**Indexes:**
- `email` — unique
- `rollNumber` — unique
- `hostel` — non-unique (used in directory queries)

---

### 1.2 `hostels` Collection

**Model file:** `server/models/Hostel.js`

```js
{
  _id:              ObjectId,
  name:             String, required, unique   // e.g. "Cauvery Hostel"
  validRollNumbers: [String]                   // whitelisted roll numbers
}
```

**Notes:**
- Populated manually (seed script or Mongo Shell).
- Roll number validation is currently disabled in code (commented out in `authController.js`) — intended to be re-enabled in v1.1.

---

### 1.3 `matchrequests` Collection

**Model file:** `server/models/MatchRequest.js`

```js
{
  _id:    ObjectId,
  from:   ObjectId (ref: User), required
  to:     ObjectId (ref: User), required
  status: "pending" | "accepted" | "rejected",  // default: "pending"

  createdAt: Date,
  updatedAt: Date
}
```

**State Transitions:**

| Current Status | Actor | Action | Resulting Status |
|---|---|---|---|
| (none) | Sender | `sendRequest` | `pending` |
| `pending` | Sender | `cancelRequest` | (deleted) |
| `pending` | Recipient | `acceptRequest` | `accepted` |
| `pending` | Recipient | `rejectRequest` | `rejected` |
| `accepted` | Either | `unmatchRequest` | (deleted) |

---

### 1.4 `messages` Collection

**Model file:** `server/models/Message.js`

```js
{
  _id:     ObjectId,
  from:    ObjectId (ref: User), required
  to:      ObjectId (ref: User), required
  content: String, required, trim
  read:    Boolean, default: false

  createdAt: Date,
  updatedAt: Date
}
```

**Indexes (recommended for production):**
- Compound index on `{ from, to }` and `{ to, from }` for efficient chat history lookups.

---

## 2. API Specification

Base URL: `https://hostel-app-server.onrender.com` (prod) / `http://localhost:5001` (dev)

All protected routes require: `Authorization: Bearer <JWT>`

---

### 2.1 Auth Routes — `/api/auth`

#### POST `/api/auth/register`

**Request Body:**
```json
{
  "name": "Abhinav R",
  "email": "abhinav@university.edu",
  "password": "securepass123",
  "rollNumber": "22CS101",
  "hostel": "Cauvery Hostel"
}
```

**Success Response `201`:**
```json
{
  "token": "<JWT>",
  "user": {
    "id": "<ObjectId>",
    "name": "Abhinav R",
    "email": "abhinav@university.edu",
    "hostel": "Cauvery Hostel"
  }
}
```

**Error Responses:**
| Code | Condition |
|---|---|
| 400 | Hostel not found |
| 400 | Email or roll number already in use |
| 500 | Server error |

**Controller logic (`authController.register`):**
1. Find hostel by name → 400 if not found
2. Check duplicate email/rollNumber → 400 if exists
3. `bcrypt.genSalt(10)` + `bcrypt.hash(password, salt)`
4. `new User({...}).save()`
5. `jwt.sign({id, hostel}, JWT_SECRET, {expiresIn: '7d'})`
6. Return `{token, user}` with `201`

---

#### POST `/api/auth/login`

**Request Body:**
```json
{
  "email": "abhinav@university.edu",
  "password": "securepass123"
}
```

**Success Response `200`:**
```json
{
  "token": "<JWT>",
  "user": { "id": "...", "name": "...", "email": "...", "hostel": "..." }
}
```

**Error Responses:**
| Code | Condition |
|---|---|
| 400 | User not found or password mismatch |
| 500 | Server error |

**Controller logic (`authController.login`):**
1. `User.findOne({email})` → 400 if not found
2. `bcrypt.compare(password, user.password)` → 400 if false
3. `jwt.sign({id, hostel}, JWT_SECRET, {expiresIn: '7d'})`
4. Return `{token, user}` with `200`

---

### 2.2 User Routes — `/api/users` (all protected)

#### GET `/api/users/me`

Returns the authenticated user's full profile (password excluded).

**Success Response `200`:** Full user document without `password`.

**Controller logic (`userController.getMe`):**
- `User.findById(req.user.id).select('-password')`

---

#### PUT `/api/users/me`

Updates the authenticated user's profile.

**Request Body:**
```json
{
  "profile": {
    "age": 20,
    "course": "B.Tech CSE",
    "year": 2,
    "bio": "Love hiking and late-night coding.",
    "sleepSchedule": "night owl",
    "studyHabits": "quiet studier",
    "socialStyle": "mixed",
    "hobbies": ["hiking", "chess"],
    "instagram": "abhinav_r",
    "profilePic": "https://res.cloudinary.com/.../photo.jpg"
  }
}
```

**Success Response `200`:** Updated user document (password excluded).

**Controller logic (`userController.updateMe`):**
- `User.findByIdAndUpdate(req.user.id, {profile: req.body.profile}, {new: true}).select('-password')`

---

#### GET `/api/users/hostel`

Returns all students in the authenticated user's hostel (password excluded).

**Success Response `200`:** Array of user documents.

**Controller logic (`userController.getHostelMembers`):**
- `User.find({hostel: req.user.hostel}).select('-password')`

---

#### GET `/api/users/:id`

Returns a specific student's profile. Only accessible if the target is in the same hostel.

**Success Response `200`:** User document (password excluded).

**Error Responses:**
| Code | Condition |
|---|---|
| 404 | User not found |
| 403 | User is in a different hostel |

**Controller logic (`userController.getUserById`):**
1. `User.findById(params.id).select('-password')` → 404 if null
2. Check `user.hostel === req.user.hostel` → 403 if mismatch
3. Return user

---

### 2.3 Match Routes — `/api/matches` (all protected)

#### POST `/api/matches/request/:id`

Sends a roommate request to user with `:id`.

**Success Response `201`:** Populated MatchRequest document.

**Error Responses:**
| Code | Condition |
|---|---|
| 400 | Cannot send to yourself |
| 403 | Target is in a different hostel |
| 400 | Request already exists between the two |
| 400 | Either user is already matched |

**Controller logic (`matchController.sendRequest`):**
1. Find `toUser` by `params.id` → 404 if null
2. Self-request check → 400
3. Hostel check: `toUser.hostel !== req.user.hostel` → 403
4. Check existing request (`$or` both directions) → 400
5. Check either already accepted → 400
6. `new MatchRequest({from: req.user.id, to: params.id}).save()`
7. Populate `to` field, return `201`

---

#### PUT `/api/matches/accept/:id`

Accepts the MatchRequest with `_id === :id`.

**Success Response `200`:** Updated MatchRequest.

**Error Responses:**
| Code | Condition |
|---|---|
| 404 | Request not found |
| 403 | Caller is not the recipient |
| 400 | Request is not pending |

**Controller logic (`matchController.acceptRequest`):**
1. `MatchRequest.findById(params.id)` → 404 if null
2. `request.to !== req.user.id` → 403
3. `request.status !== 'pending'` → 400
4. `request.status = 'accepted'; request.save()`

---

#### PUT `/api/matches/reject/:id`

Rejects the MatchRequest with `_id === :id`.

**Success Response `200`:** Updated MatchRequest.

**Error Responses:** Same as accept (404, 403, 400).

**Controller logic (`matchController.rejectRequest`):**
- Same as accept but sets `request.status = 'rejected'`

---

#### DELETE `/api/matches/cancel/:id`

Cancels (deletes) a pending request the caller sent.

**Success Response `200`:** `{ message: 'Request cancelled' }`

**Error Responses:**
| Code | Condition |
|---|---|
| 404 | Request not found |
| 403 | Caller is not the sender |
| 400 | Request is not pending |

**Controller logic (`matchController.cancelRequest`):**
1. Find request → 404
2. `request.from !== req.user.id` → 403
3. `request.status !== 'pending'` → 400
4. `request.deleteOne()`

---

#### DELETE `/api/matches/unmatch/:id`

Unmatches an accepted match (either user can call this).

**Success Response `200`:** `{ message: 'Unmatched successfully' }`

**Error Responses:**
| Code | Condition |
|---|---|
| 404 | Match not found |
| 403 | Caller is not a participant |
| 400 | Match is not accepted |

---

#### GET `/api/matches/requests`

Returns all incoming requests (status `pending` or `accepted`) to the caller. Populates `from` field (password excluded).

---

#### GET `/api/matches/sent`

Returns all requests sent by the caller. Populates `to` field (password excluded).

---

### 2.4 Message Routes — `/api/messages` (protected)

#### GET `/api/messages/:userId`

Returns chat history between authenticated user and `:userId`, sorted by `createdAt` ascending.

**Success Response `200`:** Array of message documents.

---

## 3. Auth Middleware

**File:** `server/middleware/auth.js`

```
Request
  │
  ├── Extract token from Authorization header
  │     "Bearer <token>"
  │
  ├── jwt.verify(token, JWT_SECRET)
  │     → on failure: 401 { message: 'No token / Token is not valid' }
  │
  └── req.user = decoded payload { id, hostel }
      → next()
```

All routes under `/api/users`, `/api/matches`, `/api/messages` use this middleware.

---

## 4. Socket.IO — Detailed Flow

**File:** `server/server.js`

### Connection & Authentication

```
Client                                  Server
  │                                        │
  │── io.connect(SERVER_URL, {             │
  │     auth: { token: localStorage       │
  │             .getItem('token') }        │
  │   })                                  ─►│
  │                                        │  io.use() middleware:
  │                                        │  jwt.verify(token, JWT_SECRET)
  │                                        │  socket.user = decoded
  │◄──────────── connected ────────────────│
  │                                        │  socket.join(userId)
  │                                        │  onlineUsers.set(userId, socket.id)
```

### Message Flow

```
Sender                                  Server                               Receiver
  │                                        │                                    │
  │── emit('send_message',               ─►│                                    │
  │    { to: receiverId, content: '...' }) │                                    │
  │                                        │  Message.create({from, to, content})
  │                                        │  → persisted in MongoDB            │
  │                                        │                                    │
  │◄── emit('message_sent', messageDoc) ───│                                    │
  │                                        │─── io.to(receiverId).emit(        ─►│
  │                                        │    'receive_message', messageDoc)   │
```

### Socket Events

| Event | Direction | Payload | Description |
|---|---|---|---|
| `send_message` | Client → Server | `{ to: string, content: string }` | Send a chat message |
| `message_sent` | Server → Sender | Message document | Confirmation with persisted message |
| `receive_message` | Server → Receiver | Message document | Deliver message to recipient |
| `message_error` | Server → Sender | `{ message: string }` | Delivery failure notice |
| `disconnect` | Client → Server | — | Cleanup `onlineUsers` map |

### `onlineUsers` Map

```js
const onlineUsers = new Map();
// Key:   userId (string)
// Value: socket.id (string)
// Purpose: Track currently connected users for presence checks (future use)
```

---

## 5. Frontend Architecture

### 5.1 Context Providers

#### `AuthContext` — `client/src/context/AuthContext.jsx`

| Provided Value | Type | Description |
|---|---|---|
| `user` | Object / null | `{ id, name, email, hostel }` from JWT response |
| `token` | String / null | JWT string from localStorage |
| `login(data)` | Function | Sets user + token, writes to localStorage |
| `logout()` | Function | Clears user + token, removes from localStorage |
| `loading` | Boolean | True while checking localStorage on mount |

**Initialization:**
1. On mount, read `token` from `localStorage`
2. Decode or use stored `user` object
3. Set `loading = false`

#### `SocketContext` — `client/src/context/SocketContext.jsx`

| Provided Value | Type | Description |
|---|---|---|
| `socket` | Socket.IO instance / null | Connected socket, null if logged out |

**Lifecycle:**
- Socket is created when `AuthContext` provides a valid token
- Socket is disconnected on `logout()`
- JWT passed via `auth.token` in connection options

---

### 5.2 Axios Configuration

**File:** `client/src/api/axios.js`

```js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})

// Request interceptor — attaches JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
```

---

### 5.3 Component Breakdown

#### `ProtectedRoute` — `client/src/components/ProtectedRoute.jsx`
- Reads `user` and `loading` from `AuthContext`
- While `loading === true`: renders nothing (or spinner)
- If no `user`: redirects to `/login` via `<Navigate>`
- Otherwise: renders `children`

#### `Navbar` — `client/src/components/Navbar.jsx`
- Renders navigation links: Browse, Requests, My Profile, Logout
- Hidden on Landing, Login, Register pages
- Logout calls `AuthContext.logout()`

#### `StudentCard` — `client/src/components/StudentCard.jsx`
- Props: `student`, `matchStatus`, `onSend`, `onCancel`, `requestId`
- Renders student's name, profile pic, course, year, lifestyle tags
- Action button states:
  - `none` → "Send Request" (primary)
  - `sent` → "Cancel Request" (secondary)
  - `received` → "View Request" (info)
  - `matched` → "Matched ✓" (success, disabled)
  - `self` → hidden

#### `ImageUpload` — `client/src/components/ImageUpload.jsx`
- Reads Cloudinary config from `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET`
- Posts to Cloudinary's unsigned upload endpoint:
  `https://api.cloudinary.com/v1_1/<cloud_name>/image/upload`
- Returns the secure URL to the parent via callback prop

---

### 5.4 Page-Level Logic

#### `Browse.jsx` — `/browse`

**State:**
```js
const [students, setStudents] = useState([])
const [matchStatuses, setMatchStatuses] = useState({})
// matchStatuses: { [userId]: 'none' | 'sent' | 'received' | 'matched' | 'self' }
const [requestIds, setRequestIds] = useState({})
// requestIds: { [userId]: matchRequestId }
```

**On mount:**
1. `GET /api/users/hostel` → all hostel students
2. `GET /api/matches/requests` → incoming requests
3. `GET /api/matches/sent` → sent requests
4. Derive `matchStatuses` map:
   - `self` if `student._id === currentUser.id`
   - `matched` if accepted request exists involving student
   - `received` if pending request from student to me
   - `sent` if pending request from me to student
   - `none` otherwise

---

#### `Requests.jsx` — `/requests`

**Tabs:** Received | Sent

**Received tab actions:**
- Accept: `PUT /api/matches/accept/:requestId`
- Reject: `PUT /api/matches/reject/:requestId`

**Sent tab actions:**
- Cancel: `DELETE /api/matches/cancel/:requestId`
- Unmatch: `DELETE /api/matches/unmatch/:requestId` (if accepted)

---

#### `Chat.jsx` — `/chat/:userId`

**On mount:**
1. Verify `userId` is the current user's match (check via requests)
2. `GET /api/messages/:userId` → load history
3. Connect socket listener for `receive_message`
4. Auto-scroll to bottom

**Send message:**
1. `socket.emit('send_message', { to: userId, content })`
2. Listen for `message_sent` → append to local messages array
3. Clear input

---

#### `MyProfile.jsx` — `/me`

**Modes:** View | Edit

**On save:**
1. `PUT /api/users/me` with updated `profile` object
2. Refresh local state with returned user

**Profile picture:**
- Renders `<ImageUpload>` in edit mode
- Cloudinary URL stored in `profile.profilePic`

---

## 6. Environment Configuration

### Server (`server/.env`)

| Variable | Example | Purpose |
|---|---|---|
| `PORT` | `5001` | Express listen port |
| `MONGO_URI` | `mongodb+srv://...` | MongoDB Atlas connection string |
| `JWT_SECRET` | `s3cr3tK3y!` | HMAC-SHA256 signing key for JWT |

### Client (`client/.env`)

| Variable | Example | Purpose |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5001` | Backend base URL |
| `VITE_CLOUDINARY_CLOUD_NAME` | `mycloud` | Cloudinary account identifier |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | `hostel_unsigned` | Unsigned upload preset name |

---

## 7. Project File Structure

```
hostel-app/
├── server/
│   ├── controllers/
│   │   ├── authController.js     # register, login
│   │   ├── userController.js     # getMe, updateMe, getHostelMembers, getUserById
│   │   └── matchController.js    # sendRequest, acceptRequest, rejectRequest,
│   │                             # cancelRequest, unmatchRequest,
│   │                             # getIncomingRequests, getSentRequests
│   ├── middleware/
│   │   └── auth.js               # JWT verification middleware
│   ├── models/
│   │   ├── User.js               # Mongoose schema for users
│   │   ├── Hostel.js             # Mongoose schema for hostels
│   │   ├── MatchRequest.js       # Mongoose schema for match requests
│   │   └── Message.js            # Mongoose schema for chat messages
│   ├── routes/
│   │   ├── auth.js               # POST /register, POST /login
│   │   ├── users.js              # GET|PUT /me, GET /hostel, GET /:id
│   │   ├── matches.js            # POST /request/:id, PUT /accept|reject/:id,
│   │   │                         # DELETE /cancel|unmatch/:id,
│   │   │                         # GET /requests, GET /sent
│   │   └── messages.js           # GET /:userId
│   └── server.js                 # Express app, Socket.IO setup, MongoDB connect
│
└── client/
    └── src/
        ├── api/
        │   └── axios.js          # Axios instance with auth interceptor
        ├── components/
        │   ├── ImageUpload.jsx   # Cloudinary direct upload component
        │   ├── Navbar.jsx        # Top navigation bar
        │   ├── Navbar.css
        │   ├── ProtectedRoute.jsx # Auth guard wrapper
        │   ├── StudentCard.jsx   # Hostel directory card with match actions
        │   └── StudentCard.css
        ├── context/
        │   ├── AuthContext.jsx   # Global auth state (user, token, login, logout)
        │   └── SocketContext.jsx # Socket.IO connection lifecycle
        ├── pages/
        │   ├── Landing.jsx       # Public landing page
        │   ├── Login.jsx         # Email + password login form
        │   ├── Register.jsx      # Registration form
        │   ├── Browse.jsx        # Hostel directory with match status buttons
        │   ├── Profile.jsx       # View another student's profile
        │   ├── MyProfile.jsx     # View/edit own profile
        │   ├── Requests.jsx      # Received/sent requests management
        │   └── Chat.jsx          # Real-time 1:1 chat with matched roommate
        ├── App.jsx               # Route definitions
        ├── main.jsx              # React root, context providers
        └── index.css             # Global styles
```

---

## 8. Error Handling Strategy

| Layer | Strategy |
|---|---|
| **Server Controllers** | All async handlers wrapped in `try/catch`; errors return JSON `{ message, error }` with appropriate HTTP status |
| **Auth Middleware** | Returns `401` with `{ message: 'No token / Token is not valid' }` |
| **Frontend Axios** | Errors caught in component-level `try/catch`; user-facing error messages displayed inline |
| **Socket.IO** | `message_error` event emitted to sender on failure; connection errors trigger socket reconnection |

---

*Document Owner: Abhinav Ravi Shankar*  
*Last Updated: August 2026*
