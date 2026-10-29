import type { Account, Transaction, Transfer } from "@/types";

export const calculateTotalBalance = (accounts: Account[]): number => {
  return accounts.reduce((acc, curr) => acc + curr.balance, 0);
};

export interface TransactionMetrics {
  totalCredits: number;
  totalDebits: number;
  creditTransactionsCount: number;
  debitTransactionsCount: number;
}

export const calculateTransactionMetrics = (
  transactions: Transaction[],
): TransactionMetrics => {
  let totalCredits = 0;
  let totalDebits = 0;
  let creditTransactionsCount = 0;
  let debitTransactionsCount = 0;

  for (const tx of transactions) {
    if (tx.type === "credit") {
      totalCredits += tx.amount;
      creditTransactionsCount += 1;
    } else {
      totalDebits += tx.amount;
      debitTransactionsCount += 1;
    }
  }

  return {
    totalCredits,
    totalDebits,
    creditTransactionsCount,
    debitTransactionsCount,
  };
};

export interface TransferMetrics {
  totalTransfersSent: number;
  totalTransfersReceived: number;
}

export const calculateTransferMetrics = (
  transfers: Transfer[],
): TransferMetrics => {
  let sent = 0;
  let received = 0;

  for (const t of transfers) {
    sent += t.amount;
    received += t.amount;
  }

  return {
    totalTransfersSent: sent,
    totalTransfersReceived: received,
  };
};
