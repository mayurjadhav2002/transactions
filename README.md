# Core Banking Ledger Platform

A scalable, double-entry financial ledger and banking platform built with **Node.js**, **Express**, **TypeScript**, **Prisma 7**, **PostgreSQL**, **React 19**, and **Tailwind CSS**. Engineered with strict ACID compliance, dynamic balance validation, atomic fund transfers, and interactive OpenAPI/Swagger documentation.

---

## 📂 Folder Structure

```text
.
├── backend/
│   ├── src/
│   │   ├── config/              # Environment config & Swagger OpenAPI setup
│   │   ├── lib/                 # Prisma client instance & DB connection
│   │   ├── middleware/          # Request logging, error handler & validation
│   │   ├── modules/
│   │   │   ├── accounts/        # Account schemas, service, controller, routes
│   │   │   └── transactions/    # Transaction & transfer logic, schemas, controller
│   │   ├── app.ts               # Express app configuration & middleware
│   │   └── server.ts            # Server bootstrap & graceful shutdown
│   ├── prisma/                  # Prisma 7 schema & migrations
│   ├── Dockerfile               # Node 20 production container
│   ├── .env.example             # Backend environment template
│   └── package.json             # Backend dependencies & scripts
├── frontend/
│   ├── src/
│   │   ├── api/                 # Strongly-typed Axios/Fetch API client functions
│   │   ├── components/          # Accounts, Transfers, Transactions & UI components
│   │   ├── context/             # FinanceContext & pure ledger helper functions
│   │   ├── lib/                 # TanStack Query client & API client configurations
│   │   ├── types/               # TypeScript interfaces & domain types
│   │   ├── App.tsx              # Main dashboard layout & active view controller
│   │   └── main.tsx             # React DOM root with TanStack Query provider
│   ├── Dockerfile               # Node 20 container running Vite preview
│   ├── vite.config.ts           # Vite bundler, Tailwind v4 & /api reverse proxy
│   ├── .env.example             # Frontend environment template
│   └── package.json             # Frontend dependencies & scripts
├── docker-compose.yml           # Multi-container orchestration (backend + frontend)
└── README.md                    # Project documentation
```

---

## 🏗️ Design Approach

The project is structured with modular design patterns, strict separation of concerns, and defensive financial engineering:

- **Modular Backend Architecture**: Business logic is decoupled into domain modules (`accounts`, `transactions`), each containing isolated controller, service, schema, and route definitions.
- **Reverse Proxy & Origin Masking**: Frontend communicates exclusively via relative `/api` paths. Vite dev server and container preview proxy backend traffic internally, hiding backend ports and eliminating CORS overhead.
- **TanStack React Query & Pure Context**: Server state is managed via React Query for caching, query invalidation, and background synchronization, while financial context functions are written as pure, testable helpers.

---

## ⚡ Key Features

- **Account Management**: Create accounts with initial balances, automated human-readable account numbers (`ACC-XXXXXXXX`), multi-currency support (INR, USD, EUR), and real-time ledger metrics.
- **Atomic Fund Transfers**: ACID-compliant double-entry fund transfers wrapped inside PostgreSQL database transactions. Automatically generates matched `DEBIT` and `CREDIT` transaction records.
- **Balance Snapshots (`balanceAfter`)**: Every transaction captures an immutable snapshot of the account balance immediately following execution for historical auditability.
- **Paginated Ledger History**: Filterable and paginated transaction view supporting search by account ID, reference ID, and transaction type.
- **OpenAPI / Swagger Documentation**: Interactive API testing playground available at `/docs`.

---

## 🛡️ Validations and Data Integrity

- **Zod Runtime Schema Validation**: All incoming requests (params, queries, and bodies) are strictly validated before hitting services.
- **Arbitrary Precision Decimal Math**: Utilizes Decimal types across Prisma and PostgreSQL to prevent floating-point rounding errors in currency operations.
- **Double-Spend & Overdraft Prevention**: Balance sufficiency is verified inside atomic transaction locks, ensuring accounts can never go into negative balance.
- **Idempotency Ready**: Unique client-supplied `referenceId` values track transactions and ensure duplicate calls can be identified.

