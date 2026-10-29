import { useState } from "react";
import { MoreVertical, Copy, Check } from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatINR, formatSignedINR } from "@/lib/formatters";
import type { Transaction, AccountColor } from "@/types";
import { cn } from "@/lib/utils";

interface TransactionTableRowProps {
  transaction: Transaction;
}

export const TransactionTableRow = ({
  transaction,
}: TransactionTableRowProps) => {
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

  const parts = transaction.dateTime.split(" ");
  const datePart = parts.slice(0, 3).join(" ");
  const timePart = parts.slice(3).join(" ");
  const signed = formatSignedINR(transaction.amount, transaction.type);

  const initial =
    transaction.accountInitial ||
    transaction.accountName.charAt(0).toUpperCase() ||
    "A";
  const color = transaction.accountColor || "blue";

  const handleCopyRef = () => {
    navigator.clipboard.writeText(transaction.referenceId);
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
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex size-6 items-center justify-center rounded-full text-white font-semibold text-[11px] shadow-2xs shrink-0",
              avatarColorMap[color] || "bg-blue-600"
            )}
          >
            {initial}
          </div>
          <span className="font-medium text-slate-800">
            {transaction.accountName}
          </span>
        </div>
      </TableCell>

      <TableCell className="py-3.5 px-4 whitespace-nowrap">
        <Badge
          variant={transaction.type === "credit" ? "credit" : "debit"}
          className="capitalize font-medium px-2.5 py-0.5 text-xs"
        >
          {transaction.type === "credit" ? "Credit" : "Debit"}
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
        {transaction.referenceId}
      </TableCell>

      <TableCell className="py-3.5 px-4 whitespace-nowrap text-slate-800 max-w-[200px] truncate">
        {transaction.description}
      </TableCell>

      <TableCell className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-800">
        {formatINR(transaction.balance)}
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
