import type {
  Account,
  Transaction,
  Transfer,
  NewTransactionPayload,
  NewAccountPayload,
  NewTransferPayload,
  AccountColor,
} from "@/types";
import { formatCurrentDateTime } from "@/lib/formatters";

export const ACCOUNT_COLORS: AccountColor[] = [
  "blue",
  "emerald",
  "violet",
  "orange",
  "pink",
  "amber",
];

export const getAccountColor = (index: number): AccountColor => {
  return ACCOUNT_COLORS[index % ACCOUNT_COLORS.length];
};

/**
 * Pure factory: constructs a new Account object.
 */
export const createAccountRecord = (
  payload: NewAccountPayload,
  accountsCount: number,
): Account => {
  const color = getAccountColor(accountsCount);
  const code = `ACC-00${accountsCount + 1}`;
  const avatarLetter = payload.name.trim().charAt(0).toUpperCase() || "A";

  return {
    id: `acc-${Date.now()}`,
    name: payload.name.trim(),
    code,
    balance: payload.initialBalance,
    createdAtDate: "Today",
    createdAtTime: "Just now",
    createdAt: "Today",
    avatarLetter,
    color,
    transactionCount: payload.initialBalance > 0 ? 1 : 0,
  };
};

/**
 * Pure factory: creates an initial deposit transaction when an account is opened with a non-zero balance.
 */
export const createInitialDepositTransaction = (
  account: Account,
): Transaction => {
  const randomSuffix = Math.floor(100 + Math.random() * 900);

  return {
    id: `tx-init-${Date.now()}`,
    dateTime: formatCurrentDateTime(),
    accountId: account.id,
    accountName: account.name,
    accountInitial: account.avatarLetter,
    accountColor: account.color,
    type: "credit",
    amount: account.balance,
    referenceId: `DEP-${randomSuffix}`,
    description: "Initial Deposit",
    balance: account.balance,
  };
};

/**
 * Pure state transition: updates account balance and transaction count after a transaction.
 */
export const applyTransactionToAccounts = (
  accounts: Account[],
  accountId: string,
  type: "credit" | "debit",
  amount: number,
): { updatedAccounts: Account[]; newBalance: number } => {
  let computedBalance = 0;

  const updatedAccounts = accounts.map((acc) => {
    if (acc.id !== accountId) return acc;

    computedBalance =
      type === "credit" ? acc.balance + amount : acc.balance - amount;

    return {
      ...acc,
      balance: computedBalance,
      transactionCount: (acc.transactionCount || 0) + 1,
    };
  });

  return { updatedAccounts, newBalance: computedBalance };
};

/**
 * Pure factory: builds a Transaction record.
 */
export const buildTransactionRecord = (
  payload: NewTransactionPayload,
  targetAccount: Account,
  balanceAfter: number,
): Transaction => {
  const referenceId =
    payload.referenceId?.trim() ||
    `TX-${Math.floor(100 + Math.random() * 900)}`;

  return {
    id: `tx-${Date.now()}`,
    dateTime: formatCurrentDateTime(),
    accountId: payload.accountId,
    accountName: targetAccount.name,
    accountInitial: targetAccount.avatarLetter,
    accountColor: targetAccount.color,
    type: payload.type,
    amount: payload.amount,
    referenceId,
    description: payload.description?.trim() || "Transaction",
    balance: balanceAfter,
  };
};

export interface TransferValidationResult {
  isValid: boolean;
  fromAccount?: Account;
  toAccount?: Account;
}

/**
 * Validates whether a transfer can proceed.
 */
export const validateTransfer = (
  accounts: Account[],
  payload: NewTransferPayload,
): TransferValidationResult => {
  const fromAccount = accounts.find((a) => a.id === payload.fromAccountId);
  const toAccount = accounts.find((a) => a.id === payload.toAccountId);

  if (!fromAccount || !toAccount || fromAccount.id === toAccount.id) {
    return { isValid: false };
  }

  if (fromAccount.balance < payload.amount) {
    return { isValid: false };
  }

  return { isValid: true, fromAccount, toAccount };
};

export const applyTransferToAccounts = (
  accounts: Account[],
  fromAccountId: string,
  toAccountId: string,
  amount: number,
): Account[] => {
  return accounts.map((acc) => {
    if (acc.id === fromAccountId) {
      return {
        ...acc,
        balance: acc.balance - amount,
        transactionCount: (acc.transactionCount || 0) + 1,
      };
    }
    if (acc.id === toAccountId) {
      return {
        ...acc,
        balance: acc.balance + amount,
        transactionCount: (acc.transactionCount || 0) + 1,
      };
    }
    return acc;
  });
};

/**
 * Pure factory: builds the Transfer record and corresponding debit & credit Transaction records.
 */
export const buildTransferRecords = (
  payload: NewTransferPayload,
  fromAcc: Account,
  toAcc: Account,
  currentTransfersCount: number,
): { transfer: Transfer; debitTx: Transaction; creditTx: Transaction } => {
  const timestamp = Date.now();
  const dateTime = formatCurrentDateTime();
  const referenceId =
    payload.referenceId?.trim() || `TRF-00${currentTransfersCount + 1}`;
  const description =
    payload.description?.trim() || "Transfer between accounts";

  const transfer: Transfer = {
    id: `trf-${timestamp}`,
    dateTime,
    fromAccountId: fromAcc.id,
    fromAccountName: fromAcc.name.replace(" Account", ""),
    fromAccountCode: fromAcc.code,
    fromAccountInitial: fromAcc.avatarLetter,
    fromAccountColor: fromAcc.color,
    toAccountId: toAcc.id,
    toAccountName: toAcc.name.replace(" Account", ""),
    toAccountCode: toAcc.code,
    toAccountInitial: toAcc.avatarLetter,
    toAccountColor: toAcc.color,
    amount: payload.amount,
    referenceId,
    description,
  };

  const debitTx: Transaction = {
    id: `tx-${timestamp}-d`,
    dateTime,
    accountId: fromAcc.id,
    accountName: fromAcc.name,
    accountInitial: fromAcc.avatarLetter,
    accountColor: fromAcc.color,
    type: "debit",
    amount: payload.amount,
    referenceId,
    description: `Transfer to ${toAcc.name}`,
    balance: fromAcc.balance - payload.amount,
  };

  const creditTx: Transaction = {
    id: `tx-${timestamp}-c`,
    dateTime,
    accountId: toAcc.id,
    accountName: toAcc.name,
    accountInitial: toAcc.avatarLetter,
    accountColor: toAcc.color,
    type: "credit",
    amount: payload.amount,
    referenceId,
    description: `Transfer from ${fromAcc.name}`,
    balance: toAcc.balance + payload.amount,
  };

  return { transfer, debitTx, creditTx };
};
