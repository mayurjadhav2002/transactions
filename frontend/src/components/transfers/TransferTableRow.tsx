import { useState } from "react";
import { ArrowRight, MoreVertical, Copy, Check } from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/table";
import { formatINR } from "@/lib/formatters";
import type { Transfer, AccountColor } from "@/types";
import { cn } from "@/lib/utils";

interface TransferTableRowProps {
  transfer: Transfer;
}

export const TransferTableRow = ({ transfer }: TransferTableRowProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const avatarColorMap: Record<AccountColor, string> = {
    blue: "bg-blue-600",
    emerald: "bg-emerald-600",
    violet: "bg-violet-600",
    orange: "bg-orange-500",
    pink: "bg-pink-500",
    amber: "bg-amber-500",
  };

  const parts = transfer.dateTime.split(" ");
  const datePart = parts.slice(0, 3).join(" ");
  const timePart = parts.slice(3).join(" ");

  const handleCopyRef = () => {
    navigator.clipboard.writeText(transfer.referenceId);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setMenuOpen(false);
    }, 1200);
  };

  return (
    <TableRow className="hover:bg-slate-50/70 transition-colors text-slate-700 text-xs group">
      <TableCell className="py-3.5 px-5 whitespace-nowrap">
        <div className="font-medium text-slate-900">{datePart}</div>
        <div className="text-[11px] text-slate-400">{timePart}</div>
      </TableCell>

      <TableCell className="py-3.5 px-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex size-6 items-center justify-center rounded-full text-white font-semibold text-[11px] shadow-2xs shrink-0",
                avatarColorMap[transfer.fromAccountColor] || "bg-blue-600"
              )}
            >
              {transfer.fromAccountInitial}
            </div>
            <div>
              <div className="font-medium text-slate-800">
                {transfer.fromAccountName}
              </div>
              <div className="text-[10px] text-slate-400">
                {transfer.fromAccountCode}
              </div>
            </div>
          </div>

          <ArrowRight className="size-3.5 text-slate-400 shrink-0" />
        </div>
      </TableCell>

      <TableCell className="py-3.5 px-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex size-6 items-center justify-center rounded-full text-white font-semibold text-[11px] shadow-2xs shrink-0",
              avatarColorMap[transfer.toAccountColor] || "bg-emerald-600"
            )}
          >
            {transfer.toAccountInitial}
          </div>
          <div>
            <div className="font-medium text-slate-800">
              {transfer.toAccountName}
            </div>
            <div className="text-[10px] text-slate-400">
              {transfer.toAccountCode}
            </div>
          </div>
        </div>
      </TableCell>

      <TableCell className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-900">
        {formatINR(transfer.amount)}
      </TableCell>

      <TableCell className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-mono text-[11px]">
        {transfer.referenceId}
      </TableCell>

      <TableCell className="py-3.5 px-4 whitespace-nowrap text-slate-800 max-w-[220px] truncate">
        {transfer.description}
      </TableCell>

      <TableCell className="py-3.5 px-4 text-right whitespace-nowrap relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-md p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <MoreVertical className="size-4" />
        </button>

        {menuOpen && (
          <div className="absolute right-3 top-9 w-36 rounded-lg border border-slate-200 bg-white py-1 shadow-md z-30 text-xs text-left">
            <button
              onClick={handleCopyRef}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              {copied ? (
                <Check className="size-3.5 text-emerald-600" />
              ) : (
                <Copy className="size-3.5 text-slate-400" />
              )}
              <span>{copied ? "Copied" : "Copy Ref ID"}</span>
            </button>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
};
