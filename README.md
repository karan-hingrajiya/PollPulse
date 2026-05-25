# PollPulse

PollPulse is a full-stack polling platform where users can create polls, share a single link, collect responses, and view analytics with a clean dashboard experience.

Live App: [https://poll-pulse-five.vercel.app/](https://poll-pulse-five.vercel.app/)  
Backend API: `https://pollpulse-backend-rusz.onrender.com`

---

## Table of Contents

- [Overview](#overview)
- [Current Status](#current-status)
- [Features Implemented](#features-implemented)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [API Modules](#api-modules)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Run Locally](#run-locally)
- [Deployment Notes](#deployment-notes)
- [What Is Not Implemented Yet](#what-is-not-implemented-yet)
- [Strong Points of This Project](#strong-points-of-this-project)
- [What Can Be Added Next](#what-can-be-added-next)
- [Known Notes](#known-notes)
- [Author Notes](#author-notes)

---

## Overview

PollPulse helps teams and creators quickly gather feedback:

1. Create a poll with multiple questions/options  
2. Share a tokenized public link  
3. Collect anonymous/authenticated responses (based on poll settings)  
4. View poll analytics and publish poll results publicly when needed

The app is designed with a modern UX and practical backend validation so real users can reliably create, share, and analyze polls.

---

## Current Status

This project is currently working well end-to-end for core polling and analytics flows.

Implemented and stable:
- Auth flows (register/login/refresh/logout/verify/reset/getme)
- Poll CRUD essentials + sharing
- Public poll response submission
- Public published results page
- Dashboard analytics API and UI integration
- Session-aware navbar behavior

Not implemented yet:
- Real-time socket updates for dashboard/analytics

---

## Features Implemented

### 1. Authentication & Account Flows
- User registration
- User login
- Access token + refresh token flow
- Refresh token endpoint for silent session continuation
- Logout
- Email verification flow (`/verify-email/:token`)
- Forgot password + reset password
- `getme` profile endpoint for authenticated user info

### 2. Poll Management
- Create poll with:
  - title, description
  - multiple questions
  - multiple options per question
  - mandatory question support
  - expiry date/time
  - anonymous/authenticated mode
- Fetch all user polls
- Fetch poll by ID
- Delete poll
- Publish poll results

### 3. Poll Sharing & Public Access
- Generate/return share token per poll
- Public poll form endpoint via token
- Public response submission endpoint
- Public published results endpoint

### 4. Response Handling
- Structured answer submission
- Duplicate-prevention design for response safety
- Poll-level rules enforced before accepting response

### 5. Analytics
- All polls overview analytics
- Single poll overview analytics
- Question-wise analytics
- Participation trend (`24h`, `7d`, `30d` style ranges)

### 6. Frontend UX
- Modern landing page with polished visuals
- Unified navbar behavior based on session state:
  - Anonymous user: Sign in / Get started
  - Logged-in user: Dashboard / Create Poll / profile / logout
- Dashboard wired to real backend APIs (not dummy data)
- User-friendly error messaging strategy

### 7. Socket-related (Implemented Scope Only)
- Socket real-time analytics/dashboard broadcasting is **not implemented yet**
- Current system works via API request/response model only

---

## Architecture

### Frontend
- React + TypeScript + Vite
- Route-based pages:
  - public landing
  - auth pages
  - dashboard
  - poll creation
  - poll analytics
  - public poll pages
- API client with token attachment + refresh retry logic
- Component-driven UI

### Backend
- Node.js + Express
- MongoDB with collection-level access pattern
- Modular folder structure:
  - auth
  - polls
  - responses
  - analytics
- Shared middlewares:
  - auth guard
  - validation
  - centralized error handling

---

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Axios
- React Router
- Framer Motion
- Sonner (toasts)

### Backend
- Node.js
- Express
- MongoDB
- JWT auth
- Cookie parser
- Nodemailer (email flows)

---

## API Modules

- `/api/auth`
  - register, login, refresh-token, logout
  - verify-email, resend-verification
  - forgot-password, reset-password
  - getme

- `/api/poll`
  - create poll
  - get all polls
  - get poll by id
  - create share token
  - public poll by token
  - public published results by token
  - publish poll results
  - delete poll

- `/api/response`
  - submit response to tokenized poll

- `/api/analytics`
  - all polls overview
  - poll overview
  - question-wise analytics
  - participation trend

---

## Project Structure

```bash
PulseBoard/
├── Backend/
│   ├── src/
│   │   ├── module/
│   │   │   ├── auth/
│   │   │   ├── polls/
│   │   │   ├── responses/
│   │   │   └── analytics/
│   │   ├── common/
│   │   ├── app.js
│   │   └── ...
│   └── server.js
├── Frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── common/
│   │   └── ...
│   ├── vite.config.ts
│   └── ...
└── README.md


Environment Variables
---------------------

### Backend (Backend/.env)

Typical required values:

*   PORT
    
*   db\_connection
    
*   DB\_NAME
    
*   JWT\_ACCESS\_SECRET
    
*   JWT\_REFRESH\_SECRET
    
*   JWT\_ACCESS\_EXPIRES\_IN
    
*   JWT\_REFRESH\_EXPIRES\_IN
    
*   FRONTEND\_URL
    
*   Mail provider credentials (for verification/reset emails)
    

### Frontend (Frontend/.env)

*   VITE\_API\_BASE\_URL=https://pollpulse-backend-rusz.onrender.com
    

Run Locally
-----------

### 1) Clone

git clone cd PulseBoard

### 2) Backend

cd Backendnpm installnpm run dev

### 3) Frontend

cd ../Frontendnpm installnpm run dev

Deployment Notes
----------------

Frontend is deployed on Vercel:[https://poll-pulse-five.vercel.app/](https://poll-pulse-five.vercel.app/)

Backend is deployed on Render:https://pollpulse-backend-rusz.onrender.com

For Vercel SPA routing, rewrite to index.html is required for deep routes like:

*   /verify-email/:token
    
*   /reset-password/:token
    
*   /dashboard/...
    

What Is Not Implemented Yet
---------------------------

*   Real-time dashboard updates via Socket.IO/WebSockets
    
*   Real-time analytics broadcasting
    
*   Dashboard live push sync without refresh
    
*   Advanced role-based access model
    
*   Comprehensive automated tests (unit/integration/e2e)
    
*   Advanced rate limiting and abuse-protection layers
    

Strong Points of This Project
-----------------------------

*   Practical full-stack architecture with clear module separation
    
*   Real authentication lifecycle with refresh-token recovery
    
*   Clean poll-sharing flow with tokenized public endpoints
    
*   Strong analytics foundation already in place
    
*   User-focused UI with modern interaction design
    
*   Good error-handling direction (user-friendly messaging)
    
*   Production deployment already live and usable
    

What Can Be Added Next
----------------------

*   Socket-based real-time updates for dashboard and analytics
    
*   Poll scheduling and advanced lifecycle controls
    
*   CSV/PDF export for analytics
    
*   Team workspaces and multi-user collaboration
    
*   Rich charting and comparative analytics views
    
*   Better observability (logs, metrics, tracing)
    
*   Full CI pipeline with automated test coverage
    

Known Notes
-----------

*   Socket support for dashboard analytics is intentionally pending.
    
*   Some deployment behavior (deep-link routing) depends on Vercel rewrite correctness.
    
*   Ensure Vite base config remains suitable for your deployment setup.
    

Author Notes
------------

This project reflects a strong end-to-end implementation focus:

*   Core product value is already delivered
    
*   Deployment is live
    
*   Next major upgrade path is real-time analytics/socket integration
    

If you are reviewing this repo, the best flow to try first is:

1.  Register account
    
2.  Verify email
    
3.  Create a poll
    
4.  Share public link
    
5.  Submit responses
    
6.  Open dashboard + poll analytics
