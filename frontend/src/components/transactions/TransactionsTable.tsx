import { useState, useMemo } from "react";
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
import type { Transaction, Account } from "@/types";

interface TransactionsTableProps {
  transactions: Transaction[];
  accounts: Account[];
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export const TransactionsTable = ({
  transactions,
  accounts,
  isLoading = false,
  isFetching = false,
  isError = false,
  onRetry,
}: TransactionsTableProps) => {
  const [search, setSearch] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const pageSize = 10;

  const handleClearFilters = () => {
    setSearch("");
    setSelectedAccount("all");
    setSelectedType("all");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matches =
          tx.description.toLowerCase().includes(q) ||
          tx.referenceId.toLowerCase().includes(q) ||
          tx.accountName.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (selectedAccount !== "all") {
        if (tx.accountId !== selectedAccount) return false;
      }

      if (selectedType !== "all") {
        if (tx.type !== selectedType) return false;
      }

      return true;
    });
  }, [transactions, search, selectedAccount, selectedType]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortOrder === "asc") {
        return a.id.localeCompare(b.id);
      }
      return b.id.localeCompare(a.id);
    });
  }, [filtered, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedTransactions = sorted.slice(startIndex, startIndex + pageSize);

  const toggleSort = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="font-bold text-base text-slate-900">All Transactions</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest transactions across all accounts
            </p>
          </div>
          <SyncIndicator isFetching={isFetching && !isLoading} label="Syncing transactions..." />
        </div>

        <div className="relative w-full sm:w-64">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="size-3.5" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search transactions..."
            className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors shadow-2xs"
          />
        </div>
      </div>

      <TransactionsFilterBar
        accounts={accounts}
        selectedAccountId={selectedAccount}
        onSelectAccount={(accId) => {
          setSelectedAccount(accId);
          setCurrentPage(1);
        }}
        selectedType={selectedType}
        onSelectType={(t) => {
          setSelectedType(t);
          setCurrentPage(1);
        }}
        fromDate={fromDate}
        onFromDateChange={setFromDate}
        toDate={toDate}
        onToDateChange={setToDate}
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
            <TableSkeleton columns={8} rows={6} />
          ) : isError ? (
            <TableRow>
              <TableCell colSpan={8} className="py-8 text-center text-rose-500">
                <div className="flex flex-col items-center justify-center gap-2">
                  <span>Unable to fetch transactions from the server.</span>
                  {onRetry && (
                    <Button variant="outline" size="sm" onClick={onRetry}>
                      Try again
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ) : paginatedTransactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-8 text-center text-slate-400">
                No transactions found matching the filter criteria.
              </TableCell>
            </TableRow>
          ) : (
            paginatedTransactions.map((tx) => (
              <TransactionTableRow key={tx.id} transaction={tx} />
            ))
          )}
        </TableBody>
      </Table>

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={startIndex + pageSize}
        totalItems={sorted.length}
        itemName="transactions"
        onPageChange={setCurrentPage}
      />
    </Card>
  );
};
