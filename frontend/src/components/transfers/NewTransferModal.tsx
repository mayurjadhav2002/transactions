import { useState, type FormEvent } from "react";
import { ChevronDown, AlertCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useFinance } from "@/context/FinanceContext";
import { formatINR } from "@/lib/formatters";

interface NewTransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewTransferModal = ({
  open,
  onOpenChange,
}: NewTransferModalProps) => {
  const { accounts, addTransfer, errorMessage, isTransferring } = useFinance();

  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || "");
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || "");
  const [amount, setAmount] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const activeFromId = fromAccountId || accounts[0]?.id || "";
  const activeToId = toAccountId || accounts[1]?.id || "";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (activeFromId === activeToId) {
      setError("Source and destination accounts must be different.");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid positive transfer amount.");
      return;
    }

    const fromAcc = accounts.find((a) => a.id === activeFromId);
    if (!fromAcc) {
      setError("Source account not found.");
      return;
    }

    if (fromAcc.balance < parsedAmount) {
      setError(
        `Insufficient balance in ${fromAcc.name} (${formatINR(fromAcc.balance)}).`
      );
      return;
    }

    const ok = await addTransfer({
      fromAccountId: activeFromId,
      toAccountId: activeToId,
      amount: parsedAmount,
      referenceId: referenceId.trim() || `TRF-${Math.floor(100 + Math.random() * 900)}`,
      description: description.trim() || "Transfer between accounts",
    });

    if (ok) {
      setAmount("");
      setReferenceId("");
      setDescription("");
      setError(null);
      onOpenChange(false);
    } else {
      setError(errorMessage || "Failed to execute transfer. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Create Transfer</DialogTitle>
          <DialogDescription>
            Transfer money securely between your accounts with atomic ledger updates.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-rose-50 p-2.5 text-xs font-medium text-rose-800 border border-rose-200">
            <AlertCircle className="size-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1.5">
              From Account <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={activeFromId}
                onChange={(e) => setFromAccountId(e.target.value)}
                disabled={isTransferring}
                className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 px-3 pr-8 text-xs text-slate-800 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer disabled:opacity-60"
              >
                {accounts.map((acc) => (
                  <option key={`from-${acc.id}`} value={acc.id}>
                    {acc.name} ({formatINR(acc.balance)})
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 size-4 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1.5">
              To Account <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={activeToId}
                onChange={(e) => setToAccountId(e.target.value)}
                disabled={isTransferring}
                className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 px-3 pr-8 text-xs text-slate-800 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer disabled:opacity-60"
              >
                {accounts.map((acc) => (
                  <option key={`to-${acc.id}`} value={acc.id}>
                    {acc.name} ({formatINR(acc.balance)})
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 size-4 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1.5">
              Amount (₹) <span className="text-rose-500">*</span>
            </label>
            <Input
              type="number"
              min="0.01"
              step="any"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isTransferring}
              required
              className="text-xs h-9"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1.5">
              Reference ID <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <Input
              type="text"
              placeholder="Leave empty for auto-generated ID"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              disabled={isTransferring}
              className="text-xs h-9"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1.5">
              Description <span className="text-rose-500">*</span>
            </label>
            <Textarea
              placeholder="Enter transfer description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isTransferring}
              rows={3}
              className="text-xs resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={isTransferring}
              onClick={() => onOpenChange(false)}
              className="px-3.5 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isTransferring || accounts.length < 2}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-4 py-2 text-xs shadow-xs transition-colors cursor-pointer active:translate-y-px"
            >
              {isTransferring && <Loader2 className="size-3.5 animate-spin" />}
              <span>{isTransferring ? "Transferring Funds..." : "Transfer Money"}</span>
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
