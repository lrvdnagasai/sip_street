import React from 'react';
import useReportStore from '../../store/reportStore';

export default function ReportFilterBar() {
  const {
    filterType,
    startDate,
    endDate,
    isLoading,
    setFilterType,
    setCustomDates,
    exportCurrentTabToCSV,
    fetchAllReports,
  } = useReportStore();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 select-none print:hidden">
      {/* Date Filter Selector Tabs */}
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
              onChange={(e) => setCustomDates(e.target.value, endDate)}
              className="h-9 px-3 rounded-lg border border-stone-300 text-xs font-medium text-cafe-dark focus:outline-none focus:ring-1 focus:ring-coffee-brown bg-stone-50"
            />
            <span className="text-stone-400 font-bold text-xs">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setCustomDates(startDate, e.target.value)}
              className="h-9 px-3 rounded-lg border border-stone-300 text-xs font-medium text-cafe-dark focus:outline-none focus:ring-1 focus:ring-coffee-brown bg-stone-50"
            />
          </div>
        )}
      </div>

      {/* Export CSV & Print Actions */}
      <div className="flex items-center space-x-3 self-end lg:self-auto">
        <button
          onClick={fetchAllReports}
          disabled={isLoading}
          className="h-9 px-3.5 rounded-xl border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-700 font-bold text-xs transition flex items-center space-x-1 disabled:opacity-50"
        >
          <span className={isLoading ? 'animate-spin' : ''}>🔄</span>
          <span>Refresh</span>
        </button>

        <button
          onClick={exportCurrentTabToCSV}
          className="h-9 px-4 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs transition flex items-center space-x-1.5 shadow-xs"
        >
          <span>📥</span>
          <span>Export CSV</span>
        </button>

        <button
          onClick={handlePrint}
          className="h-9 px-4 rounded-xl bg-stone-800 hover:bg-stone-900 active:scale-95 text-white font-bold text-xs transition flex items-center space-x-1.5 shadow-xs"
        >
          <span>🖨️</span>
          <span>Print Report</span>
        </button>
      </div>
    </div>
  );
}
