import { LucideIcon } from "lucide-react";

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="glass-panel rounded-2xl border border-white/8 overflow-hidden">
      <div className="p-4 border-b border-white/8">
        <div className="h-4 w-32 bg-white/8 rounded shimmer" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3 border-b border-white/5">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-3 flex-1 bg-white/5 rounded shimmer" style={{ animationDelay: `${j * 0.05}s` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-panel rounded-2xl p-5 border border-white/8 space-y-3">
          <div className="w-10 h-10 bg-white/8 rounded-xl shimmer" />
          <div className="h-6 w-16 bg-white/8 rounded shimmer" />
          <div className="h-3 w-24 bg-white/5 rounded shimmer" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center mb-4">
        <Icon size={28} className="text-[#444748]" />
      </div>
      <p className="text-[15px] font-medium text-[#8e9192] mb-1">{title}</p>
      {description && <p className="text-[13px] text-[#444748] max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-3">
        <span className="text-red-400 text-xl">!</span>
      </div>
      <p className="text-[14px] text-red-400 mb-1">Failed to load data</p>
      <p className="text-[12px] text-[#8e9192] mb-4">{message}</p>
      {onRetry && (
        <button onClick={onRetry}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[13px] text-[#e5e2e1] hover:bg-white/8 transition-colors">
          Try Again
        </button>
      )}
    </div>
  );
}
