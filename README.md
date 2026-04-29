# Esusu — Invoice Generator

A clean, full-stack invoice management system built for small businesses, freelancers, and sellers. Create professional invoices in seconds, share them via a public link, and track payment status — all in one place.

---

## Features

- **Invoice builder** — line items, tax rate, currency selection, due dates
- **Live preview** — see the formatted invoice update as you type
- **Detailed letterhead** — logo, company name, full address on every invoice
- **Authorized signature** — per-invoice signatory, rendered in cursive
- **Public share link** — send clients a read-only invoice URL (no login required)
- **PDF / HTML download** — print-ready export via the download button
- **Status workflow** — Draft → Sent → Paid (or Overdue)
- **Payment details** — bank transfer, mobile money, or custom payment notes
- **Settings** — company profile, logo URL, bank details, default currency & tax rate
- **Dashboard** — total paid, outstanding, recent invoice list

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui (Base UI variant) |
| Database | PostgreSQL via [Prisma 7](https://www.prisma.io/) |
| ORM Adapter | `@prisma/adapter-pg` (direct connection) |
| Auth | [NextAuth.js v5 / Auth.js](https://authjs.dev/) — credentials + Google OAuth |
| Validation | [Zod](https://zod.dev/) |

---

## Project Structure

```
esusu/
├── app/
│   ├── (auth)/            # /login, /signup — public pages
│   ├── (dashboard)/       # /dashboard, /invoices/*, /settings — protected
│   ├── api/               # REST API routes
│   │   ├── auth/          # NextAuth handlers
│   │   ├── invoices/      # CRUD + PDF export
│   │   └── user/settings  # Profile update
│   └── invoice/[id]/      # Public share page (SSR, no auth)
├── components/
│   ├── invoice/
│   │   ├── InvoiceForm.tsx      # Create / edit form with live preview
│   │   ├── InvoicePreview.tsx   # Invoice renderer (used in form & view)
│   │   └── InvoiceStatusActions.tsx
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── auth.ts            # NextAuth config
│   ├── db.ts              # Prisma client singleton
│   ├── invoice.ts         # Calc helpers, formatters, status colours
│   └── default-user.ts    # Single-owner mode (no multi-tenant auth)
├── prisma/
│   └── schema.prisma
└── types/
    └── index.ts
```

---

## Local Development

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or remote)

### 1. Clone & install

```bash
git clone https://github.com/owolabiopeyemih-lgtm/Invoice-generator-system.git
cd Invoice-generator-system
npm install
```

### 2. Environment variables

Create a `.env` file in the project root:

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# NextAuth — generate a secret with: openssl rand -base64 32
AUTH_SECRET="your-random-secret"

# Your app URL (use http://localhost:3000 for local dev)
AUTH_URL="http://localhost:3000"

# Optional: Google OAuth (get credentials from Google Cloud Console)
# AUTH_GOOGLE_ID="your-google-client-id"
# AUTH_GOOGLE_SECRET="your-google-client-secret"
```

### 3. Set up the database

```bash
# Push schema to your database (creates all tables)
npx prisma db push

# Generate the Prisma client
npx prisma generate
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUTH_SECRET` | Yes | Random secret for session signing |
| `AUTH_URL` | Yes | Full base URL of the deployment |
| `AUTH_GOOGLE_ID` | No | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | No | Google OAuth client secret |

---

## Database Schema (key models)

```prisma
model User {
  email           String    @unique
  businessName    String?
  businessLogo    String?
  businessAddress String?
  bankName        String?
  bankAccount     String?
  signatureText   String?
  currency        String    @default("NGN")
  taxRate         Float     @default(0)
  invoices        Invoice[]
}

model Invoice {
  number         String
  clientName     String
  items          InvoiceItem[]
  status         InvoiceStatus @default(DRAFT)  // DRAFT | SENT | PAID | OVERDUE
  signatureText  String?
  shareToken     String        @unique @default(cuid())
  ...
}
```

---

## Deployment (Vercel)

### 1. Push to GitHub

```bash
git push origin main
```

### 2. Import on Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import the GitHub repository
2. Vercel auto-detects Next.js — no build config changes needed

### 3. Add environment variables

In the Vercel dashboard → **Settings → Environment Variables**, add:

| Key | Value |
|---|---|
| `DATABASE_URL` | Your production PostgreSQL URL |
| `AUTH_SECRET` | A strong random secret |
| `AUTH_URL` | Your Vercel URL, e.g. `https://invoice-generator-system.vercel.app` |

### 4. Run the database migration (once)

After the first deploy, run from your local machine pointing at the production DB:

```bash
DATABASE_URL="<your-production-url>" npx prisma db push
```

---

## Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run lint      # ESLint

npx prisma studio          # Open Prisma database GUI
npx prisma db push         # Sync schema to database
npx prisma generate        # Regenerate Prisma client
```

---

## License

MIT
