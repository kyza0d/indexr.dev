'use client';

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileJson,
  FileSpreadsheet,
  Upload,
  Clock,
  BookOpen,
  Save,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "react-query";
import { useState } from "react";
import { UploadDatasetDialog } from "@/actions/upload/upload-dialog";

function StatCardSkeleton() {
  return (
    <Card >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-7 w-16 mb-1" />
        <Skeleton className="h-3 w-24" />
      </CardContent>
    </Card>
  );
}

function RecentDatasetsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Recent Datasets</CardTitle>
          <Button variant="ghost" asChild>
            <Link href="/datasets" className="flex items-center gap-2">
              View All
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 pr-4">
          {[...Array(7)].map((_, i) => (
            <div className='flex items-center mx-2 px-3 py-4 rounded-lg hover:bg-border/40 transition-colors border' key={i}>
              <Skeleton className="h-8 w-8 mr-3 rounded" />
              <div className='space-y-3'>
                <Skeleton className="h-3 w-40 rounded" />
                <Skeleton className="h-3 w-20 rounded" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Modified Welcome section with null check
function WelcomeSection({
  session,
  onUpload
}: {
  session: any;
  onUpload: () => void;
}) {
  const userName = session?.user?.name || 'User';

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-4xl font-bold mb-2">
          Welcome back, {userName}
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your datasets
        </p>
      </div>
      <Button onClick={onUpload} variant="outline" className="flex items-center gap-2">
        <Upload className="h-4 w-4" />
        Upload Dataset
      </Button>
    </div>
  );
}

// Stats and Recent datasets sections remain the same...
function StatsSection() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Datasets</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">12</div>
          <p className="text-xs text-muted-foreground">
            +2 from last week
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Recent Views</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">24</div>
          <p className="text-xs text-muted-foreground">
            In the last 7 days
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Saved Datasets</CardTitle>
          <Save className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">7</div>
          <p className="text-xs text-muted-foreground">
            From other users
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function RecentDatasetsSection({ data }: { data: any[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Recent Datasets</CardTitle>
          <Button variant="ghost" asChild>
            <Link href="/datasets" className="flex items-center gap-2">
              View All
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data?.map((dataset: any) => (
            <Link
              key={dataset.id}
              href={`/explore/${dataset.id}`}
              className="block mx-2"
            >
              <div className="flex items-center px-3 py-4 rounded-lg hover:bg-border/40 transition-colors">
                {dataset.fileType === 'text/csv' ? (
                  <FileSpreadsheet className="h-6 w-6 mr-3" />
                ) : (
                  <FileJson className="h-6 w-6 mr-3" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {dataset.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Last modified: {new Date(dataset.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Modified main component with proper loading states
export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const { data: recentDatasets, isLoading: isLoadingDatasets } = useQuery(
    ["recentDatasets"],
    () => fetch("/api/datasets/recent?limit=10").then((res) => res.json()),
    {
      enabled: status === "authenticated",
      // Add error handling
      onError: (error) => {
        console.error('Failed to fetch recent datasets:', error);
      }
    }
  );

  // Handle loading state
  if (status === "loading") {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <Skeleton className="h-[4.2em] w-[32em]" />
        <div className="grid gap-4 md:grid-cols-3">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <RecentDatasetsSkeleton />
      </div>
    );
  }

  // Handle unauthenticated state
  if (status === "unauthenticated") {
    redirect('/about');
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <WelcomeSection session={session} onUpload={() => setUploadDialogOpen(true)} />
      <StatsSection />

      {isLoadingDatasets ? <RecentDatasetsSkeleton /> : <RecentDatasetsSection data={recentDatasets || []} />}

      <UploadDatasetDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUploadSuccess={() => { }}
      />
    </div>
  );
}
