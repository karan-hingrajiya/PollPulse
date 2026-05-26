# PollPulse

PollPulse is a full-stack polling platform where creators can build polls, share one public link, collect responses safely, and analyze results with a modern dashboard.

## Live Links
- Frontend: https://poll-pulse-five.vercel.app/
- Backend API: https://pollpulse-backend-rusz.onrender.com

## Why PollPulse
Most polling apps stop at basic create-and-vote. PollPulse adds practical production features:
- Authenticated and anonymous poll modes
- One-response-per-user protection (for both logged-in and anonymous users)
- Controlled result publishing (manual + automatic on expiry)
- Public result pages after publish
- Creator analytics with trend, completion, and question-level insights
- Polished UX with user-friendly warnings, confirmations, and toasts

## Core Features

### 1) Authentication & Account Security
- Register, login, logout, refresh token flow
- Email verification flow
- Forgot password and reset password
- `getme` endpoint for session-aware UI

### 2) Poll Creation & Management
- Create polls with:
  - title, description
  - multiple questions and options
  - required (mandatory) questions
  - expiry date/time
  - response mode: anonymous or authenticated only
- Poll list, poll details, and delete poll
- Share-link token generation for public access

### 3) Response Integrity
- Duplicate response prevention:
  - Logged-in users: unique response per poll per account
  - Anonymous users: fingerprint-based + DB index level protection
- Poll lifecycle guard blocks responses when:
  - poll is expired
  - results are already published

### 4) Result Publishing Flow
- Manual publish from poll analytics page
- Public results endpoint and results page
- Publish confirmation for better UX when publishing early

### 5) Auto-Publish On Expiry (Scheduler)
New feature implemented:
- While creating a poll, creator can enable **Auto-publish when poll expires**
- Creator can also toggle this later from the poll analytics page
- Backend job checks every 60 seconds and auto-publishes eligible polls

Eligible poll conditions:
- `autoPublishOnExpiry = true`
- `isPublished = false`
- `expiresAt <= now`

Effect when matched:
- sets `isPublished = true`
- sets `publishedAt = now`

Implementation files:
- `Backend/src/common/jobs/poll-auto-publish.job.js`
- `Backend/server.js` (job initialization)
- `Backend/src/module/polls/polls.route.js` (`PATCH /:pollId/auto-publish`)

### 6) Analytics & Charts
- Dashboard overview:
  - total polls, live, published, draft, expired
  - responses today, total responses
  - overall completion rate
- Poll analytics:
  - poll-level overview
  - question-wise option performance
  - participation trend (`24h`, `7d`, `30d`)
- Chart-based visual UX using `recharts` + shadcn chart wrappers

## Tech Stack

### Frontend
- React 19 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Recharts
- Axios
- React Router
- Sonner toasts
- Framer Motion

### Backend
- Node.js + Express
- MongoDB Node driver
- JWT authentication
- Joi validation
- Nodemailer
- Socket.IO (infrastructure present)

## Project Structure
```text
PollPulse/
+- Backend/
    +- src/
        +- common/
            +- config/
            +- jobs/
            +- middleware/
        +- module/
           +- auth/
           +- polls/
           +- responses/
           +- analytics/
          +- stats/
    +- server.js
+- Frontend/
    +- src/
        +- pages/
        +- components/
        +- common/
    +- vite.config.ts
+- README.md
```

## Local Setup

### 1) Clone
```bash
git clone <your-repo-url>
cd PollPulse
```

### 2) Backend
```bash
cd Backend
npm install
npm run dev
```
Server default: `http://localhost:3000`

### 3) Frontend
```bash
cd ../Frontend
npm install
npm run dev
```
Frontend default: `http://localhost:5173`



## Recommended Product Flow (Demo)
1. Register and verify email
2. Create a poll
3. Share poll link
4. Submit responses (anonymous or authenticated based on mode)
5. Open poll analytics
6. Publish results manually or let auto-publish handle expiry

## Current Limitations
- Socket infrastructure exists, but full real-time UI syncing is still limited
- No complete automated test suite yet (unit/integration/e2e)
- No CSV/PDF analytics export yet

## Future Improvements
- Real-time analytics updates via Socket.IO in all dashboards
- Webhook/notification when auto-publish triggers
- Poll scheduling windows (openAt, closeAt)
- Role-based collaboration (teams/workspaces)
- Export and reporting (CSV/PDF)
- Audit logs and stronger observability

---
If you use this repo, feel free to fork and extend. PollPulse is designed to be practical, not just a demo UI.
