import { Plus } from "lucide-react";

interface TransfersHeaderProps {
  onNewTransfer: () => void;
}

export const TransfersHeader = ({ onNewTransfer }: TransfersHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Transfers
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Transfer money between your accounts
        </p>
      </div>

      <button
        onClick={onNewTransfer}
        className="flex items-center gap-1.5 self-start sm:self-auto rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 text-xs font-medium shadow-xs transition-colors cursor-pointer active:translate-y-px"
      >
        <Plus className="size-3.5" />
        <span>New Transfer</span>
      </button>
    </div>
  );
};
