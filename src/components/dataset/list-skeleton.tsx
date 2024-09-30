import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

export function DatasetListSkeleton() {
  return (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <div className="container mx-auto py-8">
        <Skeleton className="h-10 w-48 mb-8" /> {/* Title skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Skeleton className="h-6 w-6 mr-3" /> {/* File icon skeleton */}
                    <Skeleton className="h-6 w-40" /> {/* Dataset name skeleton */}
                  </span>
                  <Skeleton className="h-4 w-16" /> {/* File type skeleton */}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-4 mr-2" /> {/* Icon skeleton */}
                    <Skeleton className="h-4 w-3/4" /> {/* Description skeleton */}
                  </div>
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-4 mr-2" /> {/* Icon skeleton */}
                    <Skeleton className="h-4 w-1/2" /> {/* Upload date skeleton */}
                  </div>
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-4 mr-2" /> {/* Icon skeleton */}
                    <Skeleton className="h-4 w-2/3" /> {/* Last modified date skeleton */}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Skeleton className="h-4 w-4" /> {/* Tag icon skeleton */}
                    <Skeleton className="h-5 w-16" /> {/* Tag skeleton */}
                    <Skeleton className="h-5 w-16" /> {/* Tag skeleton */}
                    <Skeleton className="h-5 w-16" /> {/* Tag skeleton */}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Skeleton className="h-8 w-20" /> {/* View button skeleton */}
                  <Skeleton className="h-8 w-20" /> {/* Save button skeleton */}
                  <Skeleton className="h-8 w-20" /> {/* Delete button skeleton */}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ScrollArea>
  )
}
