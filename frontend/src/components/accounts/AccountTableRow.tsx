import { useState } from "react";
import { MoreVertical, Copy, Check } from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/table";
import { formatINR } from "@/lib/formatters";
import type { Account } from "@/types";
import { cn } from "@/lib/utils";

interface AccountTableRowProps {
  index: number;
  account: Account;
  onViewDetails: (account: Account) => void;
}

export const AccountTableRow = ({
  index,
  account,
  onViewDetails,
}: AccountTableRowProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const avatarColorMap: Record<Account["color"], string> = {
    blue: "bg-blue-600",
    emerald: "bg-emerald-600",
    violet: "bg-violet-600",
    orange: "bg-orange-500",
    pink: "bg-pink-500",
    amber: "bg-amber-500",
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(account.code);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setMenuOpen(false);
    }, 1200);
  };

  return (
    <TableRow className="hover:bg-slate-50/70 transition-colors text-slate-700 text-xs">
      <TableCell className="py-4 px-5 whitespace-nowrap text-slate-500 font-medium">
        {index}
      </TableCell>

      <TableCell className="py-4 px-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex size-9 items-center justify-center rounded-full text-white font-semibold text-sm shadow-xs shrink-0",
              avatarColorMap[account.color] || "bg-blue-600"
            )}
          >
            {account.avatarLetter}
          </div>
          <div>
            <div className="font-semibold text-slate-900 leading-tight">
              {account.name}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {account.code}
            </div>
          </div>
        </div>
      </TableCell>

      <TableCell className="py-4 px-4 whitespace-nowrap font-bold text-slate-900">
        {formatINR(account.balance)}
      </TableCell>

      <TableCell className="py-4 px-4 whitespace-nowrap">
        <div className="font-medium text-slate-800">
          {account.createdAtDate || account.createdAt}
        </div>
        <div className="text-[11px] text-slate-400">
          {account.createdAtTime || "12:00 PM"}
        </div>
      </TableCell>

      <TableCell className="py-4 px-4 whitespace-nowrap text-slate-600 font-medium">
        {account.transactionCount ?? 0}
      </TableCell>

      <TableCell className="py-4 px-5 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-2 relative">
          <button
            onClick={() => onViewDetails(account)}
            className="rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium px-3 py-1.5 text-xs transition-colors cursor-pointer"
          >
            View Details
          </button>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-md p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <MoreVertical className="size-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-9 w-36 rounded-lg border border-slate-200 bg-white py-1 shadow-md z-30 text-xs text-left">
              <button
                onClick={handleCopyCode}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                {copied ? (
                  <Check className="size-3.5 text-emerald-600" />
                ) : (
                  <Copy className="size-3.5 text-slate-400" />
                )}
                <span>{copied ? "Copied" : "Copy Code"}</span>
              </button>
            </div>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};
