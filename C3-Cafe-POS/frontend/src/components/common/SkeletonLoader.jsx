import React from 'react';

export function CardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="bg-stone-200/80 rounded-2xl p-5 h-28 space-y-3">
          <div className="h-4 bg-stone-300 rounded w-1/2"></div>
          <div className="h-8 bg-stone-300 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200 animate-pulse space-y-3">
      <div className="h-10 bg-stone-200 rounded-xl w-full mb-4"></div>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="flex space-x-4 py-2 border-b border-stone-100">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <div key={cIdx} className="h-4 bg-stone-200 rounded flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function GridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="bg-stone-200/80 rounded-2xl p-4 h-32 flex flex-col justify-between">
          <div className="h-4 bg-stone-300 rounded w-2/3"></div>
          <div className="h-6 bg-stone-300 rounded w-1/3 self-end"></div>
        </div>
      ))}
    </div>
  );
}

export default function SkeletonLoader({ type = 'table', count = 5 }) {
  if (type === 'cards') return <CardSkeleton count={count} />;
  if (type === 'grid') return <GridSkeleton count={count} />;
  return <TableSkeleton rows={count} />;
}
