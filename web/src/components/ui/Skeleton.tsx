'use client';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export function Skeleton({ className = '', width, height = '20px' }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width: width || '100%', height }}
      aria-hidden="true"
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="card p-6 space-y-3">
      <Skeleton height="36px" width="60px" />
      <Skeleton height="16px" width="120px" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton height="16px" />
        </td>
      ))}
    </tr>
  );
}
