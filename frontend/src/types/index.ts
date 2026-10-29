export type AccountColor =
  | "blue"
  | "emerald"
  | "violet"
  | "orange"
  | "pink"
  | "amber";

export interface Account {
  id: string;
  name: string;
  code: string;
  accountNumber?: string;
  balance: number;
  currency?: string;
  createdAtDate?: string;
  createdAtTime?: string;
  createdAt?: string;
  avatarLetter: string;
  color: AccountColor;
  transactionCount: number;
}

export type TransactionType = "credit" | "debit";

export interface Transaction {
  id: string;
  dateTime: string;
  accountId: string;
  accountName: string;
  accountInitial?: string;
  accountColor?: AccountColor;
  type: TransactionType;
  amount: number;
  referenceId: string;
  description: string;
  balance: number;
  createdAt?: string;
  account?: {
    id: string;
    accountNumber: string;
    name: string;
    currency: string;
  };
}

export interface Transfer {
  id: string;
  dateTime: string;
  fromAccountId: string;
  fromAccountName: string;
  fromAccountCode: string;
  fromAccountInitial: string;
  fromAccountColor: AccountColor;
  toAccountId: string;
  toAccountName: string;
  toAccountCode: string;
  toAccountInitial: string;
  toAccountColor: AccountColor;
  amount: number;
  referenceId: string;
  description: string;
}

export interface NewAccountPayload {
  name: string;
  initialBalance: number;
  currency?: string;
}

export interface NewTransactionPayload {
  accountId: string;
  type: TransactionType;
  amount: number;
  referenceId: string;
  description: string;
}

export interface NewTransferPayload {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  referenceId: string;
  description: string;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
}
