import { CreditCard, Coins, ArrowUpRight, ArrowDown } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { formatINR } from "@/lib/formatters";

interface AccountsStatsProps {
  totalAccounts: number;
  totalBalance: number;
  totalCredits: number;
  totalDebits: number;
  creditTransactionsCount: number;
  debitTransactionsCount: number;
}

export const AccountsStats = ({
  totalAccounts,
  totalBalance,
  totalCredits,
  totalDebits,
  creditTransactionsCount,
  debitTransactionsCount,
}: AccountsStatsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Accounts"
        value={totalAccounts.toString()}
        icon={CreditCard}
        iconBgColor="bg-blue-50"
        iconColor="text-blue-600"
      />

      <StatCard
        title="Total Balance"
        value={formatINR(totalBalance)}
        icon={Coins}
        iconBgColor="bg-emerald-50"
        iconColor="text-emerald-600"
      />

      <StatCard
        title="Total Credits"
        value={formatINR(totalCredits)}
        subtext={`${creditTransactionsCount} transactions`}
        neutralSubtext={true}
        icon={ArrowUpRight}
        iconBgColor="bg-blue-50"
        iconColor="text-blue-600"
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
    </div>
  );
};
