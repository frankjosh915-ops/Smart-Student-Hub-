# Smart Student Hub

A working prototype for **SIH25093 — Centralised Digital Platform for Comprehensive Student Activity Record in HEIs** (Government of Jammu & Kashmir).

Students submit activities → faculty verify them (generating a tamper-proof SHA-256 hash on approval) → a public, QR-code-shareable portfolio is auto-generated from verified records only → admins get NAAC/NIRF-style institutional analytics.

## Stack

- **Backend:** Node.js, Express, Prisma ORM, SQLite (zero-config, no external DB server needed for the demo), JWT auth, Multer for file uploads, `pdf-lib` + `qrcode` for portfolio generation.
- **Frontend:** React 18, Vite, TailwindCSS, React Router, Recharts.

## Setup

You'll need Node.js 18+ installed. Run these in two terminals.

### 1. Backend

```bash
cd backend
npm install
npx prisma migrate dev --name init   # creates dev.db and tables
npm run seed                          # creates demo accounts + sample data
npm run dev                           # starts on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                           # starts on http://localhost:5173
```

Open `http://localhost:5173`. The Vite dev server proxies `/api` and `/uploads` to the backend, so no CORS setup is needed locally.

## Demo accounts (password for all: `password123`)

| Role    | Email             |
|---------|-------------------|
| Admin   | admin@hub.edu     |
| Faculty | faculty@hub.edu   |
| Student | aarav@hub.edu     |
| Student | diya@hub.edu      |
| Student | kabir@hub.edu     |

The seed script also creates a few sample activities (some pending, some already approved with a verification hash) so the dashboards aren't empty on first load.

## Demo script for judges

1. Login as **aarav@hub.edu** → Student dashboard → "Add activity" → submit a new certification with a proof file.
2. Login as **faculty@hub.edu** → Faculty review queue → open the new submission → Approve. A SHA-256 verification hash is generated at this moment.
3. Back as the student → "Generate portfolio" → get a QR code, a shareable public link, and a downloadable PDF.
4. Open the public link (no login needed) → click "Re-verify this record" on any activity → the backend recomputes the hash live and confirms it matches, proving the record hasn't been tampered with since approval.
5. Login as **admin@hub.edu** → see institution-wide charts by category and department, edit category point weights, and export a NAAC/NIRF-style JSON report.

## Notable design choices

- **SQLite instead of PostgreSQL** for the prototype so it runs with zero external setup — swap the `DATABASE_URL` and provider in `prisma/schema.prisma` to point at Postgres for a production deployment; the rest of the code is unaffected.
- **Local file storage** (`backend/uploads`) is abstracted enough that swapping in AWS S3 later only touches `middleware/upload.js`.
- **Mock ERP sync** (`POST /api/integrations/erp-sync`) simulates pulling CGPA from an existing college ERP/LMS to demonstrate integration feasibility without needing a real ERP connection.

## What's intentionally left as a stretch goal

- Email/SMS notifications (currently in-app only, via the `Notification` table).
- Department-scoped faculty queues (currently all faculty see all pending submissions).
- Real DigiLocker/NAD/AICTE integration (the architecture leaves room for this behind the same integrations route pattern).
