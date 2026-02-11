'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Download, DollarSign, BarChart3, Activity } from 'lucide-react';
import { useAdminStore } from '@/store/adminStore';
import { formatIDR } from '@/lib/utils';

export default function TransactionsPage() {
  const { transactions } = useAdminStore();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-dark-800 rounded w-48" />
          <div className="h-64 bg-dark-800 rounded-xl" />
        </div>
      </div>
    );
  }

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalVolume = filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const betCount = filteredTransactions.filter((tx) => tx.type === 'bet').length;
  const depositCount = filteredTransactions.filter((tx) => tx.type === 'deposit').length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bet':
        return <BarChart3 className="w-5 h-5 text-blue-500" />;
      case 'deposit':
        return <DollarSign className="w-5 h-5 text-green-500" />;
      case 'withdrawal':
        return <DollarSign className="w-5 h-5 text-orange-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Selesai</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">Pending</span>;
      case 'failed':
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">Gagal</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Transaksi</h1>
          <p className="text-dark-400 mt-1">Riwayat semua transaksi di platform</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-dark-700 hover:bg-dark-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors">
          <Download className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4">
          <p className="text-dark-400 text-sm">Total Transaksi</p>
          <p className="text-2xl font-bold text-white">{filteredTransactions.length}</p>
        </div>
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4">
          <p className="text-dark-400 text-sm">Total Volume</p>
          <p className="text-2xl font-bold text-primary-400">{formatIDR(totalVolume)}</p>
        </div>
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4">
          <p className="text-dark-400 text-sm">Taruhan</p>
          <p className="text-2xl font-bold text-blue-500">{betCount}</p>
        </div>
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4">
          <p className="text-dark-400 text-sm">Deposit</p>
          <p className="text-2xl font-bold text-green-500">{depositCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-dark-800 rounded-xl border border-dark-700 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              type="text"
              placeholder="Cari username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-700 border border-dark-600 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-dark-400 focus:outline-none focus:border-primary-500"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-dark-700 border border-dark-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500"
          >
            <option value="all">Semua Tipe</option>
            <option value="bet">Taruhan</option>
            <option value="deposit">Deposit</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="payout">Payout</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-dark-700 border border-dark-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500"
          >
            <option value="all">Semua Status</option>
            <option value="completed">Selesai</option>
            <option value="pending">Pending</option>
            <option value="failed">Gagal</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left px-6 py-4 text-dark-400 font-medium text-sm">Tipe</th>
                <th className="text-left px-6 py-4 text-dark-400 font-medium text-sm">User</th>
                <th className="text-left px-6 py-4 text-dark-400 font-medium text-sm">Market</th>
                <th className="text-right px-6 py-4 text-dark-400 font-medium text-sm">Jumlah</th>
                <th className="text-left px-6 py-4 text-dark-400 font-medium text-sm">Status</th>
                <th className="text-left px-6 py-4 text-dark-400 font-medium text-sm">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-dark-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-dark-700 rounded-lg flex items-center justify-center">
                        {getTypeIcon(tx.type)}
                      </div>
                      <span className="text-white capitalize">{tx.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white">{tx.username}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-dark-400 text-sm">
                      {tx.marketTitle || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-white font-medium">{formatIDR(tx.amount)}</span>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(tx.status)}</td>
                  <td className="px-6 py-4">
                    <span className="text-dark-400 text-sm">
                      {new Date(tx.timestamp).toLocaleString('id-ID')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-dark-400">Tidak ada transaksi ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
}
