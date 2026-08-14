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


---
*Draft — August 2026*
