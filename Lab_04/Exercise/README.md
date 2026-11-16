# Lab 4 – Multi-Route SPA, Context Form Engine & Express REST API

**Student:** Dang Hoang Long (Đặng Hoàng Long) · **Student ID:** 24520995
**Course:** Web Development – UIT S3T (University of Information Technology, VNUHCM)
**Repository:** [mikeywrld/24520995_DangHoangLong_Web](https://github.com/mikeywrld/24520995_DangHoangLong_Web)

## Lab 4 – Exercise Report
📄 [Download report (PDF)](report/24520995_DangHoangLong_Lab04_Exercise_Report.pdf)

| Exercise | Sprint | Evidence |
|---|---|---|
| 1.1 Route-level code splitting | – | Figure 1 |
| 1.2 / 1.2.1 / 1.2.2 Routing & directory | 1 | Figures 2–3 |
| 1.3 Synchronous form validation | 2 | Figures 4–5 |
| 1.7.1 Forum & API verification | 3 | Figure 6 |

---

## Objective
Build and verify a multi-route React 19 application that loads views on demand, derives accessible form validation during render, and retrieves and submits forum messages through an Express REST API.

## Tech stack
| Layer | Technology |
|---|---|
| Client | React 19, Vite, React Router v7 (`Routes`, `Outlet`, `NavLink`, `useParams`) |
| Code splitting | `React.lazy` + `<Suspense>` (skeleton with `aria-busy` / `aria-live`) |
| Form | Context provider, validation derived during render (no `useEffect` waterfall), `useId()` |
| Data fetching | Custom hook with `AbortController` and a `signal.aborted` guard |
| Server | Express, CORS, UUID ids, in-memory message store |

## Directory structure
```
Lab_04/Exercise/
├── README.md
├── .gitignore
├── project-rules.md          # Team coding standards & lint rules
├── TASK_DECOMPOSITION.md     # Sprint planning & work breakdown
├── AI_FAILURE_AUDIT.md       # Documented AI hallucinations & manual fixes
├── .env.example              # Environment variable template (no secrets)
├── client/                   # React 19 + Vite + React Router v7
├── server/                   # Express REST API
└── report/
    ├── 24520995_DangHoangLong_Lab04_Exercise_Report.pdf
    ├── report.html           # Report source
    └── figures/              # fig1_suspense.png … fig6_forum.jpg
```

## Routes
| Path | View | Notes |
|---|---|---|
| `/` | Home | lazy chunk |
| `/about` | About | lazy chunk, shown behind a Suspense skeleton |
| `/people` | People directory | responsive CSS grid |
| `/people/:id` | Person detail | nested route, `useParams()`, `dl/dt/dd`; unknown id → in-app 404 |
| `/form` | Context form + `ShowData` | inline errors, `aria-describedby`, `aria-invalid` |
| `/forum` | Channel forum | channels: `nasa`, `esports-tribunal`, `notNasa` |

## API contract
| Method | Endpoint | Body | Responses |
|---|---|---|---|
| `GET` | `/api/messages/:forum` | – | `200` + array of messages |
| `POST` | `/api/messages/:forum` | `{ "author": string, "text": string }` | `201` + created message (with UUID) · `400` if author/text is blank |

CORS is restricted to `CLIENT_ORIGIN`. Messages are kept in memory for the lifetime of the server process.

## Getting started
```bash
# 1. Environment
cp .env.example .env        # fill in the values locally, never commit .env

# 2. Server
cd server
npm install
npm run dev                 # http://localhost:3001

# 3. Client (in a second terminal)
cd client
npm install
npm run dev                 # http://localhost:5173
npm run build               # emits a separate chunk per route
```

## Environment variables
| Variable | Example | Description |
|---|---|---|
| `PORT` | `3001` | Express port |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Allowed CORS origin |
| `MONGODB_URI` | *(empty)* | Reserved for Mongoose 8; read only from `process.env` |

## Verification summary
- Vite build: separate chunks for Home, About, People, Person, Form, Forum.
- Rapid channel switching with an 850 ms API delay → 2 in-flight GETs aborted (`net::ERR_ABORTED`), final channel `200`.
- `POST` valid message → `201`; `POST` blank text → `400` with CORS header.
- Chromium: zero console warnings or page errors.

> **Scope note:** Screenshots and runtime results come from a locally reconstructed verification demo based on the lecture deck and the project documentation. The original project's test suites remain unverified (see the report, *Scope and evidence*).

## Commit convention
Atomic commits following the project rules, e.g.:
```
chore(lab04): add gitignore and env template
docs(lab04): add README
docs(lab04): add exercise report PDF and figures
```

---
*"Generate with AI. Verify with Engineering."* – UIT S3T
