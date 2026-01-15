'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function LoadingSkeleton() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-green-400">
      {/* Skeleton Header */}
      <header className="sticky top-0 z-50 w-full border-b border-green-800 bg-black/80 backdrop-blur">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex items-center">
            <Skeleton className="h-6 w-6 bg-muted" />
            <Skeleton className="ml-2 h-6 w-32 bg-muted" />
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <Skeleton className="h-8 w-24 bg-muted" />
          </div>
        </div>
      </header>

      {/* Skeleton Tickers - REMOVED */}
      <div className="h-7 py-2"></div>
      <div className="h-6 py-1"></div>


      <main className="flex-grow container py-8 space-y-8">
        <div>
          <div className="mb-6">
            <Skeleton className="h-16 w-3/4 bg-muted" />
            <Skeleton className="h-5 w-1/2 mt-2 bg-muted" />
          </div>

          <div className="mb-6">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-10 w-24 bg-muted" />
              <Skeleton className="h-10 w-36 bg-muted" />
              <Skeleton className="h-10 w-40 bg-muted" />
              <Skeleton className="h-10 w-36 bg-muted" />
            </div>
          </div>

          {/* Skeleton Table */}
          <div className="space-y-2">
            <Skeleton className="h-12 w-full bg-muted" />
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full bg-muted" />
            ))}
          </div>
        </div>
      </main>

      <footer className="container py-6">
        <Skeleton className="h-4 w-1/3 mx-auto bg-muted" />
      </footer>
    </div>
  );
}
