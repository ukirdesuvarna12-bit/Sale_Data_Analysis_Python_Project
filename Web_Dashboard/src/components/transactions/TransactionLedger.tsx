import React, { useState } from 'react';
import { Transaction } from '../../types/sales';
import { Download, Search, CheckCircle2, Clock, AlertTriangle, ArrowUpDown, Filter } from 'lucide-react';

interface TransactionLedgerProps {
  transactions: Transaction[];
  onExportCsv: () => void;
}

export const TransactionLedger: React.FC<TransactionLedgerProps> = ({
  transactions,
  onExportCsv,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'settled' | 'processing' | 'pending'>('all');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortAsc, setSortAsc] = useState(false);

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.account.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.repName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tx.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (sortField === 'amount') {
      return sortAsc ? a.amount - b.amount : b.amount - a.amount;
    }
    return sortAsc ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date);
  });

  const totalFilteredAmount = filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0);

  const getStatusDisplay = (status: Transaction['paymentStatus']) => {
    switch (status) {
      case 'settled':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Settled
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            Processing
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Pending Net-30
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-rose-400">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Failed
          </span>
        );
    }
  };

  return (
    <div className="bg-[#121926] border border-slate-800/80 rounded-lg p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight">Revenue & Transaction Audit Ledger</h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
            <span>Executed contracts</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Accounts receivable</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Settlement verification</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-md transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* Ledger Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/60 text-xs">
        {/* Status Filter Segmented Buttons */}
        <div className="flex items-center gap-1 bg-[#0b0f17] p-1 rounded-md border border-slate-800">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 font-medium rounded transition-colors ${
              statusFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Logs
          </button>
          <button
            onClick={() => setStatusFilter('settled')}
            className={`px-2.5 py-1 font-medium rounded transition-colors ${
              statusFilter === 'settled' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Settled
          </button>
          <button
            onClick={() => setStatusFilter('processing')}
            className={`px-2.5 py-1 font-medium rounded transition-colors ${
              statusFilter === 'processing' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Processing
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice, account, or rep..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0b0f17] border border-slate-800 rounded pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
          />
        </div>
      </div>

      {/* High-Density Data Grid */}
      <div className="overflow-x-auto rounded border border-slate-800/80">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#0b0f17] border-b border-slate-800 text-slate-400 select-none">
              <th className="py-2.5 px-3 font-semibold text-slate-300">Invoice ID</th>
              <th className="py-2.5 px-3 font-semibold text-slate-300">Account</th>
              <th className="py-2.5 px-3 font-semibold text-slate-300">Product Line</th>
              <th className="py-2.5 px-3 font-semibold text-slate-300">Account Executive</th>
              <th className="py-2.5 px-3 font-semibold text-slate-300">Region</th>
              <th
                onClick={() => {
                  setSortField('date');
                  setSortAsc(!sortAsc);
                }}
                className="py-2.5 px-3 font-semibold text-slate-300 cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Execution Date</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 font-semibold text-slate-300">Status</th>
              <th
                onClick={() => {
                  setSortField('amount');
                  setSortAsc(!sortAsc);
                }}
                className="py-2.5 px-3 font-semibold text-slate-300 text-right cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Amount (USD)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  No transaction records match the current filter parameters.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="hover:bg-slate-800/40 transition-colors h-[40px]"
                >
                  <td className="py-2 px-3 font-mono text-indigo-400 tabular-nums font-medium">
                    {tx.invoiceNumber}
                  </td>
                  <td className="py-2 px-3 font-semibold text-slate-100">
                    {tx.account}
                  </td>
                  <td className="py-2 px-3 text-slate-300">
                    {tx.productLine}
                  </td>
                  <td className="py-2 px-3 text-slate-400">
                    {tx.repName}
                  </td>
                  <td className="py-2 px-3 text-slate-400">
                    {tx.region}
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-400 tabular-nums">
                    {tx.date}
                  </td>
                  <td className="py-2 px-3">
                    {getStatusDisplay(tx.paymentStatus)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-white tabular-nums">
                    ${tx.amount.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {filteredTransactions.length > 0 && (
            <tfoot>
              <tr className="bg-[#0b0f17] border-t border-slate-800 font-semibold text-xs">
                <td colSpan={7} className="py-2.5 px-3 text-slate-300">
                  Total Reconciled Bookings ({filteredTransactions.length} records)
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400 tabular-nums text-sm">
                  ${totalFilteredAmount.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};
