export default function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6" aria-hidden="true">
      <div className="flex flex-col gap-6">
        <div
          className="rounded-2xl p-6"
          style={{
            background: '#EEEEEE',
            border: '1px solid rgba(219,26,26,0.15)',
            boxShadow: '0 4px 32px rgba(26,26,26,0.08)',
          }}
        >
          <div className="skeleton-shimmer rounded-xl h-7 w-2/3 mb-5" />
          <div className="skeleton-shimmer rounded-xl h-12 w-full mb-4" />
          <div className="skeleton-shimmer rounded-xl h-8 w-24 mx-auto mb-4" />
          <div className="skeleton-shimmer rounded-xl h-12 w-full mb-4" />
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="skeleton-shimmer rounded-xl h-10" />
            <div className="skeleton-shimmer rounded-xl h-10" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="skeleton-shimmer rounded-xl h-16" />
            <div className="skeleton-shimmer rounded-xl h-16" />
          </div>
        </div>

        <div
          className="rounded-2xl p-4"
          style={{
            background: '#EEEEEE',
            border: '1px solid rgba(26,26,26,0.10)',
            boxShadow: '0 2px 12px rgba(26,26,26,0.07)',
          }}
        >
          <div className="skeleton-shimmer rounded-xl h-4 w-32 mb-3" />
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="skeleton-shimmer rounded-lg h-6 w-20" />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div
          className="rounded-2xl p-6"
          style={{
            background: '#EEEEEE',
            border: '1px solid rgba(26,26,26,0.09)',
            boxShadow: '0 4px 24px rgba(26,26,26,0.09)',
          }}
        >
          <div className="skeleton-shimmer rounded-xl h-7 w-52 mb-4" />
          <div className="skeleton-shimmer rounded-2xl h-44 w-full" />
        </div>

        <div
          className="rounded-2xl p-6"
          style={{
            background: '#EEEEEE',
            border: '1px solid rgba(26,26,26,0.09)',
            boxShadow: '0 4px 24px rgba(26,26,26,0.09)',
          }}
        >
          <div className="skeleton-shimmer rounded-xl h-7 w-52 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="skeleton-shimmer rounded-2xl h-64" />
            <div className="skeleton-shimmer rounded-2xl h-64" />
          </div>
        </div>
      </div>
    </div>
  );
}
