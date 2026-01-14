// app/loading.tsx
export default function Loading() {
  return (
    <main className="min-h-screen bg-background text-foreground max-w-6xl mx-auto px-4 sm:px-8">
      {/* Header Skeleton */}
      <header className="pt-12 pb-6 sm:pt-20 sm:pb-10 flex flex-col items-center justify-center text-center space-y-4 sm:space-y-6">
        <div className="space-y-4 w-full flex flex-col items-center">
          <div className="w-24 h-4 bg-muted animate-pulse rounded-full opacity-20" />
          <div className="w-48 h-12 bg-muted animate-pulse rounded-2xl opacity-20" />
          <div className="w-64 h-6 bg-muted animate-pulse rounded-full opacity-10" />
        </div>
        <div className="flex items-center gap-4 pt-2">
          <div className="w-32 h-10 bg-muted animate-pulse rounded-full opacity-20" />
          <div className="w-10 h-10 bg-muted animate-pulse rounded-full opacity-20" />
        </div>
      </header>

      {/* Dashboard Skeleton */}
      <div className="flex flex-col lg:flex-row gap-8 pb-24 items-start">
        {/* Left List Skeleton */}
        <div className="w-full lg:flex-1 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-28 w-full bg-card/40 border border-border-subtle rounded-2xl animate-pulse flex flex-col p-5 space-y-3"
            >
              <div className="w-12 h-4 bg-muted rounded-full opacity-20" />
              <div className="w-3/4 h-6 bg-muted rounded-md opacity-20" />
            </div>
          ))}
        </div>

        {/* Right Detail Skeleton */}
        <div className="hidden lg:block w-[450px]">
          <div className="h-[500px] w-full bg-card border border-border-subtle rounded-[2.5rem] animate-pulse p-8 space-y-8">
            <div className="space-y-4">
              <div className="w-full h-10 bg-muted rounded-xl opacity-20" />
              <div className="w-2/3 h-10 bg-muted rounded-xl opacity-20" />
            </div>
            <div className="w-16 h-1 bg-accent/20 rounded-full" />
            <div className="space-y-3">
              <div className="w-full h-4 bg-muted rounded opacity-10" />
              <div className="w-full h-4 bg-muted rounded opacity-10" />
              <div className="w-full h-4 bg-muted rounded opacity-10" />
              <div className="w-4/5 h-4 bg-muted rounded opacity-10" />
            </div>
            <div className="pt-8 space-y-4">
              <div className="w-20 h-4 bg-muted rounded opacity-20" />
              <div className="w-full h-14 bg-muted rounded-2xl opacity-10" />
              <div className="w-full h-14 bg-muted rounded-2xl opacity-10" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
