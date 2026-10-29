import { useQuery, useMutation, keepPreviousData } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import {
  fetchAccounts,
  fetchAccountById,
  fetchAccountByNumber,
  createAccount as createAccountApi,
  type FetchAccountsParams,
} from "@/api/accounts.api";
import {
  fetchTransactions,
  fetchTransactionById,
  createTransaction as createTransactionApi,
  executeTransfer as executeTransferApi,
  type FetchTransactionsParams,
} from "@/api/transactions.api";
import type {
  Account,
  Transaction,
  Transfer,
  NewAccountPayload,
  NewTransactionPayload,
  NewTransferPayload,
} from "@/types";

export const financeQueryKeys = {
  accounts: {
    all: ["accounts"] as const,
    list: (params?: FetchAccountsParams) => ["accounts", "list", params ?? {}] as const,
    detail: (id: string) => ["accounts", "detail", id] as const,
    byNumber: (accountNumber: string) => ["accounts", "by-number", accountNumber] as const,
  },
  transactions: {
    all: ["transactions"] as const,
    list: (params?: FetchTransactionsParams) => ["transactions", "list", params ?? {}] as const,
    detail: (id: string) => ["transactions", "detail", id] as const,
  },
};

export const useAccountsQuery = (params?: FetchAccountsParams) => {
  return useQuery({
    queryKey: financeQueryKeys.accounts.list(params),
    queryFn: () => fetchAccounts(params),
    placeholderData: keepPreviousData,
  });
};

export const useAccountDetailQuery = (id: string | null | undefined) => {
  return useQuery({
    queryKey: id ? financeQueryKeys.accounts.detail(id) : ["accounts", "detail", "noop"],
    queryFn: () => (id ? fetchAccountById(id) : Promise.reject(new Error("No account ID"))),
    enabled: Boolean(id),
  });
};

export const useAccountByNumberQuery = (accountNumber: string | null | undefined) => {
  return useQuery({
    queryKey: accountNumber ? financeQueryKeys.accounts.byNumber(accountNumber) : ["accounts", "by-number", "noop"],
    queryFn: () => (accountNumber ? fetchAccountByNumber(accountNumber) : Promise.reject(new Error("No account number"))),
    enabled: Boolean(accountNumber),
  });
};

export const useTransactionsQuery = (params?: FetchTransactionsParams) => {
  return useQuery({
    queryKey: financeQueryKeys.transactions.list(params),
    queryFn: () => fetchTransactions(params),
    placeholderData: keepPreviousData,
  });
};

export const useTransactionDetailQuery = (id: string | null | undefined) => {
  return useQuery({
    queryKey: id ? financeQueryKeys.transactions.detail(id) : ["transactions", "detail", "noop"],
    queryFn: () => (id ? fetchTransactionById(id) : Promise.reject(new Error("No transaction ID"))),
    enabled: Boolean(id),
  });
};

export const useCreateAccountMutation = (options?: {
  onSuccess?: (account: Account) => void;
  onError?: (error: unknown) => void;
}) => {
  return useMutation({
    mutationFn: (payload: NewAccountPayload) => createAccountApi(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: financeQueryKeys.accounts.all });
      queryClient.invalidateQueries({ queryKey: financeQueryKeys.transactions.all });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};

export const useCreateTransactionMutation = (options?: {
  onSuccess?: (tx: Transaction) => void;
  onError?: (error: unknown) => void;
}) => {
  return useMutation({
    mutationFn: (payload: NewTransactionPayload) => createTransactionApi(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: financeQueryKeys.accounts.all });
      queryClient.invalidateQueries({ queryKey: financeQueryKeys.transactions.all });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};

export const useTransferMutation = (options?: {
  onSuccess?: (result: { transfer: Transfer; debitTx: Transaction; creditTx: Transaction }) => void;
  onError?: (error: unknown) => void;
}) => {
  return useMutation({
    mutationFn: (payload: NewTransferPayload) => executeTransferApi(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: financeQueryKeys.accounts.all });
      queryClient.invalidateQueries({ queryKey: financeQueryKeys.transactions.all });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};
