import { useState, useEffect } from "react";
import { Search, ArrowUpDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { TablePagination } from "@/components/common/TablePagination";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { SyncIndicator } from "@/components/common/SyncIndicator";
import { Button } from "@/components/ui/button";
import { TransactionsFilterBar } from "./TransactionsFilterBar";
import { TransactionTableRow } from "./TransactionTableRow";
import { useTransactionsQuery } from "@/hooks/useFinanceQueries";
import type { Account } from "@/types";

interface TransactionsTableProps {
  accounts: Account[];
  onTotalCountChange?: (total: number) => void;
}

export const TransactionsTable = ({
  accounts,
  onTotalCountChange,
}: TransactionsTableProps) => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const pageSize = 10;

  // Debounce search query before sending to backend
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Query backend with pagination and all filter parameters
  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useTransactionsQuery({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch || undefined,
    accountId: selectedAccount !== "all" ? selectedAccount : undefined,
    type:
      selectedType !== "all"
        ? (selectedType.toUpperCase() as "CREDIT" | "DEBIT")
        : undefined,
    startDate: fromDate || undefined,
    endDate: toDate || undefined,
  });

  const transactions = data?.transactions ?? [];
  const meta = data?.meta;

  const total = meta?.total ?? 0;
  const totalPages =
    meta?.totalPages ?? Math.max(1, Math.ceil(total / pageSize));
  const startIndex = meta?.skip ?? (currentPage - 1) * pageSize;
  const endIndex = startIndex + transactions.length;

  useEffect(() => {
    onTotalCountChange?.(total);
  }, [total, onTotalCountChange]);

  const handleClearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setSelectedAccount("all");
    setSelectedType("all");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  const handleSelectAccount = (accId: string) => {
    setSelectedAccount(accId);
    setCurrentPage(1);
  };

  const handleSelectType = (t: string) => {
    setSelectedType(t);
    setCurrentPage(1);
  };

  const handleFromDateChange = (date: string) => {
    setFromDate(date);
    setCurrentPage(1);
  };

  const handleToDateChange = (date: string) => {
    setToDate(date);
    setCurrentPage(1);
  };

  const toggleSort = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  const displayedTransactions =
    sortOrder === "asc" ? [...transactions].reverse() : transactions;

  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="font-bold text-base text-slate-900">All Transactions</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {total > 0
                ? `Showing ${startIndex + 1}–${Math.min(endIndex, total)} of ${total} transactions (max 10 per page)`
                : "No transactions found"}
            </p>
          </div>
          <SyncIndicator
            isFetching={isFetching && !isLoading}
            label="Syncing with ledger..."
          />
        </div>

        <div className="relative w-full sm:w-64">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="size-3.5" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reference, account, note..."
            className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors shadow-2xs"
          />
        </div>
      </div>

      <TransactionsFilterBar
        accounts={accounts}
        selectedAccountId={selectedAccount}
        onSelectAccount={handleSelectAccount}
        selectedType={selectedType}
        onSelectType={handleSelectType}
        fromDate={fromDate}
        onFromDateChange={handleFromDateChange}
        toDate={toDate}
        onToDateChange={handleToDateChange}
        onClearFilters={handleClearFilters}
      />

      <Table>
        <TableHeader>
          <TableRow className="border-b border-slate-100 text-slate-500 font-medium">
            <TableHead
              onClick={toggleSort}
              className="py-3 px-5 whitespace-nowrap cursor-pointer hover:text-slate-800 select-none"
            >
              <div className="flex items-center gap-1">
                <span>Date & Time</span>
                <ArrowUpDown className="size-3 text-slate-400" />
              </div>
            </TableHead>
            <TableHead className="py-3 px-4">Account</TableHead>
            <TableHead className="py-3 px-4">Type</TableHead>
            <TableHead className="py-3 px-4">Amount</TableHead>
            <TableHead className="py-3 px-4">Reference ID</TableHead>
            <TableHead className="py-3 px-4">Description</TableHead>
            <TableHead className="py-3 px-4">Balance</TableHead>
            <TableHead className="py-3 px-4 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableSkeleton columns={8} rows={pageSize} />
          ) : isError ? (
            <TableRow>
              <TableCell colSpan={8} className="py-8 text-center text-rose-500">
                <div className="flex flex-col items-center justify-center gap-2">
                  <span>Unable to fetch transactions from backend service.</span>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    Try again
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ) : displayedTransactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-8 text-center text-slate-400">
                No transactions found matching your criteria.
              </TableCell>
            </TableRow>
          ) : (
            displayedTransactions.map((tx) => (
              <TransactionTableRow key={tx.id} transaction={tx} />
            ))
          )}
        </TableBody>
      </Table>

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={endIndex}
        totalItems={total}
        itemName="transactions"
        onPageChange={setCurrentPage}
      />
    </Card>
  );
};
