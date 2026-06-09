# Spur AI Support Agent

![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-000?logo=vercel)
![Backend](https://img.shields.io/badge/Backend-Render-46C3B?logo=render)
![Stack](https://img.shields.io/badge/Stack-Node%20%7C%20Express%20%7C%20Postgres%20%7C%20Prisma%20%7C%20React-339933?logo=nodedotjs)

A production‑ready, full‑stack AI customer support agent that answers user questions using a real LLM (Groq), persists conversations in PostgreSQL, and isolates sessions per browser tab.

## Table of Contents
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

## Overview
This application simulates an e‑commerce live chat widget. Users type questions, and an AI agent replies based on seeded store policies (shipping, returns, support hours). The backend stores every message in PostgreSQL, maintains conversation context, and handles LLM failures, rate limits, and malformed input gracefully.

Key capabilities:
- Session isolation per browser tab (`sessionStorage`)
- Persistent chat history across page reloads
- Contextual follow‑up answers (conversation history passed to LLM)
- Input validation (empty, too long, non‑string, malformed JSON)
- Database disconnection recovery (503 with friendly message)
- LLM API failures → fallback message, no crash

## Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | React 19 + TypeScript, Vite, Axios, TailwindCSS (custom fallback CSS) |
| Backend | Node.js (ESM), Express 5, TypeScript |
| Database | PostgreSQL (Render managed) + Prisma 7 ORM (driver adapters) |
| LLM | Groq (Llama 3.1 8B) via OpenAI SDK |
| Validation | Zod |
| Deployment | Backend & DB: Render, Frontend: Vercel |

## Architecture
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


## Live URLs
| Service       | URL                                                              |
|---------------|------------------------------------------------------------------|
| Frontend      | [https://spur-ai-support.vercel.app](https://spur-ai-support.vercel.app) |
| Backend API   | [https://spur-chat-backend-9zh0.onrender.com](https://spur-chat-backend-9zh0.onrender.com) |
| PostgreSQL    | Managed by Render (free tier, internal connection)              |

## Local Development
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
npm install
npm run dev
```

Open http://localhost:5173 and start chatting.

### Using SQLite (alternative for quick testing)
1. Change provider in ```prisma/schema.prisma``` to ```sqlite```
2. Update ```DATABASE_URL``` to ```file:./dev.db```
3. No additional database server needed.

## Environment Variables
Backend (.env)
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/spur_chat_db"
GROQ_API_KEY="gsk_..."   # from console.groq.com
PORT=5001                 
```

Frontend (.env.local or .env)
```env
VITE_API_URL="http://localhost:5001"   # or production backend URL
Note: For Vercel deployment, set VITE_API_URL as an environment variable in the Vercel dashboard.
```

## 🗄 Database Schema (Prisma)
```prisma
model Conversation {
  id        String    @id @default(cuid())
  createdAt DateTime  @default(now())
  messages  Message[]
}

model Message {
  id             String   @id @default(cuid())
  conversationId String
  sender         String   // "user" | "ai"
  content        String
  createdAt      DateTime @default(now())

  conversation Conversation @relation(fields: [conversationId], references: [id])
}
```

- Indexes: conversationId is automatically indexed by Prisma (foreign key).
- No auth – sessions identified by sessionId (cuid) stored in sessionStorage.

## LLM Integration & Prompting
**Provider:** Groq (Llama 3.1 8B) – fast inference, free tier 30 requests/minute.

**Prompt design (system message):**
```text
You are Spur Store's AI customer support agent.

You should:

- Be concise.
- Be friendly.
- Never invent store policies.
- Only use information provided below.

Store Policies

Shipping:
• Ships to India, USA, UK, Canada
• Dispatch within 24 hours
• Delivery 3-7 business days

Returns:
• Returns accepted within 30 days
• Product must be unused
• Refunds processed within 5 business days

Support:
• Monday-Friday
• 9AM-6PM IST

If you don't know the answer,
say:
"I don't have that information yet. Please contact support."
```

**Context handling:**
We pass the last N messages (full conversation history) to the LLM. For long conversations, token usage grows linearly, a future improvement would truncate history intelligently.

**Fallback:** Any API error (4xx, 5xx, timeout) returns:
“Sorry, our AI assistant is currently unavailable. Please try again later.”

## Error Handling & Robustness
| Scenario                             | Mechanism                                                                 | Response                                          |
|--------------------------------------|---------------------------------------------------------------------------|---------------------------------------------------|
| Empty message                        | Zod `min(1)`                                                              | 400 "Message cannot be empty"                     |
| Message >2000 chars                  | Zod `max(2000)`                                                           | 400 "Message too long"                            |
| Malformed JSON                       | Express `json()` middleware + global error handler checks SyntaxError    | 400 "Invalid JSON format"                         |
| Non‑string message                   | Zod type validation                                                       | 400 "Expected string, received number"            |
| LLM API key missing/invalid          | try/catch in `llm.service.ts`                                            | 200 (OK) with fallback message                    |
| Rate limit (429)                     | Caught by OpenAI client, fallback returned                                | 200 (OK) with "You're sending messages too quickly..." |
| Database unreachable (P1001, P2021) | Prisma error code handling in controller                                  | 503 "Database temporarily unavailable"            |
| Backend crash                        | Never – all synchronous and asynchronous errors are caught               | Server stays alive                                |

**Global error handler snippet:**
```ts
if (err instanceof SyntaxError && 'body' in err) {
  return res.status(400).json({ error: "Invalid JSON format" });
}
```

## UX Features
- Session isolation - Each browser tab uses sessionStorage, preventing cross‑tab leakage.
- Typing indicator - Animated three‑dot loader while waiting for LLM.
- Auto‑scroll - Scrolls to latest message using useRef + scrollIntoView.
- Input validation - Frontend pre‑checks empty/long messages before API call.
- Error messages - Appear as chat bubbles (red for errors, purple for AI).
- Responsive design - Works on mobile and desktop (Tailwind + custom CSS fallback).

## Deployment
### Backend + PostgreSQL (Render)
- Build command: npm install && npx prisma generate && npx prisma migrate deploy && npm run build
- Start command: node dist/server.js
- Environment: DATABASE_URL (Render internal PostgreSQL), GROQ_API_KEY
- Health check: GET /health returns 200 OK

### Frontend (Vercel)
- Framework preset: Vite
- Build command: npm run build
- Output directory: dist
- Environment variable: VITE_API_URL = backend Render URL
- CORS: Backend allows origin from Vercel frontend domain.

## Testing & Stress Scenarios
Run these manual tests to verify robustness:

| Test                          | How to execute                                                                     | Expected result                                                |
|-------------------------------|------------------------------------------------------------------------------------|----------------------------------------------------------------|
| Empty message                 | Send `""` or spaces                                                                | Chat shows "Message cannot be empty"                           |
| Very long message (3000 chars)| Send a long string                                                                 | "Message too long (max 2000)" – no API call                    |
| Malformed JSON                | `curl -d '{"message":"hi"'`                                                        | HTTP 400 "Invalid JSON format"                                 |
| Missing API key               | Remove `GROQ_API_KEY` from env & restart                                          | Fallback AI message, server does not crash                     |
| Rate limiting                 | Send 30 requests in 2 seconds (e.g., `for i in {1..30}; do curl ... & done`)       | Some responses are "You're sending messages too quickly..."    |
| Database disconnection        | Stop PostgreSQL service                                                             | Backend returns 503 with DB error, recovers when DB restarted  |
| Session isolation             | Two tabs, chat separately, reload each                                              | Histories never mix                                            |
| Conversation context          | Ask "What's return policy?" then "What about electronics?"                         | AI answers correctly or admits lack of knowledge               |
| SQL injection attempt         | Send `'; DROP TABLE users; --`                                                     | Stored as plain text, no DB corruption (Prisma ORM)            |

```text
Built with ❤️ for the Spur engineering team.
“Boring makes money” – but we made it fun.
```
