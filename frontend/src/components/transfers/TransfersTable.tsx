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
import { TransferTableRow } from "./TransferTableRow";
import type { Transfer } from "@/types";

interface TransfersTableProps {
  transfers: Transfer[];
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export const TransfersTable = ({
  transfers,
  isLoading = false,
  isFetching = false,
  isError = false,
  onRetry,
}: TransfersTableProps) => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const pageSize = 10;

  const filtered = useMemo(() => {
    return transfers.filter((t) => {
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matches =
          t.description.toLowerCase().includes(q) ||
          t.referenceId.toLowerCase().includes(q) ||
          t.fromAccountName.toLowerCase().includes(q) ||
          t.toAccountName.toLowerCase().includes(q) ||
          t.fromAccountCode.toLowerCase().includes(q) ||
          t.toAccountCode.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [transfers, search]);

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
  const paginatedTransfers = sorted.slice(startIndex, startIndex + pageSize);

  const toggleSort = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="font-bold text-base text-slate-900">All Transfers</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              View and manage money transfers between your accounts
            </p>
          </div>
          <SyncIndicator isFetching={isFetching && !isLoading} label="Syncing transfers..." />
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
            placeholder="Search transfers..."
            className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors shadow-2xs"
          />
        </div>
      </div>

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
            <TableHead className="py-3 px-4">From Account</TableHead>
            <TableHead className="py-3 px-4">To Account</TableHead>
            <TableHead className="py-3 px-4 cursor-pointer hover:text-slate-800 select-none">
              <div className="flex items-center gap-1">
                <span>Amount</span>
                <ArrowUpDown className="size-3 text-slate-400" />
              </div>
            </TableHead>
            <TableHead className="py-3 px-4">Reference ID</TableHead>
            <TableHead className="py-3 px-4">Description</TableHead>
            <TableHead className="py-3 px-4 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableSkeleton columns={7} rows={4} />
          ) : isError ? (
            <TableRow>
              <TableCell colSpan={7} className="py-8 text-center text-rose-500">
                <div className="flex flex-col items-center justify-center gap-2">
                  <span>Unable to fetch transfers from the server.</span>
                  {onRetry && (
                    <Button variant="outline" size="sm" onClick={onRetry}>
                      Try again
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ) : paginatedTransfers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-8 text-center text-slate-400">
                No transfers found.
              </TableCell>
            </TableRow>
          ) : (
            paginatedTransfers.map((transfer) => (
              <TransferTableRow key={transfer.id} transfer={transfer} />
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
        itemName="transfers"
        onPageChange={setCurrentPage}
      />
    </Card>
  );
};
