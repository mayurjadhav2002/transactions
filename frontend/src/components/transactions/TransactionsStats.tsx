import { ArrowLeftRight, ArrowUpRight, ArrowDown, BarChart3 } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { formatINR } from "@/lib/formatters";

interface TransactionsStatsProps {
  totalTransactions: number;
  totalCredits: number;
  totalDebits: number;
  creditTransactionsCount: number;
  debitTransactionsCount: number;
}

export const TransactionsStats = ({
  totalTransactions,
  totalCredits,
  totalDebits,
  creditTransactionsCount,
  debitTransactionsCount,
}: TransactionsStatsProps) => {
  const netFlow = totalCredits - totalDebits;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Transactions"
        value={totalTransactions.toString()}
        icon={ArrowLeftRight}
        iconBgColor="bg-blue-50"
        iconColor="text-blue-600"
      />

      <StatCard
        title="Total Credits"
        value={formatINR(totalCredits)}
        subtext={`${creditTransactionsCount} transactions`}
        neutralSubtext={true}
        icon={ArrowUpRight}
        iconBgColor="bg-emerald-50"
        iconColor="text-emerald-600"
      />

      <StatCard
        title="Total Debits"
        value={formatINR(totalDebits)}
        subtext={`${debitTransactionsCount} transactions`}
        neutralSubtext={true}
        icon={ArrowDown}
        iconBgColor="bg-rose-50"
        iconColor="text-rose-600"
      />

      <StatCard
        title="Net Flow"
        value={`${netFlow >= 0 ? "+" : ""}${formatINR(netFlow)}`}
        subtext="Credits - Debits"
        neutralSubtext={true}
        icon={BarChart3}
        iconBgColor="bg-indigo-50"
        iconColor="text-indigo-600"
      />
    </div>
  );
};
