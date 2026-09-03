# Product Requirements Document (PRD)
# HostelMatch — Roommate Matching Platform

**Version:** 1.0  
**Date:** August 2026  
**Status:** In Development  

---

## 1. Overview

### 1.1 Problem Statement

University hostel room assignments are traditionally random and decided by administration without any student input. Students arrive on campus without knowing who they'll live with, often resulting in incompatible living situations — different sleep schedules, study habits, social preferences, and lifestyles. There is currently no standardized platform for students to discover and connect with compatible hostel-mates before move-in day.

### 1.2 Product Vision

**HostelMatch** is a web-based roommate-matching platform built exclusively for university hostel students. It enables students to discover peers assigned to their hostel, build rich personal profiles, and send/accept roommate requests — all before the semester begins. Once matched, students can communicate in real-time via in-app chat.

### 1.3 Target Users

| User Type | Description |
|---|---|
| **Registered Students** | University students assigned to a hostel who have a valid roll number and university email |
| **University Admin** | (Future scope) Administrators who can manage hostel data and roll number lists |

---

## 2. Goals & Success Metrics

### 2.1 Business Goals
- Reduce roommate-incompatibility complaints filed with hostel administration.
- Improve student satisfaction scores during the onboarding/orientation period.
- Build a scalable platform that can be extended to multiple hostels and universities.

### 2.2 User Goals
- Find a roommate with a compatible lifestyle before move-in day.
- Communicate with a prospective or confirmed roommate.
- Understand other students in the hostel through detailed profiles.

### 2.3 Success Metrics
| Metric | Target |
|---|---|
| Student profile completion rate | > 70% of registered users fill profile fields |
| Roommate request acceptance rate | > 50% of sent requests get accepted |
| Daily active users during orientation week | > 60% of registered students |
| Real-time chat messages per matched pair | > 10 messages within first 48 hours of matching |

---

## 3. Scope

### 3.1 In Scope (v1.0)
- User registration with roll number and hostel verification
- JWT-based authentication and session management
- Student profile creation and editing (bio, sleep schedule, study habits, social style, hobbies, Instagram, profile picture)
- Hostel directory — browse all students in the same hostel
- Roommate request system (send, accept, reject, cancel)
- Match state management (one active match per user)
- Unmatch capability
- Real-time 1:1 chat between matched students via WebSockets
- Compatibility scoring between students, with the directory sortable by best match
- Mobile-responsive design
- Profile picture upload via Cloudinary

### 3.2 Out of Scope (v1.0)
- Multi-university support
- Admin dashboard for hostel management
- Push / browser notifications
- Machine-learning or behaviour-based matching (v1.1 ships a deterministic weighted score — see §4.6)
- Group chats
- Video/voice calling
- Room number assignment integration
- Payment or premium features

---

## 4. User Stories & Requirements

### 4.1 Authentication

| ID | User Story | Priority |
|---|---|---|
| AUTH-01 | As a student, I want to register using my name, email, roll number, hostel name, and password so that I can create a verified account. | P0 |
| AUTH-02 | As a student, I want to log in with my email and password so that I can access the platform securely. | P0 |
| AUTH-03 | As a student, I want my session to persist across page refreshes so that I don't have to log in repeatedly. | P0 |
| AUTH-04 | As a student, I want to be redirected to the login page when accessing protected routes without a valid session. | P0 |
| AUTH-05 | As a student, I want to log out from my session. | P1 |

**Acceptance Criteria — AUTH-01:**
- Registration requires: `name`, `email`, `rollNumber`, `hostel`, `password`
- The hostel must exist in the system
- Roll number and email must be unique across the platform
- A JWT token is returned on successful registration (7-day expiry)

### 4.2 Profile Management

| ID | User Story | Priority |
|---|---|---|
| PROF-01 | As a student, I want to set up my profile with my age, course, year, bio, sleep schedule, study habits, and social style. | P0 |
| PROF-02 | As a student, I want to upload a profile picture so that others can identify me. | P1 |
| PROF-03 | As a student, I want to add my hobbies to show my interests to potential roommates. | P1 |
| PROF-04 | As a student, I want to link my Instagram handle so matched students can connect with me outside the app. | P2 |
| PROF-05 | As a student, I want to edit my profile at any time to keep it up to date. | P1 |
| PROF-06 | As a student, I want to view my own profile as other students see it. | P1 |

**Profile Fields:**
| Field | Type | Options |
|---|---|---|
| Age | Number | — |
| Course | String | — |
| Year | Number | 1–5 |
| Bio | String (free text) | — |
| Sleep Schedule | Enum | Early Bird, Night Owl, Flexible |
| Study Habits | Enum | Quiet Studier, Group Studier, Flexible |
| Social Style | Enum | Introverted, Extroverted, Mixed |
| Hobbies | Array of Strings | — |
| Instagram | String | — |
| Profile Picture | URL (Cloudinary) | — |

### 4.3 Hostel Directory (Browse)

| ID | User Story | Priority |
|---|---|---|
| BROWSE-01 | As a student, I want to see all students in my hostel so that I can explore who I could room with. | P0 |
| BROWSE-02 | As a student, I want each student card to show their name, profile picture, course, year, and key lifestyle traits. | P0 |
| BROWSE-03 | As a student, I want each card to reflect the current match status (Send Request / Pending / Matched / Request Received) with appropriate button states. | P0 |
| BROWSE-04 | As a student, I want to click on a student's card to view their full profile. | P1 |
| BROWSE-05 | As a student, I want each card to show a compatibility percentage so I can judge fit at a glance. | P0 |
| BROWSE-06 | As a student, I want to sort the directory by best match, name, or year. | P1 |

