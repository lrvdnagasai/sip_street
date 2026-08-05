import React from 'react';

export default function EmptyState({
  icon = '☕',
  title = 'No Data Found',
  description = 'There are no records matching your request at this time.',
  actionLabel = null,
  onAction = null,
}) {
  return (
    <div className="bg-stone-50/80 border-2 border-dashed border-stone-200 rounded-2xl p-10 text-center flex flex-col items-center justify-center space-y-3 select-none my-4">
      <div className="text-4xl bg-white p-3 rounded-full shadow-xs border border-stone-100">{icon}</div>
      <h3 className="text-base font-bold text-coffee-brown tracking-tight">{title}</h3>
      <p className="text-xs text-stone-600 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 h-10 px-5 rounded-xl bg-coffee-brown hover:bg-amber-900 active:scale-95 text-white font-bold text-xs shadow-xs transition flex items-center space-x-2"
        >
          <span>➕</span>
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
