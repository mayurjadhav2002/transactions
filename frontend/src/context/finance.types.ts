import type {
  Account,
  Transaction,
  Transfer,
  NewTransactionPayload,
  NewAccountPayload,
  NewTransferPayload,
} from "@/types";

export interface FinanceContextType {
  accounts: Account[];
  transactions: Transaction[];
  transfers: Transfer[];

  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedDateRange: string;
  setSelectedDateRange: (range: string) => void;

  addTransaction: (payload: NewTransactionPayload) => Promise<boolean>;
  addAccount: (payload: NewAccountPayload) => Promise<boolean>;
  addTransfer: (payload: NewTransferPayload) => Promise<boolean>;

  totalBalance: number;
  totalCredits: number;
  totalDebits: number;
  totalAccountsCount: number;
  creditTransactionsCount: number;
  debitTransactionsCount: number;
  totalTransfersCount: number;
  totalTransfersSent: number;
  totalTransfersReceived: number;

  isLoading: boolean;
  isFetching: boolean;
  isAccountsLoading: boolean;
  isTransactionsLoading: boolean;
  isAccountsFetching: boolean;
  isTransactionsFetching: boolean;
  isError: boolean;
  isAccountsError: boolean;
  isTransactionsError: boolean;
  accountsError: unknown;
  transactionsError: unknown;
  errorMessage: string | null;

  isCreatingAccount: boolean;
  isCreatingTransaction: boolean;
  isTransferring: boolean;

  refetchAccounts: () => void;
  refetchTransactions: () => void;
  refetchAll: () => void;
}
