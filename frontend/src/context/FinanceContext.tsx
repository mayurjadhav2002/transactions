import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";
import type {
  Account,
  Transaction,
  Transfer,
  NewTransactionPayload,
  NewAccountPayload,
  NewTransferPayload,
} from "@/types";
import {
  useAccountsQuery,
  useTransactionsQuery,
  useCreateAccountMutation,
  useCreateTransactionMutation,
  useTransferMutation,
  financeQueryKeys,
} from "@/hooks/useFinanceQueries";
import { queryClient } from "@/lib/queryClient";
import type { FinanceContextType } from "./finance.types";
import {
  calculateTotalBalance,
  calculateTransactionMetrics,
  calculateTransferMetrics,
} from "./finance.calculations";

export type { FinanceContextType };

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider = ({ children }: { children: ReactNode }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDateRange, setSelectedDateRange] = useState(
    "Oct 1, 2026 - Oct 28, 2026",
  );
  const [sessionTransfers, setSessionTransfers] = useState<Transfer[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const accountsQuery = useAccountsQuery({ limit: 100 });
  const transactionsQuery = useTransactionsQuery({ limit: 100 });

  const accounts: Account[] = useMemo(
    () => accountsQuery.data?.accounts || [],
    [accountsQuery.data],
  );

  const transactions: Transaction[] = useMemo(
    () => transactionsQuery.data?.transactions || [],
    [transactionsQuery.data],
  );

  const transfers: Transfer[] = useMemo(() => {
    if (sessionTransfers.length > 0) return sessionTransfers;

    // In our double-entry ledger, an inter-account transfer creates a DEBIT on the sender
    // and a CREDIT (with -CR reference suffix) on the recipient. We link them back up here.
    const pairs: Transfer[] = [];
    const debitMap = new Map<string, Transaction>();

    for (const tx of transactions) {
      if (tx.type === "debit" && tx.description?.toLowerCase().includes("transfer to")) {
        debitMap.set(tx.referenceId, tx);
      }
    }

    for (const tx of transactions) {
      if (tx.type === "credit" && tx.referenceId?.endsWith("-CR")) {
        const baseRef = tx.referenceId.replace(/-CR$/, "");
        const debitTx = debitMap.get(baseRef);
        if (debitTx) {
          pairs.push({
            id: `trf-${debitTx.id}`,
            dateTime: debitTx.dateTime,
            fromAccountId: debitTx.accountId,
            fromAccountName: debitTx.accountName.replace(" Account", ""),
            fromAccountCode: debitTx.account?.accountNumber || "ACC",
            fromAccountInitial: debitTx.accountInitial || "A",
            fromAccountColor: debitTx.accountColor || "blue",
            toAccountId: tx.accountId,
            toAccountName: tx.accountName.replace(" Account", ""),
            toAccountCode: tx.account?.accountNumber || "ACC",
            toAccountInitial: tx.accountInitial || "B",
            toAccountColor: tx.accountColor || "emerald",
            amount: debitTx.amount,
            referenceId: debitTx.referenceId,
            description: debitTx.description,
          });
        }
      }
    }

    return pairs;
  }, [sessionTransfers, transactions]);

  const totalBalance = useMemo(
    () => calculateTotalBalance(accounts),
    [accounts],
  );

  const {
    totalCredits,
    totalDebits,
    creditTransactionsCount,
    debitTransactionsCount,
  } = useMemo(
    () => calculateTransactionMetrics(transactions),
    [transactions],
  );

  const { totalTransfersSent, totalTransfersReceived } = useMemo(
    () => calculateTransferMetrics(transfers),
    [transfers],
  );

  const createAccountMutation = useCreateAccountMutation();
  const createTransactionMutation = useCreateTransactionMutation();
  const transferMutation = useTransferMutation({
    onSuccess: (result) => {
      setSessionTransfers((prev) => [result.transfer, ...prev]);
    },
  });

  const addAccount = useCallback(
    async (payload: NewAccountPayload): Promise<boolean> => {
      setErrorMessage(null);
      try {
        await createAccountMutation.mutateAsync(payload);
        return true;
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { error?: { message?: string } } } })
            ?.response?.data?.error?.message ||
          (err instanceof Error ? err.message : "Failed to create account");
        setErrorMessage(message);
        return false;
      }
    },
    [createAccountMutation],
  );

  const addTransaction = useCallback(
    async (payload: NewTransactionPayload): Promise<boolean> => {
      setErrorMessage(null);
      try {
        await createTransactionMutation.mutateAsync(payload);
        return true;
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { error?: { message?: string } } } })
            ?.response?.data?.error?.message ||
          (err instanceof Error ? err.message : "Failed to execute transaction");
        setErrorMessage(message);
        return false;
      }
    },
    [createTransactionMutation],
  );

  const addTransfer = useCallback(
    async (payload: NewTransferPayload): Promise<boolean> => {
      setErrorMessage(null);
      try {
        await transferMutation.mutateAsync(payload);
        return true;
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { error?: { message?: string } } } })
            ?.response?.data?.error?.message ||
          (err instanceof Error ? err.message : "Failed to execute transfer");
        setErrorMessage(message);
        return false;
      }
    },
    [transferMutation],
  );

  const isAccountsLoading = accountsQuery.isLoading;
  const isTransactionsLoading = transactionsQuery.isLoading;
  const isLoading = isAccountsLoading || isTransactionsLoading;

  const isAccountsFetching = accountsQuery.isFetching;
  const isTransactionsFetching = transactionsQuery.isFetching;
  const isFetching = isAccountsFetching || isTransactionsFetching;

  const isAccountsError = accountsQuery.isError;
  const isTransactionsError = transactionsQuery.isError;
  const isError = isAccountsError || isTransactionsError;

  const accountsError = accountsQuery.error;
  const transactionsError = transactionsQuery.error;

  const refetchAccounts = useCallback(() => {
    accountsQuery.refetch();
  }, [accountsQuery]);

  const refetchTransactions = useCallback(() => {
    transactionsQuery.refetch();
  }, [transactionsQuery]);

  const refetchAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: financeQueryKeys.accounts.all });
    queryClient.invalidateQueries({ queryKey: financeQueryKeys.transactions.all });
  }, []);

  const contextValue = useMemo<FinanceContextType>(
    () => ({
      accounts,
      transactions,
      transfers,
      searchQuery,
      setSearchQuery,
      selectedDateRange,
      setSelectedDateRange,
      addTransaction,
      addAccount,
      addTransfer,
      totalBalance,
      totalCredits,
      totalDebits,
      totalAccountsCount: accounts.length,
      creditTransactionsCount,
      debitTransactionsCount,
      totalTransfersCount: transfers.length,
      totalTransfersSent,
      totalTransfersReceived,
      isLoading,
      isFetching,
      isAccountsLoading,
      isTransactionsLoading,
      isAccountsFetching,
      isTransactionsFetching,
      isError,
      isAccountsError,
      isTransactionsError,
      accountsError,
      transactionsError,
      errorMessage,
      isCreatingAccount: createAccountMutation.isPending,
      isCreatingTransaction: createTransactionMutation.isPending,
      isTransferring: transferMutation.isPending,
      refetchAccounts,
      refetchTransactions,
      refetchAll,
    }),
    [
      accounts,
      transactions,
      transfers,
      searchQuery,
      selectedDateRange,
      addTransaction,
      addAccount,
      addTransfer,
      totalBalance,
      totalCredits,
      totalDebits,
      creditTransactionsCount,
      debitTransactionsCount,
      totalTransfersSent,
      totalTransfersReceived,
      isLoading,
      isFetching,
      isAccountsLoading,
      isTransactionsLoading,
      isAccountsFetching,
      isTransactionsFetching,
      isError,
      isAccountsError,
      isTransactionsError,
      accountsError,
      transactionsError,
      errorMessage,
      createAccountMutation.isPending,
      createTransactionMutation.isPending,
      transferMutation.isPending,
      refetchAccounts,
      refetchTransactions,
      refetchAll,
    ],
  );

  return (
    <FinanceContext.Provider value={contextValue}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = (): FinanceContextType => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
};
