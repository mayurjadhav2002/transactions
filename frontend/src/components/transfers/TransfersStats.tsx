import { ArrowLeftRight, ArrowUpRight, ArrowDown, Repeat } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { formatINR } from "@/lib/formatters";

interface TransfersStatsProps {
  totalTransfers: number;
  totalSent: number;
  totalReceived: number;
}

export const TransfersStats = ({
  totalTransfers,
  totalSent,
  totalReceived,
}: TransfersStatsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Transfers"
        value={totalTransfers.toString()}
        icon={ArrowLeftRight}
        iconBgColor="bg-blue-50"
        iconColor="text-blue-600"
      />

      <StatCard
        title="Total Sent"
        value={formatINR(totalSent)}
        subtext={`${totalTransfers} completed`}
        neutralSubtext={true}
        icon={ArrowUpRight}
        iconBgColor="bg-emerald-50"
        iconColor="text-emerald-600"
      />

      <StatCard
        title="Total Received"
        value={formatINR(totalReceived)}
        subtext={`${totalTransfers} completed`}
        neutralSubtext={true}
        icon={ArrowDown}
        iconBgColor="bg-rose-50"
        iconColor="text-rose-600"
      />

      <StatCard
        title="Net Transfer"
        value={formatINR(Math.abs(totalReceived - totalSent))}
        subtext="Balanced internal ledger"
        neutralSubtext={true}
        icon={Repeat}
        iconBgColor="bg-indigo-50"
        iconColor="text-indigo-600"
      />
    </div>
  );
};
