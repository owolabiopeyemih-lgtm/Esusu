# Esusu — Invoice Generator

> A clean, full-stack invoice management system built for small businesses, freelancers, and independent sellers. Create professional invoices in seconds, share them via a public link, and track payment status — all without needing an accounting background.

**Live app**: [https://esusu-ten.vercel.app](https://esusu-ten.vercel.app)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running Locally](#running-locally)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Auth](#auth)
- [Deployment](#deployment)
- [Available Scripts](#available-scripts)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

Esusu solves a simple problem: most small business owners and independent sellers don't have a consistent, professional way to bill clients. Existing tools are too complex, too expensive, or require accounting knowledge.

Esusu lets you:
- Build an invoice with line items, tax, and a due date in under a minute
- Send your client a public link they can open without signing up
- Track which invoices are paid, outstanding, or overdue from a single dashboard

---

## Features

### Invoice Builder
- Itemized line items with quantity, unit price, and auto-calculated amounts
- Subtotal, configurable tax rate, and grand total — all computed live
- Issue date and due date pickers
- Notes field and custom thank-you message
- Per-invoice payment method and details (bank transfer, mobile money, etc.)
- Authorized signatory rendered in cursive on the invoice

### Invoice Management
- **Status workflow**: `DRAFT → SENT → PAID` (or `OVERDUE`)
- One-click status advancement from the invoice detail page
- Edit any draft or sent invoice
- Delete invoices (with cascade-delete of all line items)

### Invoice Sharing & Export
- Every invoice gets a unique `shareToken` — a public read-only URL (`/invoice/[shareToken]`) that requires no login
- **PDF / HTML download** — print-ready export via the download button on the public page
- Share directly with clients via WhatsApp, email, or any messenger

### Dashboard
- Summary cards: total paid, total outstanding, overdue count
- Recent invoices list with status badges and quick links

### Business Profile & Settings
- Company name, logo URL, full address
- Default currency (NGN default) and default tax rate — pre-filled on new invoices
- Bank name, account number, and account name for payment instructions
- Signature text applied to all new invoices

### Auth
- Email + password sign-up / login
- Google OAuth (optional)
- Password hashed with `bcryptjs`
- Protected routes via NextAuth.js v5 middleware proxy

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) (Base UI variant — Tailwind v4 compatible) |
| Database | PostgreSQL |
| ORM | [Prisma 7](https://www.prisma.io/) + `@prisma/adapter-pg` |
| Auth | [NextAuth.js v5 / Auth.js](https://authjs.dev/) — credentials + Google OAuth |
| PDF | `@react-pdf/renderer` |
| Validation | [Zod v4](https://zod.dev/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Hosting | [Vercel](https://vercel.com/) |

---

## Project Structure

```
esusu/
├── app/
│   ├── (auth)/                   # Public auth pages
│   │   ├── login/                # /login
│   │   └── signup/               # /signup
│   ├── (dashboard)/              # Protected pages (auth-checked in layout)
│   │   ├── dashboard/            # /dashboard — summary cards + recent invoices
│   │   ├── invoices/
│   │   │   ├── page.tsx          # /invoices — full invoice list
│   │   │   ├── new/              # /invoices/new — create form
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # /invoices/[id] — detail view
│   │   │       └── edit/         # /invoices/[id]/edit — edit form
│   │   └── settings/             # /settings — business profile
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/    # NextAuth handler (GET/POST)
│   │   │   └── signup/           # POST — create user
│   │   ├── invoices/
│   │   │   ├── route.ts          # GET list, POST create
│   │   │   └── [id]/
│   │   │       ├── route.ts      # GET, PATCH, DELETE (owner-scoped)
│   │   │       └── pdf/          # GET — printable HTML (by id or shareToken)
│   │   └── user/
│   │       └── settings/         # PATCH — update business profile
│   ├── invoice/
│   │   └── [id]/                 # /invoice/[shareToken] — public SSR share page
│   └── generated/
│       └── prisma/               # Auto-generated Prisma client (gitignored)
├── components/
│   ├── invoice/
│   │   ├── InvoiceForm.tsx       # Create / edit form with live preview panel
│   │   ├── InvoicePreview.tsx    # Invoice renderer (reused in form, detail & share page)
│   │   └── InvoiceStatusActions.tsx  # Status advance button (client component)
│   └── ui/                       # shadcn/ui primitive components
├── lib/
│   ├── auth.ts                   # NextAuth config — providers, callbacks, session shaping
│   ├── db.ts                     # Prisma client singleton with PrismaPg adapter
│   ├── invoice.ts                # calcInvoiceTotals, formatCurrency, generateInvoiceNumber, STATUS_COLORS
│   └── utils.ts                  # cn() utility
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Migration history
├── prisma.config.ts              # Prisma v7 config (connection string lives here, not in schema)
├── proxy.ts                      # Next.js 16 middleware (renamed from middleware.ts)
├── types/
│   └── index.ts                  # Shared TypeScript types
├── public/                       # Static assets
├── .env                          # Local environment variables (gitignored)
└── next.config.ts
```

---

## Getting Started

### Prerequisites

- **Node.js** 18 or later
- **npm** 9+ (or pnpm / yarn)
- A **PostgreSQL** database (local or hosted — [Neon](https://neon.tech) is recommended for free-tier cloud Postgres)

### Installation

```bash
git clone https://github.com/owolabiopeyemih-lgtm/Esusu.git
cd Esusu
npm install
```

### Environment Variables

Create a `.env` file in the project root with the following:

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"

# NextAuth — generate with: openssl rand -base64 32
AUTH_SECRET="your-random-secret-here"

# Your app's base URL
AUTH_URL="http://localhost:3000"

# Optional: Google OAuth
# Get credentials from https://console.cloud.google.com/ → APIs & Services → Credentials
# AUTH_GOOGLE_ID="your-google-client-id"
# AUTH_GOOGLE_SECRET="your-google-client-secret"
```

#### Full Environment Variable Reference

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Full PostgreSQL connection string |
| `AUTH_SECRET` | Yes | Random secret used to sign session tokens |
| `AUTH_URL` | Yes | Base URL of the app (e.g. `https://esusu-ten.vercel.app`) |
| `AUTH_GOOGLE_ID` | No | Google OAuth client ID (enables Sign in with Google) |
| `AUTH_GOOGLE_SECRET` | No | Google OAuth client secret |

### Database Setup

```bash
# Sync the schema to your database (creates all tables)
npx prisma db push

# Generate the Prisma client
npx prisma generate
```

> **Note:** This project uses `prisma db push` instead of `prisma migrate dev` because Prisma v7 shadow-DB creation fails against some hosted providers (e.g. Neon). `db push` is safe for both local dev and production.

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The dev server auto-picks an available port if 3000 is taken.

---

## API Reference

All API routes live under `/api`. Protected routes require a valid session cookie.

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Public | Create a new user account |
| `GET/POST` | `/api/auth/[...nextauth]` | Public | NextAuth handler (login, logout, OAuth) |
| `GET` | `/api/invoices` | Required | List all invoices for the authenticated user |
| `POST` | `/api/invoices` | Required | Create a new invoice |
| `GET` | `/api/invoices/[id]` | Required | Get a single invoice by internal ID |
| `PATCH` | `/api/invoices/[id]` | Required | Update an invoice (replaces items wholesale) |
| `DELETE` | `/api/invoices/[id]` | Required | Delete an invoice and all its line items |
| `GET` | `/api/invoices/[id]/pdf` | Public | Return printable HTML — accepts `id` or `shareToken` |
| `PATCH` | `/api/user/settings` | Required | Update the authenticated user's business profile |

---

## Database Schema

```
User
├── id, email, name, password (hashed), image
├── businessName, businessLogo, businessAddress
├── bankName, bankAccountName, bankAccount
├── signatureText
├── currency (default: "NGN"), taxRate (default: 0)
└── → invoices[], accounts[], sessions[], templates[]

Invoice
├── id, number (e.g. "INV-0001"), userId
├── clientName, clientEmail, clientPhone, clientAddress
├── subtotal, taxRate, taxAmount, total, currency
├── status: DRAFT | SENT | PAID | OVERDUE
├── issueDate, dueDate
├── notes, paymentMethod, paymentDetails, thankYouNote
├── signatureText
├── shareToken (unique cuid — used for public share links)
└── → items[]  (cascade-deleted on invoice delete)

InvoiceItem
└── description, quantity, unitPrice, amount

Template
└── name, data (JSON) — schema ready; UI not yet built
```

Key constraints:
- `Invoice.number` is unique **per user** (`@@unique([userId, number])`) — the same number can't appear twice on one account
- `Invoice.shareToken` is globally unique and is the only identifier exposed publicly (the internal `id` is never shared)

---

## Auth

Authentication is handled by **NextAuth.js v5 (Auth.js beta)** configured in `lib/auth.ts`.

- **Credentials provider** — email + bcrypt-hashed password stored in Postgres
- **Google OAuth provider** — optional; enable by setting `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`
- **Session strategy** — JWT; `session.user.id` is injected via the `jwt` + `session` callbacks
- **Route protection** — `proxy.ts` (Next.js 16's renamed `middleware.ts`) redirects unauthenticated users away from `/dashboard`, `/invoices/*`, and `/settings`
- **Public routes** — `/login`, `/signup`, and `/invoice/[shareToken]` are fully public

---

## Deployment

The app is deployed on Vercel. To deploy your own instance:

### 1. Push to GitHub

```bash
git push origin main
```

### 2. Import on Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import your GitHub repository
2. Vercel auto-detects Next.js — no build config changes needed
3. Set the **Root Directory** to `esusu` if you cloned the full monorepo

### 3. Add Environment Variables

In **Vercel Dashboard → Project → Settings → Environment Variables**, add:

| Key | Value |
|---|---|
| `DATABASE_URL` | Your production PostgreSQL connection string |
| `AUTH_SECRET` | A strong random secret (`openssl rand -base64 32`) |
| `AUTH_URL` | Your Vercel deployment URL, e.g. `https://esusu-ten.vercel.app` |
| `AUTH_GOOGLE_ID` | *(optional)* Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | *(optional)* Google OAuth client secret |

### 4. Initialise the Production Database

Run once from your local machine, pointing at the production database:

```bash
DATABASE_URL="<your-production-url>" npx prisma db push
```

### Recommended Database

[Neon](https://neon.tech) provides a free-tier serverless PostgreSQL that works seamlessly with Vercel. After creating a project, copy the connection string into `DATABASE_URL`.

---

## Available Scripts

Run all commands from the `esusu/` directory.

```bash
# Development
npm run dev          # Start dev server (Turbopack, hot reload)

# Production
npm run build        # Create optimised production build
npm run start        # Serve the production build locally

# Code quality
npm run lint         # Run ESLint

# Prisma
npx prisma db push         # Sync schema changes to the database
npx prisma generate        # Regenerate the Prisma client after schema changes
npx prisma studio          # Open the Prisma database browser GUI
npx prisma migrate dev     # Create a migration (avoid on Neon — use db push instead)
```

---

## Roadmap

- [ ] Template builder — save and reuse invoice layouts
- [ ] Email delivery — send invoices directly from the app
- [ ] Recurring invoices — schedule repeating bills
- [ ] Client address book — save client details for quick re-use
- [ ] Multi-currency support with live exchange rates
- [ ] CSV / Excel export of invoice history
- [ ] Team accounts — multiple users on one business account
- [ ] Stripe / Paystack payment link on public invoice page

---

## License

MIT
