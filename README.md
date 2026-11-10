# zLedger

A retail kiosk demo built on the **FinLedger Engine** — a high-concurrency double-entry
ledger backend. zLedger looks and flows like a consumer grocery app: browse products, add
to cart, pay with IDR and A-Poin, then watch every mutation land in an immutable audit
trail.

## Demo Accounts

Seeded by the backend (`app.security.users`):

| Username | Password | Role | Use it for |
|---|---|---|---|
| `admin` | `admin123` | ADMIN | Full demo: create accounts, checkout, redeem |
| `merchant` | `merchant123` | MERCHANT | Merchant-side checkout |
| `customer` | `customer123` | CUSTOMER | Customer checkout and redeem |

> Account creation (`POST /ledger/accounts`) requires **ADMIN**. Use `admin` for the
> first run so the demo wallet can be provisioned.

The kiosk wallet is bound to `NEXT_PUBLIC_OWNER_ID` (default `demo-customer`) and pays
merchant `NEXT_PUBLIC_MERCHANT_ID` (default `merch-001`).

## What It Demonstrates

1. **Alfagift-style shopping flow** — search, categories, product shelf, cart, checkout.
2. **Multi-tender payment** — split a cart between IDR balance and A-Poin.
3. **Idempotent checkout** — one `X-Idempotency-Key` per business action, sent in both the
   header and the `idempotencyKey` body field.
4. **Immutable audit trail** — a separate `/ledger` page (not part of the shopping flow)
   showing paired debit/credit entries, with new rows flashing green (credit) or red (debit).
5. **Proof Center** — a separate `/proof` page with four runnable proofs: idempotency
   (5 requests, 1 transaction), concurrency (20 redemptions against quota 5), ledger
   integrity (reconciliation), and live system metrics from Prometheus.
5. **RFC 7807 errors** — every failure is rendered from the backend problem payload.

## Tech Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4, Plus Jakarta Sans, shadcn-style primitives
- Axios with request/response interceptors
- Framer Motion, Sonner, Lucide

## Getting Started

1. Start the [FinLedger Engine backend](https://github.com/ridwanafzn/zLedger) on `http://localhost:8080`.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create `.env.local` (copy from `.env.example`):

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
   NEXT_PUBLIC_OWNER_ID=demo-customer
   NEXT_PUBLIC_MERCHANT_ID=merch-001
   ```

4. Run the dev server:

   ```bash
   npm run dev
   ```

5. Open the printed URL and sign in with `admin` / `admin123`.

## Project Structure

```
zledger-pos/
├── docs/
│   ├── 01_FE_SPEC.md        # UI/UX rules, design tokens, API contract
│   └── 02_AGENT_TASKS.md    # Phased implementation roadmap
├── src/
│   ├── app/                 # App Router entry, layout, global styles
│   │   ├── ledger/          # standalone audit trail page
│   │   └── api/backend/     # same-origin proxy to the FinLedger Engine
│   ├── components/
│   │   ├── account/         # profile panel
│   │   ├── audit/           # dark ledger panel
│   │   ├── kiosk/           # header, wallet, catalog, cart, checkout
│   │   ├── layout/          # shell, bottom tabs, brand
│   │   ├── providers/       # wallet context
│   │   └── ui/              # primitives
│   ├── hooks/               # wallet, profile, mutations, session
│   ├── lib/                 # api client, idempotency, catalog, format
│   └── types/               # API types
├── .env.example
├── .env.local               # local only, never committed
└── README.md
```

## Pages

| Route | Audience | Purpose |
|---|---|---|
| `/` | Shopper | Alfagift-style kiosk: wallet, catalog, cart, checkout |
| `/login` | Shopper | JWT sign-in |
| `/ledger` | Technical reviewer | Audit trail with paired debit/credit entries |
| `/proof` | Technical reviewer | Runnable evidence for idempotency, concurrency, integrity, metrics |

The audit page is intentionally **not** in the bottom navigation. It is reachable from
the account panel ("Audit trail") and from the checkout success banner, so a
non-technical shopper never lands on it by accident.

## API Surface

Only these endpoints are used. Anything else is out of scope.

| Method | Path | Idempotency Key |
|---|---|---|
| `POST` | `/auth/login` | header |
| `GET` | `/auth/me` | no |
| `GET` | `/ledger/accounts` | no |
| `POST` | `/ledger/accounts` | header |
| `GET` | `/ledger/accounts/{accountId}/balance` | no |
| `GET` | `/ledger/accounts/{accountId}/mutations` | no |
| `POST` | `/ledger/checkout` | header + body |
| `POST` | `/ledger/redeem` | query + header |
| `GET` | `/ledger/transactions` | no |
| `GET` | `/vouchers` | no |
| `POST` | `/vouchers/{voucherId}/redeem` | header |
| `GET` | `/admin/outbox` | no |
| `GET` | `/admin/outbox/summary` | no |
| `GET` | `/admin/idempotency?key=` | no |

Every `POST`/`PATCH` carries a fresh `X-Idempotency-Key` UUID, generated once per business
action — never per HTTP attempt.

### CORS and the proxy

The backend only accepts its configured CORS origins, so the browser never calls it
directly. Requests go to the same-origin route handler at `/api/backend/*`, which forwards
them server-to-server to `NEXT_PUBLIC_API_URL`. This also means the app works on any dev
port. Set `NEXT_PUBLIC_API_DIRECT=true` to bypass the proxy.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Lint the codebase |
| `npm run typecheck` | Type-check without emitting |

## Documentation

- [`docs/01_FE_SPEC.md`](docs/01_FE_SPEC.md) — design language, responsive rules, API contract.
- [`docs/02_AGENT_TASKS.md`](docs/02_AGENT_TASKS.md) — six implementation phases.
