import { useState, type FormEvent } from "react";
import { ArrowUpRight, ArrowDown, ChevronDown, CheckCircle2, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useFinance } from "@/context/FinanceContext";
import { formatINR } from "@/lib/formatters";
import type { TransactionType } from "@/types";
import { cn } from "@/lib/utils";

export const CreateTransactionCard = () => {
  const { accounts, addTransaction, errorMessage, isCreatingTransaction } = useFinance();

  const [accountId, setAccountId] = useState(accounts[0]?.id || "");
  const [type, setType] = useState<TransactionType>("credit");
  const [amount, setAmount] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const activeAccountId = accountId || accounts[0]?.id || "";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid positive amount.");
      return;
    }

    const selectedAcc = accounts.find((a) => a.id === activeAccountId);
    if (!selectedAcc) {
      setError("Please select a valid account.");
      return;
    }

    if (type === "debit" && selectedAcc.balance < parsedAmount) {
      setError(
        `Insufficient balance in ${selectedAcc.name} (${formatINR(selectedAcc.balance)}).`
      );
      return;
    }

    const ok = await addTransaction({
      accountId: activeAccountId,
      type,
      amount: parsedAmount,
      referenceId: referenceId.trim() || `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      description: description.trim() || (type === "credit" ? "Deposit" : "Payment"),
    });

    if (ok) {
      setSuccessMsg("Transaction created successfully!");
      setAmount("");
      setReferenceId("");
      setDescription("");
      setTimeout(() => setSuccessMsg(null), 3500);
    } else {
      setError(errorMessage || "Failed to create transaction.");
    }
  };

  return (
    <Card className="p-5">
      <h3 className="font-bold text-base text-slate-900 mb-4">Create Transaction</h3>

      {successMsg && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 p-2.5 text-xs font-medium text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-rose-50 p-2.5 text-xs font-medium text-rose-800 border border-rose-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-medium text-slate-700 mb-1.5">
            Account <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <select
              value={activeAccountId}
              onChange={(e) => setAccountId(e.target.value)}
              disabled={isCreatingTransaction || accounts.length === 0}
              className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 px-3 pr-8 text-xs text-slate-800 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer disabled:opacity-60"
            >
              {accounts.length === 0 ? (
                <option value="">No accounts available</option>
              ) : (
                accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({formatINR(acc.balance)})
                  </option>
                ))
              )}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 size-4 text-slate-400" />
          </div>
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-1.5">
            Type <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isCreatingTransaction}
              onClick={() => setType("credit")}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-lg py-2 px-3 border text-xs font-medium transition-colors cursor-pointer",
                type === "credit"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700 font-semibold"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              )}
            >
              <ArrowUpRight className="size-3.5 text-emerald-600" />
              <span>Credit</span>
            </button>
            <button
              type="button"
              disabled={isCreatingTransaction}
              onClick={() => setType("debit")}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-lg py-2 px-3 border text-xs font-medium transition-colors cursor-pointer",
                type === "debit"
                  ? "border-rose-600 bg-rose-50 text-rose-700 font-semibold"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              )}
            >
              <ArrowDown className="size-3.5 text-rose-600" />
              <span>Debit</span>
            </button>
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
            disabled={isCreatingTransaction}
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
            disabled={isCreatingTransaction}
            className="text-xs h-9"
          />
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-1.5">
            Description <span className="text-rose-500">*</span>
          </label>
          <Textarea
            placeholder="Enter transaction description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isCreatingTransaction}
            rows={3}
            className="text-xs resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isCreatingTransaction || accounts.length === 0}
          className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 mt-2 cursor-pointer active:translate-y-px"
        >
          {isCreatingTransaction && <Loader2 className="size-3.5 animate-spin" />}
          <span>{isCreatingTransaction ? "Processing Transaction..." : "Create Transaction"}</span>
        </button>
      </form>
    </Card>
  );
};
