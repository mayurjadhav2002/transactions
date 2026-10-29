import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "./index";
import type {
  ApiResponse,
  NewTransactionPayload,
  NewTransferPayload,
  PaginationMeta,
  Transaction,
  Transfer,
} from "@/types";
import { getAccountColor } from "@/context/finance.helpers";

export interface RawTransactionResponse {
  id: string;
  accountId: string;
  referenceId: string;
  type: "CREDIT" | "DEBIT";
  amount: string | number;
  balanceAfter: string | number;
  description: string | null;
  createdAt: string;
  account?: {
    id: string;
    accountNumber: string;
    name: string;
    currency: string;
  };
}

export const mapRawTransactionToTransaction = (
  raw: RawTransactionResponse,
  index = 0,
): Transaction => {
  const parsedDate = new Date(raw.createdAt);
  const isValidDate = !isNaN(parsedDate.getTime());

  const dateTime = isValidDate
    ? `${parsedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}, ${parsedDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`
    : "Recently";

  const accountName = raw.account?.name || "Account";
  const accountInitial = accountName.trim().charAt(0).toUpperCase() || "A";
  const accountColor = getAccountColor(index);

  return {
    id: raw.id,
    dateTime,
    accountId: raw.accountId,
    accountName,
    accountInitial,
    accountColor,
    type: raw.type.toLowerCase() as "credit" | "debit",
    amount: typeof raw.amount === "number" ? raw.amount : parseFloat(raw.amount) || 0,
    referenceId: raw.referenceId,
    description: raw.description || (raw.type === "CREDIT" ? "Credit" : "Debit"),
    balance: typeof raw.balanceAfter === "number" ? raw.balanceAfter : parseFloat(raw.balanceAfter) || 0,
    createdAt: raw.createdAt,
    account: raw.account,
  };
};

export interface FetchTransactionsParams {
  page?: number;
  limit?: number;
  offset?: number;
  skip?: number;
  accountId?: string;
  type?: "CREDIT" | "DEBIT" | "credit" | "debit" | "all";
  search?: string;
  q?: string;
  startDate?: string;
  endDate?: string;
  fromDate?: string;
  toDate?: string;
}

export const fetchTransactions = async (
  params: FetchTransactionsParams = { limit: 10, page: 1 },
): Promise<{ transactions: Transaction[]; meta: PaginationMeta }> => {
  const { data } = await apiClient.get<ApiResponse<RawTransactionResponse[]>>(
    API_ENDPOINTS.TRANSACTIONS.LIST,
    { params },
  );

  const rawList = data.data || [];
  const baseOffset =
    params.skip ??
    params.offset ??
    ((params.page || 1) - 1) * (params.limit || 10);

  const transactions = rawList.map((raw, idx) =>
    mapRawTransactionToTransaction(raw, baseOffset + idx),
  );

  const defaultMeta: PaginationMeta = {
    total: transactions.length,
    limit: params.limit || 10,
    offset: baseOffset,
    page: params.page || 1,
    skip: baseOffset,
    totalPages: Math.max(1, Math.ceil(transactions.length / (params.limit || 10))),
    hasNextPage: false,
    hasPrevPage: false,
  };

  return {
    transactions,
    meta: data.meta ? { ...defaultMeta, ...data.meta } : defaultMeta,
  };
};

export const fetchTransactionById = async (
  id: string,
): Promise<Transaction> => {
  const { data } = await apiClient.get<ApiResponse<RawTransactionResponse>>(
    API_ENDPOINTS.TRANSACTIONS.BY_ID(id),
  );
  return mapRawTransactionToTransaction(data.data);
};

export const createTransaction = async (
  payload: NewTransactionPayload,
): Promise<Transaction> => {
  const response = await apiClient.post<ApiResponse<RawTransactionResponse>>(
    API_ENDPOINTS.TRANSACTIONS.CREATE,
    {
      accountId: payload.accountId,
      referenceId: payload.referenceId,
      type: payload.type.toUpperCase() as "CREDIT" | "DEBIT",
      amount: payload.amount,
      description: payload.description,
    },
  );
  return mapRawTransactionToTransaction(response.data.data);
};

export interface TransferApiResponse {
  fromTransaction: RawTransactionResponse;
  toTransaction: RawTransactionResponse;
}

export const executeTransfer = async (
  payload: NewTransferPayload,
): Promise<{ transfer: Transfer; debitTx: Transaction; creditTx: Transaction }> => {
  const response = await apiClient.post<ApiResponse<TransferApiResponse>>(
    API_ENDPOINTS.TRANSACTIONS.TRANSFER,
    {
      fromAccountId: payload.fromAccountId,
      toAccountId: payload.toAccountId,
      amount: payload.amount,
      referenceId: payload.referenceId,
      description: payload.description,
    },
  );

  const debitTx = mapRawTransactionToTransaction(response.data.data.fromTransaction, 0);
  const creditTx = mapRawTransactionToTransaction(response.data.data.toTransaction, 1);

  const transfer: Transfer = {
    id: `trf-${debitTx.id}`,
    dateTime: debitTx.dateTime,
    fromAccountId: debitTx.accountId,
    fromAccountName: debitTx.accountName.replace(" Account", ""),
    fromAccountCode: debitTx.account?.accountNumber || "ACC",
    fromAccountInitial: debitTx.accountInitial || "A",
    fromAccountColor: debitTx.accountColor || "blue",
    toAccountId: creditTx.accountId,
    toAccountName: creditTx.accountName.replace(" Account", ""),
    toAccountCode: creditTx.account?.accountNumber || "ACC",
    toAccountInitial: creditTx.accountInitial || "B",
    toAccountColor: creditTx.accountColor || "emerald",
    amount: debitTx.amount,
    referenceId: debitTx.referenceId,
    description: payload.description || `Transfer to ${creditTx.accountName}`,
  };

  return { transfer, debitTx, creditTx };
};
