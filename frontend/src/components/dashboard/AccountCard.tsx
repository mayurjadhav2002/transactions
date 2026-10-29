import { useState, type MouseEvent } from "react";
import { MoreVertical, ExternalLink, Copy, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatINR } from "@/lib/formatters";
import type { Account } from "@/types";
import { cn } from "@/lib/utils";

interface AccountCardProps {
  account: Account;
  onSelect?: (account: Account) => void;
}

export const AccountCard = ({ account, onSelect }: AccountCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const colorStyles: Record<string, string> = {
    blue: "bg-blue-600",
    emerald: "bg-emerald-600",
    violet: "bg-violet-600",
    amber: "bg-amber-600",
  };

  const copyCode = (e: MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(account.code);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setMenuOpen(false);
    }, 1200);
  };

  return (
    <Card className="p-4 sm:p-5 relative hover:border-slate-300 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex size-9 items-center justify-center rounded-full text-white font-semibold text-sm shadow-xs shrink-0",
              (colorStyles && colorStyles[account?.color]) || "bg-blue-600",
            )}
          >
            {account.avatarLetter}
          </div>

          <div>
            <h4 className="font-semibold text-sm text-slate-900 leading-tight">
              {account.name}
            </h4>
            <span className="text-xs text-slate-400">{account.code}</span>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-md p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <MoreVertical className="size-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1 w-36 rounded-lg border border-slate-200 bg-white py-1 shadow-md z-20 text-xs">
              <button
                onClick={copyCode}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50 text-left"
              >
                {copied ? (
                  <Check className="size-3.5 text-emerald-600" />
                ) : (
                  <Copy className="size-3.5 text-slate-400" />
                )}
                {copied ? "Copied!" : "Copy Code"}
              </button>
              {onSelect && (
                <button
                  onClick={() => {
                    onSelect(account);
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50 text-left"
                >
                  <ExternalLink className="size-3.5 text-slate-400" /> Use in
                  Form
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="text-lg font-bold tracking-tight text-slate-900">
          {formatINR(account.balance)}
        </div>
        <div className="mt-1 text-xs text-slate-400">
          Created {account.createdAt}
        </div>
      </div>
    </Card>
  );
};
