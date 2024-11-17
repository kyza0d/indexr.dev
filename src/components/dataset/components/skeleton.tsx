import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DatasetSkeleton() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, index) => (
        <Card key={index} className="relative w-full min-h-[205px] flex flex-col justify-between p-6 transition-colors hover:bg-accent/30 border-border">
          {/* File Icon and Title */}
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3 border-t pt-6">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </Card>
      ))}
      <div>
        <Skeleton className="h-4 w-1/2" />
      </div>
    </>
  );
}