---

## 🚀 Live Demo & Testing

### Interactive Documentation & Dashboard
- **Web App**: [http://localhost:5173](http://localhost:5173)
- **Swagger API Docs**: [http://localhost:8002/docs](http://localhost:8002/docs)

### Sample API Requests (via cURL)

#### 1. Create an Account
```bash
curl -X POST http://localhost:5173/api/v1/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "currency": "INR",
    "initialBalance": 15000
  }'
```

#### 2. Execute a Direct Transaction (Credit / Debit)
```bash
curl -X POST http://localhost:5173/api/v1/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "<ACCOUNT_UUID>",
    "amount": 2500,
    "type": "CREDIT",
    "referenceId": "REF-DEPOSIT-101",
    "description": "Direct deposit"
  }'
```

#### 3. Execute an Atomic Transfer
```bash
curl -X POST http://localhost:5173/api/v1/transactions/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "fromAccountId": "<SOURCE_ACCOUNT_UUID>",
    "toAccountId": "<DESTINATION_ACCOUNT_UUID>",
    "amount": 5000,
    "referenceId": "TRANSFER-TX-202",
    "description": "Vendor payout"
  }'
```

---

## ⚙️ Setup & Usage Guide

### 1. Environment Setup

Clone the repository and copy the environment template in both `backend` and `frontend`:

```bash
# Backend setup
cd backend
cp .env.example .env

# Frontend setup
cd ../frontend
cp .env.example .env
cd ..
```

**Required Backend `.env` Variables**:
```env
DATABASE_URL=postgres://user:password@host:port/dbname?sslmode=no-verify
PORT=8000
NODE_ENV=development
```

**Required Frontend `.env` Variables**:
```env
VITE_API_BASE_URL=/api/v1
BACKEND_TARGET=http://127.0.0.1:8000
```

---

### 2. Run Locally (with pnpm)

#### Start the Backend:
```bash
cd backend
pnpm install
pnpm prisma generate
pnpm dev
```
Backend runs on `http://localhost:8000` (Swagger docs at `http://localhost:8000/docs`).

#### Start the Frontend:
```bash
cd frontend
pnpm install
pnpm dev
```
Frontend runs on `http://localhost:5173`.

---

### 3. Run with Docker Compose

To orchestrate the complete stack in isolated containers:

```bash
# Build and run containers in background
docker compose up -d --build

# Inspect running containers
docker compose ps

# View live container logs
docker compose logs -f
```

- Frontend is available at: `http://localhost:5173`
- Backend API / Swagger is available at: `http://localhost:8002/docs`

To stop the containers:
```bash
docker compose down
```

---

## 📖 API Documentation

> [!NOTE]
> For the comprehensive specification with full request/response schemas, field validations, and error codes, refer to [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

### Accounts Endpoints (`/api/v1/accounts`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/accounts` | Create a new account with optional initial balance |
| `GET` | `/api/v1/accounts` | List accounts with pagination (`limit`, `offset`, `search`) |
| `GET` | `/api/v1/accounts/:id` | Get account details by UUID |
| `GET` | `/api/v1/accounts/number/:accountNumber` | Get account details by human-readable account number |

### Transactions Endpoints (`/api/v1/transactions`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/transactions` | Post a single `CREDIT` or `DEBIT` transaction |
| `POST` | `/api/v1/transactions/transfer` | Execute an atomic fund transfer between two accounts |
| `GET` | `/api/v1/transactions` | List transactions with filters (`page`, `limit`, `search`, `accountId`, `type`, `startDate`, `endDate`) |
| `GET` | `/api/v1/transactions/:id` | Get single transaction record by UUID |

---

## 🔮 Future Improvements

1. **Redis Caching & Distributed Locks**: Introduce Redis Redlock on high-throughput transfer endpoints to safeguard concurrent requests on the same account across multi-instance clusters.
2. **Outbox Pattern & Webhook Events**: Implement a transactional outbox queue to trigger asynchronous webhooks and third-party notifications upon transaction confirmation.
3. **Multi-Currency Real-time FX Conversion**: Integrate foreign exchange rate feeds to support instantaneous currency conversion during cross-currency transfers.