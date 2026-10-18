# 🇮🇳 NidhiFlow (निधि Flow)

> **India's Premier Verified Two-Sided Marketplace Connecting Real Investors with Genuine Startups.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js 14](https://img.shields.io/badge/Next.js-14%20App%20Router-black.svg)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-red.svg)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-red.svg)](https://redis.io/)
[![Prisma](https://img.shields.io/badge/Prisma-5-teal.svg)](https://www.prisma.io/)

---

## 🎯 The Problem & Vision

Early-stage and struggling Indian startups waste months chasing investors through unverified email chains, cold LinkedIn messages, and intermediaries. At the same time, angel investors, family offices, and VCs are inundated with unverified pitches, fake traction numbers, and opaque claims.

**NidhiFlow removes this barrier.**
- **Startups get discoverability** with verified traction metrics, DPIIT recognition badges, GSTIN/CIN checks, and standardized pitch decks.
- **Investors get a curated, high-trust deal flow** tailored to their sector preferences, cheque sizes, and geographic focus.
- **Both parties interact directly** via in-app real-time messaging, formal Expressions of Interest (EOI), document rooms, and transparent founder/investor reviews.

---

## 🏗️ Architecture & Tech Stack

NidhiFlow is built as a high-performance monorepo powered by **npm workspaces**:

```
FinTech/
├── apps/
│   ├── web/               # Next.js 14 (App Router), React, Tailwind CSS, Lucide Icons
│   └── api/               # NestJS 10, Prisma ORM, Socket.IO, Passport JWT, Multer
├── packages/
│   └── shared/            # Shared TypeScript types, enums, DTOs & validation contracts
├── docker-compose.yml     # PostgreSQL 16 & Redis infrastructure
└── package.json           # Monorepo workspaces & orchestration scripts
```

### Core Technologies
- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS, Lucide React, Glassmorphic UI with Indian FinTech Design System (Deep Indigo `#0F172A`, Saffron Gold `#F59E0B`, Emerald `#10B981`).
- **Backend**: NestJS 10 (Modular TypeScript Architecture), Passport.js (Dual JWT Authentication for Founders & Investors + Admin RBAC).
- **Database & Cache**: PostgreSQL 16 managed via Prisma ORM (all monetary metrics stored safely in BigInt paise to avoid overflow), Redis for sessions and rate limiting.
- **Real-Time Communication**: WebSockets / Socket.IO with fallback polling for instant investor-founder conversations.

---

## ✨ Key Features

### 1. Dual Independent Authentication & Role-Based Dashboards
- **Founders**: `/startup/login` & `/startup/register` — dedicated onboarding, pitch deck upload, fundraising targets, cap table, and EOI manager.
- **Investors**: `/investor/login` & `/investor/register` — portfolio management, syndicate preferences, ticket size filter (₹10L – ₹10Cr+), and deal pipeline.
- **Admin**: `/admin/login` & `/admin/dashboard` — manual and automated verification queue for DPIIT, GSTIN, CIN, identity documents, and platform moderation.

### 2. Multi-Tier Verification Engine
- DPIIT Recognition verification badge
- CIN / RoC legal compliance verification
- GSTIN automated syntax & state verification
- Bank statement / Revenue traction audit badge

### 3. Investor Deal Flow & Discovery
- Search and filter startups by sector (FinTech, AgriTech, HealthTech, AI/SaaS, EdTech, D2C), stage (Idea, Seed, Pre-Series A, Series A), funding target, and city.
- Startup public profiles (`/startups/[id]`) with traction metrics, pitch video, team bios, FAQ, and "Express Interest" action.

### 4. Interactive Leaderboard
- Real-time ranking of trending startups based on platform traction, investor interest velocity, and verified metrics.

### 5. In-App Direct Messaging & Deal Rooms
- Real-time chat (`/chat`) enabling verified founders and investors to discuss term sheets, share documents, and track engagement.

### 6. Notifications & Audit Logs
- Instant notifications (`/notifications`) for new EOIs, message requests, profile views, and verification status changes.
- Immutable admin audit logs tracking verification decisions.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js >= 18.18.0
- npm >= 9.0.0
- PostgreSQL 16 & Redis (via Docker or local services)

### 1. Clone & Install
```bash
git clone https://github.com/akshssss/NidhiFlow.git
cd NidhiFlow
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
cp .env.example apps/api/.env
```

### 3. Start Database & Cache
```bash
# Using Docker Compose
docker compose up -d

# Or ensure local PostgreSQL (port 5432) and Redis (port 6379) are running
```

### 4. Run Migrations & Seed Sample Indian Startups
```bash
npm run db:migrate
npm run db:seed
```
*Seeds 25+ realistic Indian startups (KiranaPay, KrishiAI, SwasthyaCare, etc.), 15+ institutional & angel investors (Blume Raise, Peak Bharat, InfoEdge Angels), 20+ deal flows, and verified badges.*

### 5. Start Development Servers
```bash
npm run dev
```
- **Web Client**: [http://localhost:3000](http://localhost:3000)
- **REST API**: [http://localhost:4000/api/v1](http://localhost:4000/api/v1)

---

## 🔑 Demo & Test Accounts

| Role | Email | Password | Dashboard URL |
| :--- | :--- | :--- | :--- |
| **Founder** | `rahul@kiranapay.in` | `Test@1234` | `/startup/dashboard` |
| **Investor** | `rajiv@blumeraise.vc` | `Test@1234` | `/investor/dashboard` |
| **Admin** | `admin@nidhiflow.in` | `Test@1234` | `/admin/dashboard` |

---

## 📜 License

MIT License. Designed and developed with ❤️ for the Indian Startup Ecosystem.
