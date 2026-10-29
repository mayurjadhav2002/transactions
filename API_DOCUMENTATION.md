## API Endpoints

### Health Check Endpoints

#### `GET /health` & `GET /api/v1/health`

Checks server availability and uptime.

- **Query Parameters**: None
- **Response Status**: `200 OK`
- **Response Body**:

```json
{
  "status": "ok",
  "uptime": 142.54,
  "timestamp": "2026-10-29T10:00:00.000Z"
}
```

---

### Accounts Module (`/api/v1/accounts`)

#### 1. Create Account

Creates a new customer account. If `initialBalance` is greater than 0, an initial `CREDIT` transaction (`Initial Deposit`) is automatically executed and recorded.

- **Method**: `POST`
- **Endpoint**: `/api/v1/accounts`
- **Request Headers**: `Content-Type: application/json`
- **Request Body Fields**:

| Field            | Type     | Required | Default | Description                                         |
| :--------------- | :------- | :------- | :------ | :-------------------------------------------------- |
| `name`           | `string` | **Yes**  | —       | Name of the account holder (min 1 character).       |
| `initialBalance` | `number` | No       | `0`     | Opening balance (must be `>= 0`).                   |
| `currency`       | `string` | No       | `"INR"` | 3-letter currency code (`INR`, `USD`, `EUR`, etc.). |

- **Request Example**:

```json
{
  "name": "Jane Cooper",
  "initialBalance": 25000,
  "currency": "INR"
}
```

- **Response Status**: `201 Created`
- **Response Body**:

```json
{
  "success": true,
  "data": {
    "id": "a7b9bd8d-3000-4e3b-abed-08c9cfc1a6d8",
    "accountNumber": "ACC-CC8B9541BD8FD067",
    "name": "Jane Cooper",
    "balance": "25000",
    "currency": "INR",
    "createdAt": "2026-10-29T08:02:44.593Z",
    "updatedAt": "2026-10-29T08:02:44.593Z"
  }
}
```

---

#### 2. List Accounts

Retrieves a paginated list of accounts with transaction count aggregates.

- **Method**: `GET`
- **Endpoint**: `/api/v1/accounts`
- **Query Parameters**:

| Parameter | Type     | Required | Default | Description                                |
| :-------- | :------- | :------- | :------ | :----------------------------------------- |
| `limit`   | `number` | No       | `20`    | Max accounts to return (`1` to `100`).     |
| `offset`  | `number` | No       | `0`     | Number of accounts to skip.                |
| `search`  | `string` | No       | —       | Filter accounts by name or account number. |

- **Request Example**:

```http
GET /api/v1/accounts?limit=10&offset=0 HTTP/1.1
```

- **Response Status**: `200 OK`
- **Response Body**:

```json
{
  "success": true,
  "data": [
    {
      "id": "a7b9bd8d-3000-4e3b-abed-08c9cfc1a6d8",
      "accountNumber": "ACC-CC8B9541BD8FD067",
      "name": "Jane Cooper",
      "balance": "25000",
      "currency": "INR",
      "createdAt": "2026-10-29T08:02:44.593Z",
      "updatedAt": "2026-10-29T08:02:44.593Z",
      "_count": {
        "transactions": 1
      }
    }
  ],
  "meta": {
    "total": 1,
    "limit": 10,
    "offset": 0
  }
}
```

---

#### 3. Get Account by ID

Retrieves details of an account by its unique UUID.

- **Method**: `GET`
- **Endpoint**: `/api/v1/accounts/:id`
- **Path Parameters**:
  - `id` (`string`, UUID): Account unique identifier.
- **Response Status**: `200 OK`
- **Response Body**:

```json
{
  "success": true,
  "data": {
    "id": "a7b9bd8d-3000-4e3b-abed-08c9cfc1a6d8",
    "accountNumber": "ACC-CC8B9541BD8FD067",
    "name": "Jane Cooper",
    "balance": "25000",
    "currency": "INR",
    "createdAt": "2026-10-29T08:02:44.593Z",
    "updatedAt": "2026-10-29T08:02:44.593Z"
  }
}
```

