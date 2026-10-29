import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QueryErrorBannerProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const QueryErrorBanner = ({
  title = "Failed to load data",
  message = "An error occurred while fetching information from the financial ledger service.",
  onRetry,
  isRetrying = false,
}: QueryErrorBannerProps) => {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-rose-100 p-2 text-rose-600 shrink-0">
            <AlertTriangle className="size-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-rose-900">{title}</h4>
            <p className="text-xs text-rose-700 mt-0.5">{message}</p>
          </div>
        </div>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            disabled={isRetrying}
            className="border-rose-300 text-rose-800 hover:bg-rose-100/60 bg-white shadow-2xs self-start sm:self-auto"
          >
            <RefreshCw
              className={`size-3.5 mr-1.5 ${isRetrying ? "animate-spin" : ""}`}
            />
            <span>{isRetrying ? "Retrying..." : "Retry"}</span>
          </Button>
        )}
      </div>
    </div>
  );
};
