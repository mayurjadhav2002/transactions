import { ChevronDown, Calendar, RotateCcw } from "lucide-react";
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

const formatDateToYYYYMMDD = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

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
  const hasActiveFilters =
    selectedAccountId !== "all" ||
    selectedType !== "all" ||
    Boolean(fromDate) ||
    Boolean(toDate);

  const handlePresetSelect = (preset: string) => {
    const now = new Date();
    const todayStr = formatDateToYYYYMMDD(now);

    if (preset === "today") {
      onFromDateChange(todayStr);
      onToDateChange(todayStr);
    } else if (preset === "last7") {
      const past = new Date(now);
      past.setDate(past.getDate() - 6);
      onFromDateChange(formatDateToYYYYMMDD(past));
      onToDateChange(todayStr);
    } else if (preset === "last30") {
      const past = new Date(now);
      past.setDate(past.getDate() - 29);
      onFromDateChange(formatDateToYYYYMMDD(past));
      onToDateChange(todayStr);
    } else if (preset === "thisMonth") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      onFromDateChange(formatDateToYYYYMMDD(firstDay));
      onToDateChange(todayStr);
    } else if (preset === "all") {
      onFromDateChange("");
      onToDateChange("");
    }
  };

  // Determine which preset matches the current fromDate / toDate if any
  const getActivePreset = (): string => {
    if (!fromDate && !toDate) return "all";
    const now = new Date();
    const todayStr = formatDateToYYYYMMDD(now);
    if (fromDate === todayStr && toDate === todayStr) return "today";

    const past7 = new Date(now);
    past7.setDate(past7.getDate() - 6);
    if (fromDate === formatDateToYYYYMMDD(past7) && toDate === todayStr) return "last7";

    const past30 = new Date(now);
    past30.setDate(past30.getDate() - 29);
    if (fromDate === formatDateToYYYYMMDD(past30) && toDate === todayStr) return "last30";

    const firstMonthDay = new Date(now.getFullYear(), now.getMonth(), 1);
    if (fromDate === formatDateToYYYYMMDD(firstMonthDay) && toDate === todayStr) return "thisMonth";

    return "custom";
  };

  const activePreset = getActivePreset();

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

      <div className="flex-1 min-w-[120px] max-w-[140px]">
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

      <div className="flex-1 min-w-[130px] max-w-[160px]">
        <label className="block text-[11px] font-medium text-slate-500 mb-1 flex items-center gap-1">
          <Calendar className="size-3 text-slate-400" />
          <span>Date Preset</span>
        </label>
        <div className="relative">
          <select
            value={activePreset}
            onChange={(e) => handlePresetSelect(e.target.value)}
            className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="last7">Last 7 Days</option>
            <option value="last30">Last 30 Days</option>
            <option value="thisMonth">This Month</option>
            {activePreset === "custom" && <option value="custom">Custom Range</option>}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-2 size-3.5 text-slate-400" />
        </div>
      </div>

      <div className="flex-1 min-w-[135px] max-w-[165px]">
        <label className="block text-[11px] font-medium text-slate-500 mb-1">
          From Date
        </label>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => onFromDateChange(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-2.5 text-xs text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
        />
      </div>

      <div className="flex-1 min-w-[135px] max-w-[165px]">
        <label className="block text-[11px] font-medium text-slate-500 mb-1">
          To Date
        </label>
        <input
          type="date"
          value={toDate}
          onChange={(e) => onToDateChange(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-2.5 text-xs text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
        />
      </div>

      <div>
        <button
          type="button"
          onClick={onClearFilters}
          disabled={!hasActiveFilters}
          className={`flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
            hasActiveFilters
              ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100/70"
              : "border-slate-200 bg-white text-slate-400 opacity-60 cursor-default"
          }`}
        >
          <RotateCcw className="size-3" />
          <span>Clear Filters</span>
        </button>
      </div>
    </div>
  );
};
