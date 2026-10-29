import { useState, useMemo } from "react";
import { Search } from "lucide-react";
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
import { AccountTableRow } from "./AccountTableRow";
import type { Account } from "@/types";

interface AccountsTableProps {
  accounts: Account[];
  onViewDetails: (account: Account) => void;
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export const AccountsTable = ({
  accounts,
  onViewDetails,
  isLoading = false,
  isFetching = false,
  isError = false,
  onRetry,
}: AccountsTableProps) => {
  const [localSearch, setLocalSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const filteredAccounts = useMemo(() => {
    if (!localSearch.trim()) return accounts;
    const q = localSearch.toLowerCase().trim();
    return accounts.filter(
      (acc) =>
        acc.name.toLowerCase().includes(q) ||
        acc.code.toLowerCase().includes(q),
    );
  }, [accounts, localSearch]);

  const totalPages = Math.ceil(filteredAccounts.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedAccounts = useMemo(
    () => filteredAccounts.slice(startIndex, endIndex),
    [filteredAccounts, startIndex, endIndex],
  );

  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="font-bold text-base text-slate-900">All Accounts</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              View and manage all your accounts
            </p>
          </div>
          <SyncIndicator isFetching={isFetching && !isLoading} label="Syncing accounts..." />
        </div>

        <div className="relative w-full sm:w-64">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="size-3.5" />
          </div>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => {
              setLocalSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search accounts..."
            className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-b border-slate-100 text-slate-500 font-medium">
            <TableHead className="py-3 px-5">#</TableHead>
            <TableHead className="py-3 px-4">Account Name</TableHead>
            <TableHead className="py-3 px-4">Current Balance</TableHead>
            <TableHead className="py-3 px-4">Created At</TableHead>
            <TableHead className="py-3 px-4">Total Transactions</TableHead>
            <TableHead className="py-3 px-5 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableSkeleton columns={6} rows={5} />
          ) : isError ? (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center text-rose-500">
                <div className="flex flex-col items-center justify-center gap-2">
                  <span>Unable to fetch accounts from the server.</span>
                  {onRetry && (
                    <Button variant="outline" size="sm" onClick={onRetry}>
                      Try again
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ) : paginatedAccounts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center text-slate-400">
                No accounts found matching your search.
              </TableCell>
            </TableRow>
          ) : (
            paginatedAccounts.map((account, index) => (
              <AccountTableRow
                key={account.id}
                index={startIndex + index + 1}
                account={account}
                onViewDetails={onViewDetails}
              />
            ))
          )}
        </TableBody>
      </Table>

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={endIndex}
        totalItems={filteredAccounts.length}
        itemName="accounts"
        onPageChange={setCurrentPage}
      />
    </Card>
  );
};