### 4.4 Roommate Requests

| ID | User Story | Priority |
|---|---|---|
| REQ-01 | As a student, I want to send a roommate request to a student in my hostel. | P0 |
| REQ-02 | As a student, I want to accept a roommate request I received. | P0 |
| REQ-03 | As a student, I want to reject a roommate request I received. | P0 |
| REQ-04 | As a student, I want to cancel a request I previously sent. | P1 |
| REQ-05 | As a student, I want to view all incoming requests I have received. | P0 |
| REQ-06 | As a student, I want to view all requests I have sent. | P1 |
| REQ-07 | As a student, I should not be able to send a request if either I or the recipient is already matched. | P0 |
| REQ-08 | As a student, I want to unmatch from my current roommate if we change our minds. | P2 |

**Business Rules:**
- A student can only have **one accepted match** at a time.
- Requests can only be sent between students in the **same hostel**.
- Only the recipient can accept or reject; only the sender can cancel a pending request.
- Only the matched pair can access the shared chat.
- Either user in a matched pair can unmatch.

### 4.5 Real-Time Chat

| ID | User Story | Priority |
|---|---|---|
| CHAT-01 | As a matched student, I want to send messages to my roommate in real time. | P0 |
| CHAT-02 | As a matched student, I want to see all past messages when I open the chat. | P0 |
| CHAT-03 | As a student, I should only be able to chat with my confirmed match. | P0 |
| CHAT-04 | As a student, I want to see message timestamps. | P1 |

---

### 4.6 Compatibility Scoring

| ID | User Story | Priority |
|---|---|---|
| COMPAT-01 | As a student, I want a compatibility percentage against every other student in my hostel so I can tell who I would actually live well with. | P0 |
| COMPAT-02 | As a student, I want the directory sorted by best match so the most compatible people surface first. | P0 |
| COMPAT-03 | As a student, I want to see *why* we scored the way we did, dimension by dimension, so the number is trustworthy rather than a black box. | P1 |
| COMPAT-04 | As a student with a thin profile, I want to be told that completing it is what unlocks matching. | P1 |
| COMPAT-05 | As a student, I want shared hobbies called out so I have something to open a conversation with. | P2 |

**Scoring Model:**

| Dimension | Weight | Rationale |
|---|---|---|
| Sleep schedule | 30% | The most common source of real roommate conflict |
| Study habits | 25% | Determines how the room is used during term time |
| Social style | 20% | Drives guests, noise, and shared downtime |
| Shared interests | 15% | Predicts friendship rather than mere tolerance |
| Year | 10% | Proxy for similar timetables and exam periods |

**Business Rules:**
- Weights total 100, so a score reads directly as a percentage.
- A dimension is scored **only when both students have filled that field in**. The weights of skipped dimensions are redistributed across the rest, so an incomplete profile lowers *confidence* rather than dragging the score down.
- `flexible` (sleep, study) and `mixed` (social) part-match anything — they are bridges, not clashes.
- Opposite social styles retain partial credit; opposite sleep schedules and study habits score zero.
- When two students share no comparable fields, the score is **null, never 0** — the UI shows nothing rather than implying incompatibility.
- `confidence` reports what share of the full profile was actually comparable, and is surfaced to the student whenever it is below 100%.
- Scores are computed server-side so the rules stay in one place and cannot be tampered with by the client.

---

## 5. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Security** | All sensitive routes require a valid JWT. Passwords are hashed with bcrypt (salt rounds >= 10). Tokens expire after 7 days. |
| **Performance** | API response times < 500ms under normal load. WebSocket message delivery < 200ms on same region. |
| **Scalability** | Architecture should support adding multiple hostels and universities with minimal changes. |
| **Availability** | 99.5% uptime target. Backend hosted on Render (auto-sleep on free tier — acceptable for v1). |
| **Usability** | Mobile-responsive UI. Key actions (request, accept, chat) accessible within 2 taps/clicks. |
| **Compatibility** | Support latest 2 versions of Chrome, Firefox, Safari, Edge. |
| **Data Privacy** | User email, password, and roll number are never exposed in API list responses. |

---

## 6. Constraints & Assumptions

- **Constraint:** MongoDB Atlas Free Tier limits storage; must be monitored as user count grows.
- **Constraint:** Render Free Tier introduces cold-start latency (~30s). Acceptable for v1.
- **Constraint:** Cloudinary Free Tier has bandwidth limits; profile picture size should be restricted client-side.
- **Assumption:** All users belong to the same university for v1.
- **Assumption:** Hostel data (names, valid roll numbers) is seeded manually by the developer.
- **Assumption:** One room = two students (matching is 1:1).

---

## 7. Roadmap

| Phase | Features | Status |
|---|---|---|
| **v1.0** | Auth, Profiles, Browse, Requests, Match, Chat | Complete |
| **v1.1** | Weighted, explainable compatibility scoring + directory sorting | Complete |
| **v1.2** | Notifications for incoming requests, more hostels | Planned |
| **v2.0** | Admin dashboard, roll number validation, multi-university support | Planned |
| **v2.1** | Weights tuned from real match outcomes, smart suggestions | Planned |

---

*Document Owner: Abhinav Ravishankar*  
*Last Updated: August 2026*
