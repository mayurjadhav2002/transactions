import { useState } from "react";
import { Link } from "react-router-dom";
import { MoreVertical, Copy, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { formatINR, formatSignedINR } from "@/lib/formatters";
import type { Transaction } from "@/types";
import { cn } from "@/lib/utils";

interface RecentTransactionsTableProps {
  transactions: Transaction[];
  showPagination?: boolean;
  limit?: number;
  viewAllLink?: string;
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export const RecentTransactionsTable = ({
  transactions,
  showPagination = true,
  limit = 5,
  viewAllLink = "/transactions",
  isLoading = false,
  isFetching = false,
  isError = false,
  onRetry,
}: RecentTransactionsTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(transactions.length / limit));
  const startIndex = (currentPage - 1) * limit;
  const currentTransactions = transactions.slice(startIndex, startIndex + limit);

  const handleCopyRef = (id: string, refId: string) => {
    navigator.clipboard.writeText(refId);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
      setActiveMenuId(null);
    }, 1200);
  };

  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex items-center justify-between p-5 pb-3">
        <div className="flex items-center gap-2.5">
          <h3 className="font-bold text-base text-slate-900">Recent Transactions</h3>
          <SyncIndicator isFetching={isFetching && !isLoading} label="Syncing..." />
        </div>
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            View all
          </Link>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-b border-slate-100 text-slate-500 font-medium">
            <TableHead className="py-3 px-5">Date & Time</TableHead>
            <TableHead className="py-3 px-4">Account</TableHead>
            <TableHead className="py-3 px-4">Type</TableHead>
            <TableHead className="py-3 px-4">Amount</TableHead>
            <TableHead className="py-3 px-4">Reference ID</TableHead>
            <TableHead className="py-3 px-4">Description</TableHead>
            <TableHead className="py-3 px-4">Balance</TableHead>
            <TableHead className="py-3 px-3 text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableSkeleton columns={8} rows={limit} />
          ) : isError ? (
            <TableRow>
              <TableCell colSpan={8} className="py-8 text-center text-rose-500">
                <div className="flex flex-col items-center justify-center gap-2">
                  <span>Unable to fetch recent transactions.</span>
                  {onRetry && (
                    <Button variant="outline" size="sm" onClick={onRetry}>
                      Try again
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ) : currentTransactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-8 text-center text-slate-400">
                No transactions found.
              </TableCell>
            </TableRow>
          ) : (
            currentTransactions.map((tx) => {
              const parts = tx.dateTime.split(" ");
              const datePart = parts.slice(0, 3).join(" ");
              const timePart = parts.slice(3).join(" ");
              const signed = formatSignedINR(tx.amount, tx.type);

              return (
                <TableRow
                  key={tx.id}
                  className="hover:bg-slate-50/70 transition-colors text-slate-700 group"
                >
                  <TableCell className="py-3.5 px-5 whitespace-nowrap">
                    <div className="font-medium text-slate-900">{datePart}</div>
                    <div className="text-[11px] text-slate-400">{timePart}</div>
                  </TableCell>
                  <TableCell className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-800">
                    {tx.accountName}
                  </TableCell>
                  <TableCell className="py-3.5 px-4 whitespace-nowrap">
                    <Badge
                      variant={tx.type === "credit" ? "credit" : "debit"}
                      className="capitalize"
                    >
                      {tx.type === "credit" ? "Credit" : "Debit"}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={cn(
                      "py-3.5 px-4 whitespace-nowrap font-semibold",
                      signed.isPositive ? "text-emerald-600" : "text-rose-600"
                    )}
                  >
                    {signed.text}
                  </TableCell>
                  <TableCell className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                    {tx.referenceId}
                  </TableCell>
                  <TableCell className="py-3.5 px-4 whitespace-nowrap text-slate-800 max-w-[180px] truncate">
                    {tx.description}
                  </TableCell>
                  <TableCell className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-800">
                    {formatINR(tx.balance)}
                  </TableCell>
                  <TableCell className="py-3.5 px-3 text-right whitespace-nowrap relative">
                    <button
                      onClick={() =>
                        setActiveMenuId(activeMenuId === tx.id ? null : tx.id)
                      }
                      className="rounded-md p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <MoreVertical className="size-4" />
                    </button>

                    {activeMenuId === tx.id && (
                      <div className="absolute right-4 top-10 w-36 rounded-lg border border-slate-200 bg-white py-1 shadow-md z-30 text-xs text-left">
                        <button
                          onClick={() => handleCopyRef(tx.id, tx.referenceId)}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50 cursor-pointer"
                        >
                          {copiedId === tx.id ? (
                            <Check className="size-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="size-3.5 text-slate-400" />
                          )}
                          <span>{copiedId === tx.id ? "Copied" : "Copy Reference"}</span>
                        </button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {showPagination && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={startIndex + limit}
          totalItems={transactions.length}
          itemName="transactions"
          onPageChange={setCurrentPage}
        />
      )}
    </Card>
  );
};
