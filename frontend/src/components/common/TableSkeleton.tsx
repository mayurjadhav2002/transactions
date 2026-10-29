import { Skeleton } from "@/components/ui/skeleton";
import { TableRow, TableCell } from "@/components/ui/table";

interface TableSkeletonProps {
  columns: number;
  rows?: number;
}

export const TableSkeleton = ({ columns, rows = 5 }: TableSkeletonProps) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <TableRow key={`skeleton-row-${rIdx}`} className="animate-pulse">
          {Array.from({ length: columns }).map((_, cIdx) => (
            <TableCell key={`skeleton-cell-${rIdx}-${cIdx}`} className="py-4 px-4">
              <Skeleton
                className={`h-4 rounded bg-slate-200/80 ${
                  cIdx === 0
                    ? "w-8"
                    : cIdx === 1
                    ? "w-36"
                    : cIdx === columns - 1
                    ? "w-16 ml-auto"
                    : "w-24"
                }`}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
};
