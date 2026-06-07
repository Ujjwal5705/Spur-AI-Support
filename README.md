# 🤖 Spur AI Support Agent

![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-000?logo=vercel)
![Backend](https://img.shields.io/badge/Backend-Render-46C3B?logo=render)
![Stack](https://img.shields.io/badge/Stack-Node%20%7C%20Express%20%7C%20Postgres%20%7C%20Prisma%20%7C%20React-339933?logo=nodedotjs)

A production‑ready, full‑stack AI customer support agent that answers user questions using a real LLM (Groq), persists conversations in PostgreSQL, and isolates sessions per browser tab. Built for the Spur founding engineer take‑home assignment.

## 📋 Table of Contents
- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Live URLs](#-live-urls)
- [Local Development](#-local-development)
- [Environment Variables](#-environment-variables)
- [Database Schema](#-database-schema)
- [LLM Integration & Prompting](#-llm-integration--prompting)
- [Error Handling & Robustness](#-error-handling--robustness)
- [UX Features](#-ux-features)
- [Deployment](#-deployment)
- [Testing & Stress Scenarios](#-testing--stress-scenarios)
- [Trade‑offs & Future Improvements](#-tradeoffs--future-improvements)
- [Submission Notes](#-submission-notes)

## 📖 Overview
This application simulates an e‑commerce live chat widget. Users type questions, and an AI agent replies based on seeded store policies (shipping, returns, support hours). The backend stores every message in PostgreSQL, maintains conversation context, and handles LLM failures, rate limits, and malformed input gracefully.

Key capabilities:
- Session isolation per browser tab (`sessionStorage`)
- Persistent chat history across page reloads
- Contextual follow‑up answers (conversation history passed to LLM)
- Input validation (empty, too long, non‑string, malformed JSON)
- Database disconnection recovery (503 with friendly message)
- LLM API failures → fallback message, no crash

## 🧰 Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | React 19 + TypeScript, Vite, Axios, TailwindCSS (custom fallback CSS) |
| Backend | Node.js (ESM), Express 5, TypeScript |
| Database | PostgreSQL (Render managed) + Prisma 7 ORM (driver adapters) |
| LLM | Groq (Llama 3.1 8B) via OpenAI SDK |
| Validation | Zod |
| Deployment | Backend & DB: Render, Frontend: Vercel |

## 🏛 Architecture
```text
┌─────────────┐     HTTPS       ┌─────────────────────┐     Prisma      ┌────────────┐
│   Browser   │ ──────────────► │  Express Backend    │ ──────────────► │ PostgreSQL │
│   (React)   │ ◄────────────── │  - Controllers      │ ◄────────────── │  Render    │
└─────────────┘     JSON        │  - Services         │                 └────────────┘
                                │  - Validators (Zod) │
                                │  - Middleware (CORS)│      Groq API
                                │    error handling)  │ ──────────────► ┌────────────┐
                                └─────────────────────┘                 │   LLM      │
                                                                        └────────────┘
```

### Backend structure (modular, extensible)

```text
src/
├── controllers/
│   └── chat.controller.ts     # route handlers, DB logic
├── services/
│   └── llm.service.ts         # LLM client & prompt design
├── validators/
│   └── chat.validator.ts      # Zod schema for /chat/message
├── db/
│   └── prisma.ts              # Prisma client with driver adapter
├── middlewares/
│   └── error.middleware.ts    # global error handler (JSON syntax, 500)
├── routes/
│   └── chat.routes.ts
└── server.ts                  # app entry, CORS, environment
```

Why this works:
- Separation of concerns – LLM logic can be swapped (e.g., to Anthropic) without touching controllers.
- Extensibility – Adding WhatsApp/Instagram channels would only require new routes + same services.
- Type safety – Prisma + Zod ensure runtime and compile‑time correctness.


## 🌐 Live URLs
| Service       | URL                                                              |
|---------------|------------------------------------------------------------------|
| Frontend      | [https://spur-ai-support.vercel.app](https://spur-ai-support.vercel.app) |
| Backend API   | [https://spur-chat-backend-9zh0.onrender.com](https://spur-chat-backend-9zh0.onrender.com) |
| PostgreSQL    | Managed by Render (free tier, internal connection)              |

## 💻 Local Development
### Prerequisites
- Node.js 20+
- PostgreSQL (local or Docker)

### Steps
1. Clone repository
```bash
git clone https://github.com/Ujjwal5705/Spur-AI-Support.git
cd Spur-AI-Support
```

2. Backend setup
```bash
cd backend
cp .env.example .env
# Edit .env – set DATABASE_URL and GROQ_API_KEY
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

3. Frontend setup (in a new terminal)
```bash
cd frontend
cp .env.example .env
# Set VITE_API_URL=http://localhost:5001
npm install
npm run dev
```

Open http://localhost:5173 and start chatting.
