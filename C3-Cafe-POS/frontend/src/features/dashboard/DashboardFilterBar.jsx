import React from 'react';
import useDashboardStore from '../../store/dashboardStore';

export default function DashboardFilterBar() {
  const {
    filterType,
    startDate,
    endDate,
    autoRefresh,
    isLoading,
    lastRefreshedAt,
    setFilterType,
    setCustomDates,
    toggleAutoRefresh,
    fetchDashboardData,
  } = useDashboardStore();

  const handleCustomDateChange = (s, e) => {
    setCustomDates(s, e);
  };

  const formattedRefreshedTime = lastRefreshedAt
    ? lastRefreshedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Never';

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 select-none">
      {/* Date Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5">
        {[
          { label: 'Today', key: 'TODAY' },
          { label: 'Yesterday', key: 'YESTERDAY' },
          { label: 'Last 7 Days', key: 'LAST_7_DAYS' },
          { label: 'Last 30 Days', key: 'LAST_30_DAYS' },
          { label: 'Custom Range', key: 'CUSTOM' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterType(tab.key)}
            className={`h-9 px-3.5 rounded-xl font-bold text-xs tracking-wide transition ${
              filterType === tab.key
                ? 'bg-coffee-brown text-white shadow-xs'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            {tab.label}
          </button>
        ))}

        {filterType === 'CUSTOM' && (
          <div className="flex items-center space-x-2 ml-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleCustomDateChange(e.target.value, endDate)}
              className="h-9 px-3 rounded-lg border border-stone-300 text-xs text-cafe-dark font-medium focus:outline-none focus:ring-1 focus:ring-coffee-brown bg-stone-50"
            />
            <span className="text-stone-400 font-bold text-xs">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => handleCustomDateChange(startDate, e.target.value)}
              className="h-9 px-3 rounded-lg border border-stone-300 text-xs text-cafe-dark font-medium focus:outline-none focus:ring-1 focus:ring-coffee-brown bg-stone-50"
            />
          </div>
        )}
      </div>

      {/* Auto Refresh & Manual Refresh Actions */}
      <div className="flex items-center space-x-4 self-end lg:self-auto">
        <div className="flex items-center space-x-2 text-xs text-stone-500 font-mono">
          <label className="flex items-center space-x-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={toggleAutoRefresh}
              className="w-4 h-4 accent-coffee-brown rounded cursor-pointer"
            />
            <span className="font-sans font-semibold text-stone-700">Auto 30s</span>
          </label>
          <span className="text-stone-300">|</span>
          <span>Updated: {formattedRefreshedTime}</span>
        </div>

        <button
          onClick={fetchDashboardData}
          disabled={isLoading}
          className="h-9 px-4 rounded-xl border border-stone-300 bg-stone-50 hover:bg-stone-100 active:scale-95 text-stone-800 font-bold text-xs transition flex items-center space-x-1.5 disabled:opacity-50"
        >
          <span className={isLoading ? 'animate-spin' : ''}>🔄</span>
          <span>Refresh</span>
        </button>
      </div>
    </div>
  );
}
