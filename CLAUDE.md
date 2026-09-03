# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

HostelMatch — a roommate-matching app for university hostel students. Two separately deployed apps in one repo: an Express/Socket.IO API (`server/`, deployed to Render) and a React/Vite SPA (`client/`, deployed to Vercel). `PRD.md`, `HLD.md`, `LLD.md` document the system; where they disagree with the code, the code is authoritative (e.g. LLD §5.2 documents the axios instance as though it were in use — it isn't).

## Commands

**Backend — run from the repo root, not `server/`.** There is no `server/package.json`; the server's dependencies and scripts live in the root `package.json`. (`Readme.md` says `cd server && npm install` — that is wrong.)

```bash
npm install
npm run dev        # nodemon server/server.js
npm start          # node server/server.js
```

**Frontend:**

```bash
cd client
npm install
npm run dev        # vite, http://localhost:5173
npm run build
npm run lint       # eslint .
```

**Env files** — `server/.env` is loaded with an explicit `path.join(__dirname, '.env')`, so it must sit in `server/`, not the repo root.

| `server/.env` | `client/.env` |
|---|---|
| `PORT` (use 5001; macOS AirPlay takes 5000) | `VITE_API_URL` (no trailing slash — callers append `/api/...`) |
| `MONGO_URI` | `VITE_CLOUDINARY_CLOUD_NAME` |
| `JWT_SECRET` | `VITE_CLOUDINARY_UPLOAD_PRESET` |

**Tests** — there is no test runner. `server/test_api.js` is a manual end-to-end script (`node server/test_api.js`) that requires the server running on `localhost:5001` and two seeded users; `server/scratch_user.js` resets the first two users in the DB to `password123` for it. `kill.js` is a stale scratch file that kills a hardcoded PID.

A `Hostel` document must exist in the database before anyone can register — there is no seed script in the repo.

## Architecture

**One HTTP server, two protocols.** `server/server.js` wraps the Express app in `http.createServer` and attaches Socket.IO to it, so REST and WebSocket share a port. Both paths verify the same JWT with the same `JWT_SECRET` — Express via `middleware/auth.js` (`Authorization: Bearer`), sockets via an `io.use` handshake check on `socket.handshake.auth.token`.

**Hostel scoping rides in the token.** JWTs are signed with `{ id, hostel }` and controllers authorize off `req.user.hostel` rather than re-reading the user. Changing a user's hostel therefore has no effect until they log in again. `getHostelMembers` returns everyone in the hostel *including the caller*; the client filters self out.

**One `MatchRequest` doc represents the relationship in both directions.** Queries must check `from`/`to` in both orders. `reject` sets `status: 'rejected'`; `cancel` and `unmatch` **delete** the document. The "one accepted match per user" invariant is enforced only in `sendRequest`, which scans for any accepted request touching either user — there is no unique index backing it.

**Populated-vs-raw ObjectId refs are inconsistent.** `getIncomingRequests` populates `from` (leaving `to` a raw id); `getSentRequests` populates `to` (leaving `from` raw). Client code consequently tests both shapes — `r.to?._id === id || r.to === id`. Preserve that when touching match logic; collapsing it re-introduces the "request sent" button bug.

**Match/button state is derived client-side** by cross-referencing three fetches (`/api/users/hostel`, `/api/matches/requests`, `/api/matches/sent`). See `getButtonState` in [Browse.jsx](client/src/pages/Browse.jsx) and the parallel block in [Profile.jsx](client/src/pages/Profile.jsx) — they must stay in sync. The server has no "what is my status with user X" endpoint.

**Chat is REST + socket.** History loads over `GET /api/messages/:userId`; live traffic goes over the socket. Each socket joins a room named after its own user id, so `send_message` persists a `Message` then `io.to(to).emit('receive_message')` and echoes `message_sent` to the sender (the sender's own bubble comes from that echo, not an optimistic append). The `onlineUsers` Map is maintained but currently unused, and the socket handler does **not** verify the two users are matched.

**Client contexts.** `main.jsx` nests `AuthProvider` → `SocketProvider`; the order matters, since `SocketContext` reads `token` from `useAuth` and reconnects whenever it changes. `AuthContext` hydrates from `localStorage` and carries a migration path for sessions where `token` and `user` were stored swapped — it detects a JWT in the `user` slot, re-fetches `/api/users/me`, and repairs storage.

**User id shape differs by source.** The login/register response returns `user.id`; `/api/users/me` returns a Mongoose doc with `user._id`. The migration path above stores the latter, so `user.id` can be undefined — hence the optional chaining around id comparisons. Check both when comparing identities.

## Conventions

- **`client/src/api/axios.js` exports a configured instance with a token interceptor, but nothing imports it.** Every page uses raw `axios` with a manually built ``` `${import.meta.env.VITE_API_URL}/api/...` ``` URL and a `headers` memo from `useAuth().token`. Match the surrounding pattern; migrating to the instance is a deliberate refactor, not a drive-by.
- `server/routes/users.js` is a one-line re-export of `server/routes/user.js` — edit `user.js`.
- Server code is CommonJS (`require`); client code is ESM.
- No CSS framework. Design tokens (dark theme, `--accent`, `--font-display` Syne / `--font-mono` DM Mono) live in `client/src/index.css`; pages have sibling `.css` files, and layout is frequently inline `style={{}}` objects referencing `var(--token)`.
- `components/StudentCard.jsx` and its CSS are unused — `Browse.jsx` inlines its own card markup.
- Profile images upload browser → Cloudinary via an unsigned preset ([ImageUpload.jsx](client/src/components/ImageUpload.jsx)); the server only ever stores the returned URL string in `profile.profilePic`.
- Roll-number validation in `authController.register` is commented out behind a `TODO: Re-enable` — registration currently accepts any roll number so long as the hostel exists.
- `PUT /api/users/me` replaces the whole `profile` subdocument, so callers must send the complete object. It runs `runValidators: true`, and normalizes `''` to unset for the enum fields first — the client's "Select..." option submits `''`, which Mongoose's enum validator rejects. Any new enum path on `profile` must be added to `ENUM_FIELDS`.
