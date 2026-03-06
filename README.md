<div align="center">

<img src="https://img.shields.io/badge/Status-🚧 In Development-yellow?style=for-the-badge" />
<img src="https://img.shields.io/badge/Version-2.0.0--alpha-blue?style=for-the-badge" />
<img src="https://img.shields.io/badge/Platform-iOS%20%7C%20Android-green?style=for-the-badge" />
<img src="https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript" />
<img src="https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=for-the-badge&logo=node.js" />
<img src="https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql" />
<img src="https://img.shields.io/badge/AI-Claude%20%7C%20GPT%20%7C%20Grok-FF6B35?style=for-the-badge" />

<br /><br />

# 🐝 Budget Bee

### *Small savings. Big goals. Bright future.*

**A production-grade, AI-powered personal finance platform built specifically for Sri Lanka**

*Trilingual · LKR-native · Full-Stack · LLM-integrated*

---

[📱 Features](#-key-features) · [🏗 Architecture](#-system-architecture) · [🛠 Tech Stack](#-tech-stack) · [🚀 Getting Started](#-getting-started) · [📊 Project Status](#-project-status) · [🗺 Roadmap](#-roadmap)

</div>

---

> **📌 Portfolio Note:** This is an actively developed v2.0 rewrite demonstrating end-to-end full-stack engineering — from database schema design and RESTful API architecture, to React Native UI, state management, and LLM integration. Every architectural decision is intentional and documented. The codebase reflects production-grade practices including atomic transactions, token rotation, runtime validation, and clean separation of concerns.

---

## 💡 About the Project

Most personal finance apps are built for Western markets — they ignore the realities of managing money in Sri Lanka. **Budget Bee** was engineered from the ground up to solve real, local problems:

- 🏦 **Multiple bank accounts** across institutions like BOC, NSB, and Sampath — tracked in one place
- 💵 **LKR-native arithmetic** — all monetary values stored as integers to eliminate floating-point precision errors entirely
- 🤖 **AI advice engine** — aggregates 30-day transaction history and sends structured context to an LLM (Claude / GPT / Grok) for personalized financial insights
- 🌐 **Trilingual support** — English, தமிழ் (Tamil), and සිංහල (Sinhala) planned
- 👨‍👩‍👧 **Dual modes** — Personal finance tracking and Household/family shared budgeting

This project is not a tutorial clone. It is a self-initiated, full-stack product solving a real problem for a specific market — built with the same architectural discipline expected in a professional engineering environment.

---

## ✨ Key Features

| # | Feature | Description | Status |
|---|---------|-------------|--------|
| 1 | 🔐 **Auth & Onboarding** | JWT authentication with access + refresh token rotation (15-min / 7-day), secure onboarding flow | ✅ Done |
| 2 | 📊 **Dashboard & Analytics** | Donut, bar, and line charts for balances, spending trends, and period-over-period comparisons | ✅ Done |
| 3 | 💸 **Transactions Engine** | Add income/expenses with categories, custom numeric keypad, atomic balance updates via DB transactions | ✅ Done |
| 4 | 🏦 **Account Management** | Track multiple bank accounts, cash wallets, and cards with real-time balance synchronisation | ✅ Done |
| 5 | 🤖 **AI Advice Engine** | LLM-powered personalized insights — overspending alerts, savings tips, anomaly detection | ✅ Done |
| 6 | 📋 **Budget Tracking** | Category-based monthly budget limits with real-time visual progress indicators | ✅ Done |
| 7 | 🔔 **Bills & Reminders** | Recurring bill management with priority levels (High/Medium/Low) and pay-now functionality | 🔄 In Progress |
| 8 | 🎯 **Savings Goals** | Goal-based savings with progress tracking, milestone markers, and contribution history | 🔄 In Progress |
| 9 | 💰 **Income Sources** | Manage recurring income streams that auto-generate transactions on schedule | 🔄 In Progress |
| 10 | 👨‍👩‍👧 **Household Mode** | Shared budgeting for families/groups with role-based member management | ⏳ Planned |
| 11 | 🌐 **Trilingual UI** | Full English / Tamil / Sinhala language toggle with i18n architecture | ⏳ Planned |
| 12 | 🌙 **Adaptive Theming** | System-aware dark/light mode with manual override and persistent preference | ⏳ Planned |

---

## 🏗️ System Architecture

Budget Bee is built on a clean **4-tier architecture** that separates concerns from the mobile client down to the AI integration layer. This design supports independent scaling, testing, and evolution of each tier.

<br />

![Budget Bee System Architecture](./budget-bee-frontend/assets/budgetbee-architecture-diagram.svg)

<br />

### Tier Breakdown

**① Client Tier — React Native (Expo)**
The mobile layer manages all user interaction and presentation logic. Zustand handles lightweight client state (auth, theme, language), while React Query manages server-state synchronisation with caching, background refetching, and optimistic updates. Expo Router provides type-safe, file-based navigation with deep-linking support.

**② Application Tier — Node.js + Express API**
A strictly-typed Express.js server serves as the single entry point for all client requests. Every incoming payload is validated at the boundary using Zod schemas before reaching business logic. Authentication is handled via a JWT access/refresh token pattern — access tokens expire in 15 minutes; refresh tokens rotate every 7 days. Prisma ORM handles all database interactions with type-safe query builders and migration management.

**③ Data Tier — PostgreSQL**
A relational schema with **9 core models**: `User`, `Account`, `Transaction`, `Category`, `Budget`, `Bill`, `Goal`, `IncomeSource`, and `HouseholdMember`. All financial values are stored as **LKR integers** — no floating-point arithmetic anywhere in the data layer. Critical write operations (e.g., adding a transaction and updating account balance) are wrapped in atomic Prisma transactions to guarantee data consistency.

**④ AI Integration Tier — LLM Advice Engine**
A dedicated service aggregates the user's last 30 days of categorised transaction data into a structured context object and dispatches it to an LLM provider (Claude / GPT / Grok via a provider-agnostic adapter). The response is parsed and surfaced to the user as actionable financial insights — spending alerts, saving recommendations, and trend observations.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| [React Native](https://reactnative.dev/) + Expo SDK 51+ | Cross-platform mobile app (iOS & Android) |
| [TypeScript](https://www.typescriptlang.org/) | End-to-end type safety |
| [Expo Router](https://expo.github.io/router/) | File-based, type-safe navigation |
| [Zustand](https://zustand-demo.pmnd.rs/) | Lightweight global state (auth, UI) |
| [TanStack Query](https://tanstack.com/query) | Server state, caching & sync |
| [NativeWind](https://www.nativewind.dev/) | Tailwind CSS utility classes for React Native |
| [react-hook-form](https://react-hook-form.com/) | Performant, uncontrolled form management |
| [react-native-chart-kit](https://github.com/indiespirit/react-native-chart-kit) | Donut, line, and bar charts |

### Backend
| Technology | Purpose |
|---|---|
| [Node.js](https://nodejs.org/) + [Express.js](https://expressjs.com/) | RESTful API server |
| [TypeScript](https://www.typescriptlang.org/) | Strict typing across all layers |
| [Prisma ORM](https://www.prisma.io/) | Type-safe DB access + migrations |
| [PostgreSQL](https://www.postgresql.org/) | Primary relational database (NeonDB / Supabase compatible) |
| [Zod](https://zod.dev/) | Runtime schema validation on all API inputs |
| [JWT](https://jwt.io/) | Stateless auth — access + refresh token rotation |
| [bcrypt](https://github.com/kelektiv/node.bcrypt.js) | Secure password hashing |
| [pnpm workspaces](https://pnpm.io/workspaces) | Monorepo management |

### AI & Infrastructure
| Technology | Purpose |
|---|---|
| Anthropic Claude API | Primary LLM for financial advice generation |
| OpenAI GPT / xAI Grok | Fallback / alternative LLM providers |
| Provider-agnostic adapter pattern | Swap LLM providers without changing business logic |
| LKR integer arithmetic | Floating-point-free financial calculations |

---

## 📊 Project Status

**Version 2.0 — Active Development | Target: Q2 2026**

```
BACKEND                                          FRONTEND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅  PostgreSQL schema (9 Prisma models)           ✅  Onboarding & Auth screens
✅  Auth API (register, login, token refresh)     ✅  Dashboard with live charts
✅  Accounts API (CRUD + balance sync)            ✅  Add Transaction (custom keypad)
✅  Transactions API (atomic updates)             ✅  Budget tracking screen
✅  Categories API                                ✅  AI Advice screen
✅  Budget API                                    🔄  Bills & Reminders screen
✅  AI Advice API (LLM integration)               🔄  Savings Goals screen
🔄  Bills & Recurring Income APIs                 🔄  Income Sources screen
⏳  Household Sharing API                         ⏳  Household Mode screens
⏳  Push Notification service                     ⏳  Bilingual toggle (i18n)
                                                  ⏳  Settings & Theme switcher
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or a [NeonDB](https://neon.tech) / [Supabase](https://supabase.com) connection string)
- pnpm (`npm install -g pnpm`)
- Expo CLI (`npm install -g expo-cli`)
- An LLM API key (Anthropic Claude, OpenAI, or xAI Grok)

### 1. Clone the Repository

```bash
git clone https://github.com/tishanth-t007/budget-bee.git
cd budget-bee
```

### 2. Backend Setup

```bash
cd budget-bee-backend

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
```

Edit `.env` with your values:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/budgetbee"
JWT_SECRET="your-access-token-secret"
JWT_REFRESH_SECRET="your-refresh-token-secret"
AI_PROVIDER="anthropic"           # anthropic | openai | grok
AI_API_KEY="your-api-key-here"
PORT=3000
```

```bash
# Run database migrations
npx prisma migrate dev --name init

# Seed with sample data
npx prisma db seed

# Start development server
pnpm dev
# → API running at http://localhost:3000
```

### 3. Frontend Setup

```bash
cd budget-bee-frontend

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local
```

Edit `.env.local`:
```env
EXPO_PUBLIC_API_URL="http://localhost:3000"
```

```bash
# Start Expo development server
expo start
# → Scan QR code with Expo Go (iOS / Android)
```

---

## 📁 Project Structure

```
BudgetBee/                                   # pnpm monorepo root
│
├── budget-bee-backend/                      # Node.js + Express REST API
│   ├── prisma/
│   │   ├── schema.prisma                    # 9-model DB schema
│   │   ├── migrations/                      # Version-controlled migrations
│   │   └── seed.ts                          # Sample data seeder
│   ├── src/
│   │   ├── config/                          # Env config, constants
│   │   ├── controllers/                     # Route handlers (thin layer)
│   │   ├── middleware/                      # Auth guard, Zod validator, rate limiter
│   │   ├── routes/                          # Express route definitions
│   │   ├── services/                        # Business logic (fat services)
│   │   │   └── ai/                          # LLM adapter + advice engine
│   │   ├── types/                           # Shared TypeScript interfaces
│   │   ├── utils/                           # Helpers (LKR math, date utils)
│   │   ├── app.ts                           # Express app factory
│   │   └── index.ts                         # Server entry point
│   ├── .env.example
│   ├── tsconfig.json
│   └── package.json
│
└── budget-bee-frontend/                     # React Native (Expo) app
    ├── app/
    │   ├── (app)/                           # Protected routes (requires auth)
    │   │   ├── accounts/                    # Account management screens
    │   │   ├── transactions/                # Transaction detail & history
    │   │   ├── index.tsx                    # Dashboard (home)
    │   │   ├── add.tsx                      # Add transaction (custom keypad)
    │   │   ├── budget.tsx                   # Budget tracking
    │   │   ├── advices.tsx                  # AI advice feed
    │   │   ├── income.tsx                   # Income sources
    │   │   ├── settings.tsx                 # App settings
    │   │   └── _layout.tsx                  # Protected layout + nav
    │   └── (auth)/                          # Public auth routes
    │       ├── index.tsx                    # Login / Register
    │       └── _layout.tsx                  # Auth layout
    ├── components/                          # Reusable UI components
    ├── store/                               # Zustand state slices
    ├── lib/                                 # API client, utilities
    ├── assets/                              # Images, SVGs, fonts
    └── app.json                             # Expo configuration
```

---

## 🧠 Engineering Decisions & Design Principles

These are intentional choices made to reflect production-grade thinking:

**Integer arithmetic for currency** — All LKR values are stored and computed as integers (cents equivalent). This completely eliminates floating-point precision errors that plague financial applications using IEEE 754 doubles.

**Atomic transaction writes** — Every operation that modifies both a `Transaction` record and an `Account` balance is wrapped in a Prisma `$transaction()` call. Either both writes succeed or neither does — no partial state is possible.

**Provider-agnostic AI adapter** — The advice engine does not hardcode any single LLM API. A simple adapter interface allows swapping between Claude, GPT, and Grok without touching business logic.

**Zod at the boundary** — All API inputs are validated with Zod schemas before reaching the service layer. This creates a clear trust boundary and means internal services can assume all data is already valid.

**JWT token rotation** — Short-lived access tokens (15 min) paired with rotating refresh tokens (7 days) follow the OAuth 2.0 best practice for stateless auth, minimising the risk of token theft without requiring session storage.

**Monorepo with pnpm workspaces** — Frontend and backend share a single repository with a unified dependency graph, enabling type sharing across packages and consistent tooling.

---

## 🗺️ Roadmap

**v2.0 — Core Platform (In Progress)**
- [x] Full authentication system with token rotation
- [x] Dashboard, transactions, accounts, and budget management
- [x] AI advice engine with LLM integration
- [ ] Bills, recurring income, and savings goals
- [ ] Complete test coverage (Jest + Supertest)

**v2.1 — Household & Collaboration**
- [ ] Household Mode with role-based member management
- [ ] Shared budgets and split expense tracking

**v2.2 — Localisation & Polish**
- [ ] Full Sinhala and Tamil i18n (react-i18next)
- [ ] Dark / Light theme with system-aware detection
- [ ] Push notifications for bill reminders

**v3.0 — Scale & Distribution**
- [ ] App Store & Google Play Store submission
- [ ] Bank statement import (PDF parsing)
- [ ] Offline-first with sync on reconnect

---

## 🤝 Contributing

This project is primarily a personal portfolio and product, but contributions are welcome — especially for in-progress screens or bug fixes.

```bash
# Fork → Branch → PR
git checkout -b feature/your-feature-name
git commit -m "feat: describe your change clearly"
git push origin feature/your-feature-name
```

Please keep pull requests focused, well-described, and scoped to a single concern.

---

## 📬 Contact

<div align="center">

**Tishanth Sivakumar** — Software Engineering Student · Colombo, Sri Lanka 🇱🇰

[![Email](https://img.shields.io/badge/Email-tishanthsivakumar007%40gmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:tishanthsivakumar007@gmail.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-tishanth--t007-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/tishanth-t007/)

</div>

---

<div align="center">

*Built with ❤️ in Sri Lanka 🇱🇰 — solving real problems for real people*

*Full-Stack · TypeScript · React Native · Node.js · PostgreSQL · AI/LLM*

</div>