import { Calendar } from "lucide-react";

interface TransfersFilterBarProps {
  fromDate: string;
  onFromDateChange: (date: string) => void;
  toDate: string;
  onToDateChange: (date: string) => void;
  onClearFilters: () => void;
}

export const TransfersFilterBar = ({
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
  onClearFilters,
}: TransfersFilterBarProps) => {
  return (
    <div className="p-5 pt-0 pb-4 border-b border-slate-100 flex flex-wrap items-end gap-3 text-xs">
      <div className="flex-1 min-w-[150px] max-w-[200px]">
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

      <div className="flex-1 min-w-[150px] max-w-[200px]">
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