- **Error Response**: `404 Not Found` if the UUID does not exist (`ACCOUNT_NOT_FOUND`).

---

#### 4. Get Account by Account Number

Retrieves account information using the human-readable account number.

- **Method**: `GET`
- **Endpoint**: `/api/v1/accounts/number/:accountNumber`
- **Path Parameters**:
  - `accountNumber` (`string`): e.g. `ACC-CC8B9541BD8FD067`.
- **Response Status**: `200 OK`
- **Response Body**: Returns the matching account object.

---

### Transactions Module (`/api/v1/transactions`)

#### 1. Create Transaction (Direct Credit or Debit)

Executes a single deposit (`CREDIT`) or withdrawal (`DEBIT`) on an account.

- If `DEBIT`: checks that current balance is `>= amount`. Throws `INSUFFICIENT_FUNDS` (`400`) if balance is insufficient.
- Captures an immutable `balanceAfter` snapshot.
- Enforces idempotency via `referenceId`.

- **Method**: `POST`
- **Endpoint**: `/api/v1/transactions`
- **Request Headers**: `Content-Type: application/json`
- **Request Body Fields**:

| Field         | Type            | Required | Description                                     |
| :------------ | :-------------- | :------- | :---------------------------------------------- |
| `accountId`   | `string` (UUID) | **Yes**  | Destination or source account UUID.             |
| `type`        | `string`        | **Yes**  | `"CREDIT"` (deposit) or `"DEBIT"` (withdrawal). |
| `amount`      | `number`        | **Yes**  | Transaction amount (must be strictly `> 0`).    |
| `referenceId` | `string`        | **Yes**  | Unique transaction identifier for idempotency.  |
| `description` | `string`        | No       | Optional description/memo (max 500 chars).      |

- **Request Example**:

```json
{
  "accountId": "a7b9bd8d-3000-4e3b-abed-08c9cfc1a6d8",
  "type": "CREDIT",
  "amount": 5000,
  "referenceId": "TX-984102",
  "description": "Salary Bonus"
}
```

- **Response Status**: `201 Created`
- **Response Body**:

```json
{
  "success": true,
  "data": {
    "id": "be3818b5-2386-40c0-9727-be7694be92ac",
    "accountId": "a7b9bd8d-3000-4e3b-abed-08c9cfc1a6d8",
    "referenceId": "TX-984102",
    "type": "CREDIT",
    "amount": "5000",
    "balanceAfter": "30000",
    "description": "Salary Bonus",
    "createdAt": "2026-10-29T08:29:35.793Z",
    "account": {
      "id": "a7b9bd8d-3000-4e3b-abed-08c9cfc1a6d8",
      "accountNumber": "ACC-CC8B9541BD8FD067",
      "name": "Jane Cooper",
      "currency": "INR"
    }
  }
}
```

---

#### 2. Atomic Fund Transfer

Executes an atomic transfer between two distinct accounts.

- Runs inside a PostgreSQL `Serializable` transaction isolation level.
- Verifies that `fromAccountId !== toAccountId`.
- Verifies source account has sufficient balance (`currentBalance >= amount`).
- Decrements source account balance and increments destination account balance.
- Creates two correlated transaction records:
  - `DEBIT` on source account with `referenceId`.
  - `CREDIT` on destination account with `${referenceId}-CR`.

- **Method**: `POST`
- **Endpoint**: `/api/v1/transactions/transfer`
- **Request Headers**: `Content-Type: application/json`
- **Request Body Fields**:

| Field           | Type            | Required | Description                                                  |
| :-------------- | :-------------- | :------- | :----------------------------------------------------------- |
| `fromAccountId` | `string` (UUID) | **Yes**  | Source account UUID.                                         |
| `toAccountId`   | `string` (UUID) | **Yes**  | Destination account UUID (must differ from `fromAccountId`). |
| `amount`        | `number`        | **Yes**  | Transfer amount (must be strictly `> 0`).                    |
| `referenceId`   | `string`        | **Yes**  | Unique reference identifier.                                 |
| `description`   | `string`        | No       | Optional transfer note.                                      |

