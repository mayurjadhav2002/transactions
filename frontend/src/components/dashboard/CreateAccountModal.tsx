import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useFinance } from "@/context/FinanceContext";

interface CreateAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateAccountModal = ({
  open,
  onOpenChange,
}: CreateAccountModalProps) => {
  const { addAccount, errorMessage, isCreatingAccount } = useFinance();
  const [name, setName] = useState("");
  const [initialBalance, setInitialBalance] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please provide an account name.");
      return;
    }

    const bal = initialBalance ? parseFloat(initialBalance) : 0;
    if (isNaN(bal) || bal < 0) {
      setError("Please enter a valid starting balance.");
      return;
    }

    setError(null);

    const ok = await addAccount({
      name: name.trim(),
      initialBalance: bal,
    });

    if (ok) {
      setName("");
      setInitialBalance("");
      setError(null);
      onOpenChange(false);
    } else {
      setError(errorMessage || "Failed to create account. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Create New Account</DialogTitle>
          <DialogDescription>
            Add a new bank or savings account to your portfolio with instant balance ledgering.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="mb-4 rounded-lg bg-rose-50 p-2.5 text-xs font-medium text-rose-700 border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Account Name <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. Current Account, Fixed Deposit"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isCreatingAccount}
              required
              className="text-xs"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Initial Balance (₹)
            </label>
            <Input
              type="number"
              min="0"
              step="any"
              placeholder="0.00"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              disabled={isCreatingAccount}
              className="text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isCreatingAccount}
              className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreatingAccount}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium shadow-xs transition-colors cursor-pointer"
            >
              {isCreatingAccount && <Loader2 className="size-3.5 animate-spin" />}
              <span>{isCreatingAccount ? "Creating Account..." : "Create Account"}</span>
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
