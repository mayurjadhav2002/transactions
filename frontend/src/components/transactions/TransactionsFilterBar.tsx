import { ChevronDown, Calendar } from "lucide-react";
import type { Account } from "@/types";

interface TransactionsFilterBarProps {
  accounts: Account[];
  selectedAccountId: string;
  onSelectAccount: (id: string) => void;
  selectedType: string;
  onSelectType: (type: string) => void;
  fromDate: string;
  onFromDateChange: (date: string) => void;
  toDate: string;
  onToDateChange: (date: string) => void;
  onClearFilters: () => void;
}

export const TransactionsFilterBar = ({
  accounts,
  selectedAccountId,
  onSelectAccount,
  selectedType,
  onSelectType,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
  onClearFilters,
}: TransactionsFilterBarProps) => {
  return (
    <div className="p-5 pt-0 pb-4 border-b border-slate-100 flex flex-wrap items-end gap-3 text-xs">
      <div className="flex-1 min-w-[140px] max-w-[180px]">
        <label className="block text-[11px] font-medium text-slate-500 mb-1">
          Account
        </label>
        <div className="relative">
          <select
            value={selectedAccountId}
            onChange={(e) => onSelectAccount(e.target.value)}
            className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Accounts</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-2 size-3.5 text-slate-400" />
        </div>
      </div>

      <div className="flex-1 min-w-[120px] max-w-[150px]">
        <label className="block text-[11px] font-medium text-slate-500 mb-1">
          Type
        </label>
        <div className="relative">
          <select
            value={selectedType}
            onChange={(e) => onSelectType(e.target.value)}
            className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-2 size-3.5 text-slate-400" />
        </div>
      </div>

      <div className="flex-1 min-w-[140px] max-w-[170px]">
        <label className="block text-[11px] font-medium text-slate-500 mb-1">
          From Date
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="dd/mm/yyyy"
            value={fromDate}
            onChange={(e) => onFromDateChange(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs text-slate-800 placeholder:text-slate-400 shadow-2xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <Calendar className="pointer-events-none absolute right-2.5 top-2 size-3.5 text-slate-400" />
        </div>
      </div>

      <div className="flex-1 min-w-[140px] max-w-[170px]">
        <label className="block text-[11px] font-medium text-slate-500 mb-1">
          To Date
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="dd/mm/yyyy"
            value={toDate}
            onChange={(e) => onToDateChange(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs text-slate-800 placeholder:text-slate-400 shadow-2xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <Calendar className="pointer-events-none absolute right-2.5 top-2 size-3.5 text-slate-400" />
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={onClearFilters}
          className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};
