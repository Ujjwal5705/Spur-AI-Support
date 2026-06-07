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
