import { type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  title: string;
  value: string;
  subtext?: string;
  isPositiveTrend?: boolean;
  neutralSubtext?: boolean;
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  className?: string;
}

export const StatCard = ({
  title,
  value,
  subtext,
  isPositiveTrend = false,
  neutralSubtext = false,
  icon: Icon,
  iconBgColor,
  iconColor,
  className,
}: StatCardProps) => {
  return (
    <Card
      className={cn(
        "rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-slate-300 transition-all",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex size-12 sm:size-[52px] shrink-0 items-center justify-center rounded-full transition-transform",
            iconBgColor,
            iconColor
          )}
        >
          <Icon className="size-5 sm:size-5.5" />
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-xs font-medium text-slate-500 leading-none">
            {title}
          </span>
          <div className="text-2xl font-bold tracking-tight text-slate-900 mt-2 leading-none">
            {value}
          </div>
          {subtext && (
            <div
              className={cn(
                "mt-2 text-xs font-medium flex items-center gap-1 leading-none",
                neutralSubtext
                  ? "text-slate-500"
                  : isPositiveTrend
                  ? "text-emerald-600"
                  : "text-slate-500"
              )}
            >
              {isPositiveTrend && <span>↑</span>}
              <span>{subtext}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
