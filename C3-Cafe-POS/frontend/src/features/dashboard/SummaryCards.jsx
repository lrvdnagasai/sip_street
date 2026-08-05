import React from 'react';

export default function SummaryCards({ summary }) {
  const sales = summary ? parseFloat(summary.total_sales) : 0;
  const orders = summary ? summary.total_orders : 0;
  const avgBill = summary ? parseFloat(summary.average_bill_value) : 0;
  const productsSold = summary ? summary.products_sold : 0;
  const expenses = summary ? parseFloat(summary.todays_expenses || 0) : 0;
  const netSales = summary ? parseFloat(summary.net_sales || sales - expenses) : 0;

  const cards = [
    {
      title: "Today's Sales",
      value: `₹${sales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: '💰',
      bgColor: 'bg-amber-500/10 border-amber-200',
      textColor: 'text-amber-900',
    },
    {
      title: "Today's Expenses",
      value: `₹${expenses.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: '💸',
      bgColor: 'bg-rose-500/10 border-rose-200',
      textColor: 'text-rose-900',
    },
    {
      title: 'Net Sales',
      value: `₹${netSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: '📈',
      bgColor: 'bg-emerald-500/10 border-emerald-200',
      textColor: 'text-emerald-900',
    },
    {
      title: "Today's Orders",
      value: orders.toString(),
      icon: '🛍️',
      bgColor: 'bg-coffee-brown/10 border-amber-900/20',
      textColor: 'text-coffee-brown',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 select-none">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`p-5 rounded-2xl border shadow-xs flex items-center justify-between transition hover:shadow-md ${card.bgColor}`}
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {card.title}
            </span>
            <div className={`text-2xl font-bold font-mono mt-1 ${card.textColor}`}>
              {card.value}
            </div>
          </div>
          <span className="text-3xl p-2 rounded-2xl bg-white/80 shadow-xs">{card.icon}</span>
        </div>
      ))}
    </div>
  );
}
