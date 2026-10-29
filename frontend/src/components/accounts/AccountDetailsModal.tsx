import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { formatINR, formatSignedINR } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import type { Account } from "@/types";
import { useFinance } from "@/context/FinanceContext";
import { cn } from "@/lib/utils";

interface AccountDetailsModalProps {
  account: Account | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AccountDetailsModal = ({
  account,
  open,
  onOpenChange,
}: AccountDetailsModalProps) => {
  const { transactions } = useFinance();

  if (!account) return null;

  const accountTransactions = transactions.filter(
    (tx) => tx.accountId === account.id || tx.accountName === account.name
  );

  const avatarColorMap: Record<Account["color"], string> = {
    blue: "bg-blue-600",
    emerald: "bg-emerald-600",
    violet: "bg-violet-600",
    orange: "bg-orange-500",
    pink: "bg-pink-500",
    amber: "bg-amber-500",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-10 items-center justify-center rounded-full text-white font-bold text-base shadow-xs shrink-0",
                avatarColorMap[account.color] || "bg-blue-600"
              )}
            >
              {account.avatarLetter}
            </div>
            <div>
              <DialogTitle>{account.name}</DialogTitle>
              <DialogDescription>{account.code}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3.5 border border-slate-100">
            <div>
              <span className="text-[11px] text-slate-400 font-medium">
                Current Balance
              </span>
              <div className="text-xl font-bold text-slate-900 mt-0.5">
                {formatINR(account.balance)}
              </div>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium">
                Created At
              </span>
              <div className="font-semibold text-slate-800 mt-0.5">
                {account.createdAtDate || account.createdAt}{" "}
                <span className="font-normal text-slate-400">
                  {account.createdAtTime}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-800 mb-2">
              Recent Transactions ({accountTransactions.length})
            </h4>

            {accountTransactions.length === 0 ? (
              <p className="text-slate-400 text-center py-4">
                No transactions recorded for this account.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto rounded-lg border border-slate-100">
                {accountTransactions.map((tx) => {
                  const signed = formatSignedINR(tx.amount, tx.type);
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-2.5 hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <div className="font-medium text-slate-900">
                          {tx.description}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {tx.dateTime} • {tx.referenceId}
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className={`font-semibold ${
                            signed.isPositive ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {signed.text}
                        </div>
                        <Badge
                          variant={tx.type === "credit" ? "credit" : "debit"}
                          className="mt-0.5 scale-90"
                        >
                          {tx.type}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
