# GRAMA MITRA 360
Beyond voice assistance: a smart digital companion for rural India. Voice-first (Telugu / Hindi / English), verified-source answers (TrustScore), preliminary eligibility, document guidance, scam alerts, offline PWA and real human handoff.

## 1. Run locally (VS Code terminal)
Needs Node 18+, MongoDB (local `mongod` or a free Atlas URI), Chrome or Edge.
```bash
# terminal 1 - backend
cd backend
npm install
cp .env.example .env      # Windows: copy .env.example .env   then edit it (JWT_SECRET, ADMIN_PASSWORD, GEMINI_API_KEY)
npm run seed              # sources + starter records + admin account
npm run seed:demo         # OPTIONAL demo data (agent, sample tickets, HIGH/LOW trust examples)
npm run dev               # http://localhost:5000/api/health

# terminal 2 - frontend
cd frontend
npm install
npm run dev               # http://localhost:5173
```
**Test the offline/PWA mode** (the service worker only runs in a production build):
```bash
cd frontend && npm run build && npm run preview      # http://localhost:4173 (backend must still run for /api)
```
Open it once online, wait a few seconds, then DevTools > Network > Offline and reload.

## 2. Credentials
| What | Where to get it | Where it goes |
|---|---|---|
| Gemini API key | https://aistudio.google.com/apikey | `backend/.env` `GEMINI_API_KEY` (never in frontend code) |
| MongoDB | local install or https://www.mongodb.com/atlas | `MONGODB_URI` |
| Bhashini | register at https://bhashini.gov.in for API access | **Not integrated.** Speech uses the browser Web Speech API (fallback). To upgrade, replace `listen()`/`speak()` in `frontend/src/hooks/useSpeech.js` and proxy the Bhashini calls through the backend so the key stays secret. |

Without a Gemini key the app still runs: intent falls back to keyword matching (`aiMode: keyword-fallback`) and answers come from stored records (`record-only`). The UI shows which mode was used.

## 3. Architecture
```
React PWA (Vite, Tailwind, Framer Motion)  --/api-->  Express  --> MongoDB
   |  Web Speech API (STT/TTS)                          |--> Gemini REST (server side only)
   |  IndexedDB: verified bundle + offline ticket queue |--> TrustScore (services/trust.js)
   |  Service worker: app shell cache                   |--> Eligibility rule engine, safety keyword router
```
Answer pipeline: speech -> user confirms text -> `/assistant/message` -> scam keyword check -> Gemini intent classification (or keyword fallback) -> retrieve record -> TrustScore -> if LOW: fixed "could not verify" + human offer; else Gemini answers **only from the record**, with source + date shown.

## 4. Main API
| Area | Endpoints |
|---|---|
| Voice/AI | `POST /assistant/session`, `POST /assistant/message` |
| Knowledge | `GET /services`, `GET /services/:slug`, `GET /documents/:slug`, `POST /documents/:slug/check` |
| Eligibility | `GET /eligibility/:slug/questions?lang=`, `POST /eligibility/:slug/check` |
| Support | `POST /support/tickets`, `GET /support/track/:id`, `POST /support/sync`, `POST /feedback` |
| Offline | `GET /sync/bundle` |
| Auth | `POST /auth/login`, `GET /auth/me` |
| Agent | `GET /agent/tickets`, `POST /agent/tickets/:id/accept`, `PATCH .../status`, `POST .../respond` |
| Admin | `/admin/services` (CRUD, `/verify`, `/outdated`), `/admin/sources`, `/admin/agents`, `/admin/analytics` |

## 5. Pages
`/` landing · `/app` dashboard · `/voice` assistant · `/eligibility/:slug?` · `/documents/:slug?` · `/offline` · `/trust` TrustScore · `/safety` · `/staff` support dashboard · `/admin`.

## 6. Privacy and safety design
- Citizens have no accounts; nothing is saved without a consent tick. Saved conversations auto-delete after 30 days, eligibility records after 90 days (Mongo TTL).
- The app never asks for Aadhaar, OTP, passwords or bank details; Gemini's system prompt forbids it.
- Never claims a human is connected until an agent accepts the ticket (`humanConnected` flag).
- Edited service records lose their verified status until an admin verifies again.
- Helmet, CORS allow-list, rate limits (global, AI, login), zod validation, bcrypt, JWT with roles, API keys server-side only.

## 7. Honest limitations
- Seeded scheme data is **starter content** and is not verified. Check each record against its official page, then use Admin > Services > Verify. State-specific schemes (e.g. Telangana) need their own verified records.
- Hindi/Telugu answers are translated by Gemini from English records; have a native speaker review before real use.
- Browser speech recognition needs internet and its Telugu accuracy varies; every voice input is confirmed. Many PCs lack Telugu/Hindi voices (the app warns).
- Offline: saved records, checklists, read-aloud (if the device has a voice) and queued help requests work. Gemini and speech recognition do not.
- Not load tested; not a replacement for official government channels.