- **Request Example**:

```json
{
  "fromAccountId": "a7b9bd8d-3000-4e3b-abed-08c9cfc1a6d8",
  "toAccountId": "93a03621-8f1b-47a4-9032-a6ca6c2b0700",
  "amount": 2500,
  "referenceId": "TRF-77401",
  "description": "Invoice #492 settlement"
}
```

- **Response Status**: `201 Created`
- **Response Body**:

```json
{
  "success": true,
  "data": {
    "fromTransaction": {
      "id": "31b98a12-87a1-4321-9988-cc77a88b1122",
      "accountId": "a7b9bd8d-3000-4e3b-abed-08c9cfc1a6d8",
      "referenceId": "TRF-77401",
      "type": "DEBIT",
      "amount": "2500",
      "balanceAfter": "27500",
      "description": "Invoice #492 settlement",
      "createdAt": "2026-10-29T09:15:00.000Z",
      "account": {
        "id": "a7b9bd8d-3000-4e3b-abed-08c9cfc1a6d8",
        "accountNumber": "ACC-CC8B9541BD8FD067",
        "name": "Jane Cooper",
        "currency": "INR"
      }
    },
    "toTransaction": {
      "id": "e441c889-1122-3344-5566-778899aabbcc",
      "accountId": "93a03621-8f1b-47a4-9032-a6ca6c2b0700",
      "referenceId": "TRF-77401-CR",
      "type": "CREDIT",
      "amount": "2500",
      "balanceAfter": "12500",
      "description": "Invoice #492 settlement",
      "createdAt": "2026-10-29T09:15:00.000Z",
      "account": {
        "id": "93a03621-8f1b-47a4-9032-a6ca6c2b0700",
        "accountNumber": "ACC-315AD081609AC2F4",
        "name": "Savings Vault",
        "currency": "INR"
      }
    }
  }
}
```

---

#### 3. List Transactions (Server-Side Filtered & Paginated)

Retrieves a paginated list of transactions filtered entirely on the database level.

- **Method**: `GET`
- **Endpoint**: `/api/v1/transactions`
- **Query Parameters**:

| Parameter                | Type            | Required | Default              | Description                                                                                           |
| :----------------------- | :-------------- | :------- | :------------------- | :---------------------------------------------------------------------------------------------------- |
| `page`                   | `number`        | No       | `1`                  | 1-based page index.                                                                                   |
| `limit`                  | `number`        | No       | `10`                 | Max items per page (`1` to `100`, max 10 recommended).                                                |
| `skip` / `offset`        | `number`        | No       | `(page - 1) * limit` | Absolute records to skip (optional alternative to `page`).                                            |
| `search` / `q`           | `string`        | No       | —                    | Case-insensitive search on `description`, `referenceId`, `account.name`, and `account.accountNumber`. |
| `accountId`              | `string` (UUID) | No       | —                    | Filter transactions belonging to a specific account UUID.                                             |
| `type`                   | `string`        | No       | —                    | Filter by type: `"CREDIT"` or `"DEBIT"` (case-insensitive).                                           |
| `startDate` / `fromDate` | `string`        | No       | —                    | Start date (`YYYY-MM-DD`, `DD/MM/YYYY`, or ISO string). Filter checks `>= 00:00:00.000Z`.             |
| `endDate` / `toDate`     | `string`        | No       | —                    | End date (`YYYY-MM-DD`, `DD/MM/YYYY`, or ISO string). Filter checks `<= 23:59:59.999Z`.               |

- **Sample Request (Pagination & Filters)**:

```http
GET /api/v1/transactions?page=1&limit=10&type=CREDIT&startDate=2026-10-01&endDate=2026-10-29&search=Bonus HTTP/1.1
```

- **Response Status**: `200 OK`
- **Response Body**:

