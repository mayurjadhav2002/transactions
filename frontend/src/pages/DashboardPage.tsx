import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  ChevronDown,
  Plus,
  CreditCard,
  Coins,
  ArrowUpRight,
  ArrowDown,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { AccountCard } from "@/components/dashboard/AccountCard";
import { RecentTransactionsTable } from "@/components/dashboard/RecentTransactionsTable";
import { CreateTransactionCard } from "@/components/dashboard/CreateTransactionCard";
import { CreateAccountModal } from "@/components/dashboard/CreateAccountModal";
import { QueryErrorBanner } from "@/components/common/QueryErrorBanner";
import { SyncIndicator } from "@/components/common/SyncIndicator";
import { Skeleton } from "@/components/ui/skeleton";
import { useFinance } from "@/context/FinanceContext";
import { formatINR, filterTransactions } from "@/lib/formatters";

export const DashboardPage = () => {
  const {
    accounts,
    transactions,
    totalBalance,
    totalCredits,
    totalDebits,
    creditTransactionsCount,
    debitTransactionsCount,
    selectedDateRange,
    setSelectedDateRange,
    searchQuery,
    isLoading,
    isFetching,
    isAccountsLoading,
    isTransactionsLoading,
    isTransactionsFetching,
    isError,
    errorMessage,
    refetchAll,
  } = useFinance();

  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);

  const filteredTransactions = filterTransactions(transactions, searchQuery);

  const datePresets = [
    "Today",
    "Last 7 Days",
    "Oct 1, 2026 - Oct 28, 2026",
    "Last 30 Days",
    "This Quarter",
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Dashboard
            </h1>
            <SyncIndicator isFetching={isFetching && !isLoading} label="Syncing live data..." />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Overview of your accounts and recent transactions
          </p>
        </div>

        <div className="relative self-start sm:self-auto">
          <button
            onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
            className="flex items-center gap-2 rounded-lg border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
          >
            <Calendar className="size-3.5 text-slate-500" />
            <span>{selectedDateRange}</span>
            <ChevronDown className="size-3.5 text-slate-400" />
          </button>

          {dateDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-52 rounded-xl border border-slate-200 bg-white py-1 shadow-lg z-30 text-xs">
              {datePresets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    setSelectedDateRange(preset);
                    setDateDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 transition-colors ${
                    selectedDateRange === preset ? "font-semibold text-blue-600 bg-blue-50/50" : "text-slate-700"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {isError && (
        <QueryErrorBanner
          title="Data Synchronization Error"
          message={errorMessage || "Failed to load financial records from the backend API."}
          onRetry={refetchAll}
          isRetrying={isFetching}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={`stat-skel-${i}`} className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))
        ) : (
          <>
            <StatCard
              title="Total Accounts"
              value={accounts.length.toString()}
              subtext="1 new this month"
              isPositiveTrend={true}
              icon={CreditCard}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-600"
            />
            <StatCard
              title="Total Balance"
              value={formatINR(totalBalance)}
              subtext="12% from last month"
              isPositiveTrend={true}
              icon={Coins}
              iconBgColor="bg-emerald-50"
              iconColor="text-emerald-600"
            />
            <StatCard
              title="Total Credits"
              value={formatINR(totalCredits)}
              subtext={`${creditTransactionsCount || 0} transactions`}
              neutralSubtext={true}
              icon={ArrowUpRight}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-600"
            />
            <StatCard
              title="Total Debits"
              value={formatINR(totalDebits)}
              subtext={`${debitTransactionsCount || 0} transactions`}
              neutralSubtext={true}
              icon={ArrowDown}
              iconBgColor="bg-rose-50"
              iconColor="text-rose-600"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Accounts</h2>
              <div className="flex items-center gap-3">
                <Link
                  to="/accounts"
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                  View all
                </Link>
                <button
                  onClick={() => setAccountModalOpen(true)}
                  className="flex items-center gap-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs font-medium shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  <span>Create Account</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {isAccountsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={`acc-skel-${i}`} className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                ))
              ) : accounts.length === 0 ? (
                <div className="sm:col-span-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-xs text-slate-500">
                  No accounts yet. Click "Create Account" above to get started.
                </div>
              ) : (
                accounts.slice(0, 3).map((account) => (
                  <AccountCard key={account.id} account={account} />
                ))
              )}
            </div>
          </div>

          <RecentTransactionsTable
            transactions={filteredTransactions}
            limit={5}
            showPagination={true}
            viewAllLink="/transactions"
            isLoading={isTransactionsLoading}
            isFetching={isTransactionsFetching}
            isError={isError}
            onRetry={refetchAll}
          />
        </div>

        <div className="lg:col-span-4 sticky top-20">
          <CreateTransactionCard />
        </div>
      </div>

      <CreateAccountModal
        open={accountModalOpen}
        onOpenChange={setAccountModalOpen}
      />
    </div>
  );
};
