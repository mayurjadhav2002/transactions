import type { Transaction } from "@/types";

export const formatINR = (value: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatSignedINR = (
  value: number,
  type: "credit" | "debit",
): { isPositive: boolean; text: string } => {
  const isPositive = type === "credit";
  const formatted = formatINR(value);
  return {
    isPositive,
    text: isPositive ? `+${formatted}` : `-${formatted}`,
  };
};

export const formatCurrentDateTime = (): string => {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${dateStr}, ${timeStr}`;
};

export const filterTransactions = (
  transactions: Transaction[],
  searchQuery?: string,
): Transaction[] => {
  if (!searchQuery?.trim()) return transactions;
  const q = searchQuery.toLowerCase().trim();

  return transactions.filter(
    (tx) =>
      tx.accountName.toLowerCase().includes(q) ||
      tx.referenceId.toLowerCase().includes(q) ||
      tx.description.toLowerCase().includes(q) ||
      tx.amount.toString().includes(q),
  );
};