```json
{
  "success": true,
  "data": [
    {
      "id": "be3818b5-2386-40c0-9727-be7694be92ac",
      "accountId": "a7b9bd8d-3000-4e3b-abed-08c9cfc1a6d8",
      "referenceId": "TX-984102",
      "type": "CREDIT",
      "amount": "5000",
      "balanceAfter": "30000",
      "description": "Salary Bonus",
      "createdAt": "2026-10-29T08:29:35.793Z",
      "account": {
        "id": "a7b9bd8d-3000-4e3b-abed-08c9cfc1a6d8",
        "accountNumber": "ACC-CC8B9541BD8FD067",
        "name": "Jane Cooper",
        "currency": "INR"
      }
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "skip": 0,
    "offset": 0,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

#### 4. Get Transaction by ID

Retrieves an individual transaction record by its UUID.

- **Method**: `GET`
- **Endpoint**: `/api/v1/transactions/:id`
- **Path Parameters**:
  - `id` (`string`, UUID): Transaction unique identifier.
- **Response Status**: `200 OK`
- **Response Body**: Returns the single transaction record with related account summary.
- **Error Response**: `404 Not Found` if the UUID does not exist (`TRANSACTION_NOT_FOUND`).

---

## Error Handling & Error Codes

All errors pass through the centralized Express error handler in `error.middleware.ts`.

### Error Response Codes

| Status | Code                     | Meaning                   | Trigger Scenario                                                                                          |
| :----: | :----------------------- | :------------------------ | :-------------------------------------------------------------------------------------------------------- |
| `400`  | `VALIDATION_ERROR`       | Request Validation Failed | Missing required fields, invalid UUID format, negative amount, etc. Details returned in `details` object. |
| `400`  | `INVALID_AMOUNT`         | Invalid Amount            | Amount specified was `<= 0`.                                                                              |
| `400`  | `INSUFFICIENT_FUNDS`     | Insufficient Balance      | Account balance is less than requested withdrawal or transfer amount.                                     |
| `404`  | `ACCOUNT_NOT_FOUND`      | Account Not Found         | Provided `accountId`, `fromAccountId`, or `toAccountId` does not exist.                                   |
| `404`  | `TRANSACTION_NOT_FOUND`  | Transaction Not Found     | Provided transaction `id` does not exist.                                                                 |
| `409`  | `DUPLICATE_REFERENCE_ID` | Duplicate Idempotency Key | Transaction with `referenceId` already exists for this account.                                           |
| `409`  | `ACCOUNT_ALREADY_EXISTS` | Duplicate Account         | An account with the generated account number already exists.                                              |
| `500`  | `INTERNAL_SERVER_ERROR`  | Internal Error            | Unhandled runtime or database exceptions.                                                                 |

### Validation Error Example (`400 Bad Request`)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request payload or parameters",
    "details": {
      "amount": ["Transfer amount must be strictly greater than 0"],
      "toAccountId": ["Invalid destination account ID format (expected UUID)"]
    }
  }
}
```

### Business Rule Error Example (`400 Bad Request`)

```json
{
  "error": {
    "code": "INSUFFICIENT_FUNDS",
    "message": "Insufficient funds. Current balance: 1000.0000, requested: 5000"
  }
}
```

---

## Database Schema Reference

The data model is defined with Prisma in PostgreSQL:

### Account Model (`accounts`)

```prisma
model Account {
  id            String        @id @default(uuid()) @db.Uuid
  accountNumber String        @unique
  name          String
  balance       Decimal       @default(0) @db.Decimal(19, 4)
  currency      String        @default("INR")
  transactions  Transaction[]
  createdAt     DateTime      @default(now()) @db.Timestamptz(3)
  updatedAt     DateTime      @updatedAt @db.Timestamptz(3)
}
```

### Transaction Model (`transactions`)

```prisma
enum TransactionType {
  CREDIT
  DEBIT
}

model Transaction {
  id           String          @id @default(uuid()) @db.Uuid
  accountId    String          @db.Uuid
  referenceId  String
  type         TransactionType
  amount       Decimal         @db.Decimal(19, 4)
  balanceAfter Decimal         @db.Decimal(19, 4)
  description  String?
  createdAt    DateTime        @default(now()) @db.Timestamptz(3)

  account Account @relation(fields: [accountId], references: [id], onDelete: Restrict)

  @@unique([accountId, referenceId])
  @@index([accountId, createdAt])
}
```
