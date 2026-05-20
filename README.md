# Quickbook

A small-business style accounting web app: chart of accounts, journal entries, invoices, bills, expenses, payroll, inventory, cost centers, and financial reports. Built as a [Next.js](https://nextjs.org) App Router application with a SQLite database via [Prisma](https://www.prisma.io).

**Repository:** [github.com/ABDULLAHUMAR020703/Quickbook](https://github.com/ABDULLAHUMAR020703/Quickbook)

## Features

- **Authentication** — Session-based login; protected dashboard routes  
- **Core accounting** — Accounts, journal entries, general ledger-style reporting  
- **AR / AP** — Customers, vendors, invoices, bills, receipts  
- **Operations** — Employees, payroll, inventory, expenses, tax helpers  
- **Reporting** — Balance sheet, profit & loss, cash flow, and related API routes  

## Tech stack

| Layer | Choice |
|--------|--------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4, Radix UI |
| Database | SQLite (`dev.db` in project root) |
| ORM | Prisma 7 with `better-sqlite3` adapter |
| Validation / forms | Zod, React Hook Form |

## Prerequisites

- **Node.js** 20+ (LTS recommended)  
- **npm** (or compatible package manager)

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/ABDULLAHUMAR020703/Quickbook.git
cd Quickbook
npm install
```

### 2. Environment

Prisma CLI reads the database URL from `prisma.config.ts`. Create a `.env` file in the project root:

```env
DATABASE_URL="file:./dev.db"
```

The running app uses a SQLite file at `dev.db` in the project root (see `src/lib/prisma.ts`). Keep `.env` out of version control; it is already listed in `.gitignore`.

### 3. Database schema and seed

```bash
npm run db:push
npm run db:seed
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). After seeding, sign in with one of these **development-only** accounts (change or remove them before any real deployment):

| Role | Email | Password |
|------|--------|----------|
| Admin | `admin@financebook.com` | `admin123` |
| Accountant | `accountant@financebook.com` | `accountant123` |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js in development |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push Prisma schema to SQLite |
| `npm run db:seed` | Run `prisma/seed.ts` |
| `npm run db:studio` | Open Prisma Studio |

## Project layout (high level)

- `src/app/(auth)` — Login and related routes  
- `src/app/(dashboard)` — Main app shell and feature pages  
- `src/app/api` — REST-style route handlers for CRUD and reports  
- `src/components` — Shared UI (tables, forms, layout pieces)  
- `src/lib` — Auth helpers, Prisma client, utilities  
- `prisma/schema.prisma` — Data models  
- `prisma/seed.ts` — Sample data  

## Deploying

You can deploy on [Vercel](https://vercel.com) or any Node host. For production, plan for a **persistent SQLite file** or switch the Prisma datasource to PostgreSQL/MySQL and set `DATABASE_URL` accordingly—the app currently targets a local SQLite file path for the Prisma adapter.

For framework-level topics (routing, deployment, images), see the [Next.js documentation](https://nextjs.org/docs).
