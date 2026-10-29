export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

export const API_ENDPOINTS = {
  HEALTH_CHECK: "/health",

  ACCOUNTS: {
    CREATE: "/accounts",
    LIST: "/accounts",
    BY_ID: (accountId: string) => `/accounts/${encodeURIComponent(accountId)}`,
    BY_ACCOUNT_NUMBER: (accountNumber: string) =>
      `/accounts/number/${encodeURIComponent(accountNumber)}`,
  },

  TRANSACTIONS: {
    CREATE: "/transactions",
    TRANSFER: "/transactions/transfer",
    LIST: "/transactions",
    BY_ID: (transactionId: string) =>
      `/transactions/${encodeURIComponent(transactionId)}`,
  },
} as const;

export * from "./accounts.api";
export * from "./transactions.api";

