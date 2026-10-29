import { RefreshCw } from "lucide-react";

interface SyncIndicatorProps {
  isFetching?: boolean;
  label?: string;
}

export const SyncIndicator = ({
  isFetching,
  label = "Syncing...",
}: SyncIndicatorProps) => {
  if (!isFetching) return null;

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200/70 text-blue-700 text-[11px] font-medium shadow-2xs animate-fade-in">
      <RefreshCw className="size-3 animate-spin text-blue-600" />
      <span>{label}</span>
    </div>
  );
};
