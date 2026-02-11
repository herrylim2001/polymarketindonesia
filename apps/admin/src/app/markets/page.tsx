'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Eye,
} from 'lucide-react';
import { useAdminStore } from '@/store/adminStore';
import { formatIDR, formatCompactNumber } from '@/lib/utils';
import { CATEGORIES } from '@/types';

export default function MarketsPage() {
  const router = useRouter();
  const { markets, deleteMarket } = useAdminStore();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-dark-800 rounded w-48" />
          <div className="h-12 bg-dark-800 rounded" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-dark-800 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const filteredMarkets = markets.filter((market) => {
    const matchesSearch = market.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || market.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || market.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleDelete = (id: string) => {
    deleteMarket(id);
    setShowDeleteModal(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
            <Clock className="w-3 h-3" />
            Aktif
          </span>
        );
      case 'resolved':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
            <CheckCircle className="w-3 h-3" />
            Resolved
          </span>
        );
      case 'cancelled':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
            <XCircle className="w-3 h-3" />
            Dibatalkan
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Manajemen Markets</h1>
          <p className="text-dark-400 mt-1">Kelola semua prediction markets</p>
        </div>
        <Link
          href="/admin/markets/new"
          className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tambah Market
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-dark-800 rounded-xl border border-dark-700 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              type="text"
              placeholder="Cari market..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-700 border border-dark-600 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-dark-400 focus:outline-none focus:border-primary-500"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none bg-dark-700 border border-dark-600 rounded-lg pl-10 pr-10 py-2.5 text-white focus:outline-none focus:border-primary-500 cursor-pointer"
            >
              <option value="all">Semua Kategori</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none bg-dark-700 border border-dark-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 cursor-pointer"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="resolved">Resolved</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4">
          <p className="text-dark-400 text-sm">Total Markets</p>
          <p className="text-2xl font-bold text-white">{markets.length}</p>
        </div>
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4">
          <p className="text-dark-400 text-sm">Markets Aktif</p>
          <p className="text-2xl font-bold text-green-500">
            {markets.filter((m) => m.status === 'active').length}
          </p>
        </div>
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4">
          <p className="text-dark-400 text-sm">Resolved</p>
          <p className="text-2xl font-bold text-blue-500">
            {markets.filter((m) => m.status === 'resolved').length}
          </p>
        </div>
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4">
          <p className="text-dark-400 text-sm">Total Volume</p>
          <p className="text-2xl font-bold text-primary-400">
            {formatCompactNumber(markets.reduce((sum, m) => sum + m.totalVolume, 0))}
          </p>
        </div>
      </div>

      {/* Markets Table */}
      <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left px-6 py-4 text-dark-400 font-medium text-sm">
                  Market
                </th>
                <th className="text-left px-6 py-4 text-dark-400 font-medium text-sm">
                  Kategori
                </th>
                <th className="text-left px-6 py-4 text-dark-400 font-medium text-sm">
                  Status
                </th>
                <th className="text-right px-6 py-4 text-dark-400 font-medium text-sm">
                  Volume
                </th>
                <th className="text-right px-6 py-4 text-dark-400 font-medium text-sm">
                  Taruhan
                </th>
                <th className="text-left px-6 py-4 text-dark-400 font-medium text-sm">
                  End Date
                </th>
                <th className="text-right px-6 py-4 text-dark-400 font-medium text-sm">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {filteredMarkets.map((market) => {
                const category = CATEGORIES.find((c) => c.id === market.category);
                return (
                  <tr key={market.id} className="hover:bg-dark-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {market.imageUrl && (
                          <img
                            src={market.imageUrl}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="text-white font-medium truncate max-w-xs">
                            {market.title}
                          </p>
                          <p className="text-dark-400 text-sm">
                            {market.outcomes.length} outcomes
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span>{category?.icon}</span>
                        <span className="text-dark-300 text-sm">{category?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(market.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-white font-medium">
                        {formatCompactNumber(market.totalVolume)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-dark-300">{market.totalBets.toLocaleString('id-ID')}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-dark-300 text-sm">
                        {new Date(market.endDate).toLocaleDateString('id-ID')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/market/${market.id}`}
                          className="p-2 text-dark-400 hover:text-white hover:bg-dark-600 rounded-lg transition-colors"
                          title="Lihat"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/markets/${market.id}/edit`}
                          className="p-2 text-dark-400 hover:text-white hover:bg-dark-600 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setShowDeleteModal(market.id)}
                          className="p-2 text-dark-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredMarkets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-dark-400">Tidak ada market ditemukan</p>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/80">
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-2">Hapus Market?</h3>
            <p className="text-dark-400 mb-6">
              Market yang dihapus tidak dapat dikembalikan. Semua data taruhan juga akan hilang.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 px-4 py-2.5 bg-dark-700 hover:bg-dark-600 text-white rounded-lg font-medium transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal)}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
