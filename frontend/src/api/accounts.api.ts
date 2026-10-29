import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "./index";
import type { Account, ApiResponse, NewAccountPayload, PaginationMeta } from "@/types";
import { getAccountColor } from "@/context/finance.helpers";

export interface RawAccountResponse {
  id: string;
  accountNumber: string;
  name: string;
  balance: string | number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    transactions: number;
  };
}

export const mapRawAccountToAccount = (
  raw: RawAccountResponse,
  index = 0,
): Account => {
  const parsedDate = new Date(raw.createdAt);
  const isValidDate = !isNaN(parsedDate.getTime());

  const createdAtDate = isValidDate
    ? parsedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently";

  const createdAtTime = isValidDate
    ? parsedDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "";

  return {
    id: raw.id,
    name: raw.name,
    code: raw.accountNumber,
    accountNumber: raw.accountNumber,
    balance: typeof raw.balance === "number" ? raw.balance : parseFloat(raw.balance) || 0,
    currency: raw.currency || "INR",
    createdAtDate,
    createdAtTime,
    createdAt: createdAtDate,
    avatarLetter: raw.name?.trim().charAt(0).toUpperCase() || "A",
    color: getAccountColor(index),
    transactionCount: raw._count?.transactions || 0,
  };
};

export interface FetchAccountsParams {
  limit?: number;
  offset?: number;
  search?: string;
}

export const fetchAccounts = async (
  params: FetchAccountsParams = { limit: 50, offset: 0 },
): Promise<{ accounts: Account[]; meta: PaginationMeta }> => {
  const { data } = await apiClient.get<ApiResponse<RawAccountResponse[]>>(
    API_ENDPOINTS.ACCOUNTS.LIST,
    { params },
  );

  const rawList = data.data || [];
  const accounts = rawList.map((raw, idx) =>
    mapRawAccountToAccount(raw, (params.offset || 0) + idx),
  );

  return {
    accounts,
    meta: data.meta || {
      total: accounts.length,
      limit: params.limit || 50,
      offset: params.offset || 0,
    },
  };
};

export const fetchAccountById = async (id: string): Promise<Account> => {
  const { data } = await apiClient.get<ApiResponse<RawAccountResponse>>(
    API_ENDPOINTS.ACCOUNTS.BY_ID(id),
  );
  return mapRawAccountToAccount(data.data);
};

export const fetchAccountByNumber = async (
  accountNumber: string,
): Promise<Account> => {
  const { data } = await apiClient.get<ApiResponse<RawAccountResponse>>(
    API_ENDPOINTS.ACCOUNTS.BY_ACCOUNT_NUMBER(accountNumber),
  );
  return mapRawAccountToAccount(data.data);
};

export const createAccount = async (
  payload: NewAccountPayload,
): Promise<Account> => {
  const response = await apiClient.post<ApiResponse<RawAccountResponse>>(
    API_ENDPOINTS.ACCOUNTS.CREATE,
    {
      name: payload.name,
      initialBalance: payload.initialBalance,
      currency: payload.currency || "INR",
    },
  );
  return mapRawAccountToAccount(response.data.data);
};
