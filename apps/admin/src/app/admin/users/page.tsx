'use client';

import { useState, useEffect } from 'react';
import {
  Users, Search, Shield, Eye, Ban, MoreVertical,
  UserPlus, Mail, Calendar, Wallet, BarChart3, TrendingUp,
} from 'lucide-react';
import { formatIDR, formatCompactNumber } from '@/lib/utils';

interface PlatformUser {
  id: string;
  username: string;
  email: string;
  balance: number;
  totalBets: number;
  totalProfit: number;
  joinedAt: string;
  status: 'active' | 'suspended' | 'banned';
  lastActive: string;
}

const sampleUsers: PlatformUser[] = [
  { id: 'u1', username: 'Budi Santoso', email: 'budi@email.com', balance: 15000000, totalBets: 47, totalProfit: 3200000, joinedAt: '2025-01-15', status: 'active', lastActive: '2025-02-01' },
  { id: 'u2', username: 'Siti Rahayu', email: 'siti@email.com', balance: 8500000, totalBets: 32, totalProfit: 1800000, joinedAt: '2025-01-18', status: 'active', lastActive: '2025-02-01' },
  { id: 'u3', username: 'Ahmad Fadli', email: 'ahmad@email.com', balance: 22000000, totalBets: 85, totalProfit: 8500000, joinedAt: '2025-01-05', status: 'active', lastActive: '2025-01-31' },
  { id: 'u4', username: 'Dewi Lestari', email: 'dewi@email.com', balance: 5000000, totalBets: 15, totalProfit: -500000, joinedAt: '2025-01-22', status: 'active', lastActive: '2025-01-30' },
  { id: 'u5', username: 'Rudi Hartono', email: 'rudi@email.com', balance: 0, totalBets: 8, totalProfit: -2000000, joinedAt: '2025-01-10', status: 'suspended', lastActive: '2025-01-25' },
  { id: 'u6', username: 'Maya Putri', email: 'maya@email.com', balance: 35000000, totalBets: 120, totalProfit: 15000000, joinedAt: '2025-01-02', status: 'active', lastActive: '2025-02-01' },
  { id: 'u7', username: 'Andi Wijaya', email: 'andi@email.com', balance: 12000000, totalBets: 55, totalProfit: 4200000, joinedAt: '2025-01-08', status: 'active', lastActive: '2025-01-29' },
  { id: 'u8', username: 'Fitri Handayani', email: 'fitri@email.com', balance: 3000000, totalBets: 22, totalProfit: 800000, joinedAt: '2025-01-20', status: 'active', lastActive: '2025-01-28' },
  { id: 'u9', username: 'Doni Prasetyo', email: 'doni@email.com', balance: 0, totalBets: 3, totalProfit: -1500000, joinedAt: '2025-01-25', status: 'banned', lastActive: '2025-01-26' },
  { id: 'u10', username: 'Rina Susanti', email: 'rina@email.com', balance: 18000000, totalBets: 68, totalProfit: 6800000, joinedAt: '2025-01-03', status: 'active', lastActive: '2025-02-01' },
];

export default function AdminUsersPage() {
  const [mounted, setMounted] = useState(false);
  const [users] = useState<PlatformUser[]>(sampleUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-dark-800 rounded w-48" />
          <div className="h-12 bg-dark-800 rounded" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-dark-800 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalBalance = users.reduce((sum, u) => sum + u.balance, 0);
  const totalProfit = users.reduce((sum, u) => sum + u.totalProfit, 0);
  const activeCount = users.filter(u => u.status === 'active').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Aktif</span>;
      case 'suspended':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">Suspended</span>;
      case 'banned':
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">Banned</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Manajemen Users</h1>
          <p className="text-dark-400 mt-1">Kelola pengguna platform</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-blue-500" />
            <span className="text-dark-400 text-sm">Total Users</span>
          </div>
          <p className="text-2xl font-bold text-white">{users.length}</p>
        </div>
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-green-500" />
            <span className="text-dark-400 text-sm">Aktif</span>
          </div>
          <p className="text-2xl font-bold text-green-500">{activeCount}</p>
        </div>
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-5 h-5 text-purple-500" />
            <span className="text-dark-400 text-sm">Total Saldo</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatCompactNumber(totalBalance)}</p>
        </div>
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <span className="text-dark-400 text-sm">Total Profit Users</span>
          </div>
          <p className="text-2xl font-bold text-green-500">{formatCompactNumber(totalProfit)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-dark-800 rounded-xl border border-dark-700 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              type="text"
              placeholder="Cari user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-700 border border-dark-600 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-dark-400 focus:outline-none focus:border-primary-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none bg-dark-700 border border-dark-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 cursor-pointer"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left px-6 py-4 text-dark-400 font-medium text-sm">User</th>
                <th className="text-left px-6 py-4 text-dark-400 font-medium text-sm">Status</th>
                <th className="text-right px-6 py-4 text-dark-400 font-medium text-sm">Saldo</th>
                <th className="text-right px-6 py-4 text-dark-400 font-medium text-sm">Taruhan</th>
                <th className="text-right px-6 py-4 text-dark-400 font-medium text-sm">Profit</th>
                <th className="text-left px-6 py-4 text-dark-400 font-medium text-sm">Bergabung</th>
                <th className="text-right px-6 py-4 text-dark-400 font-medium text-sm">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-dark-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.username}</p>
                        <p className="text-dark-400 text-sm">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(user.status)}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-white font-medium">{formatIDR(user.balance)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-dark-300">{user.totalBets}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={user.totalProfit >= 0 ? 'text-green-500 font-medium' : 'text-red-500 font-medium'}>
                      {user.totalProfit >= 0 ? '+' : ''}{formatIDR(user.totalProfit)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-dark-300 text-sm">
                      {new Date(user.joinedAt).toLocaleDateString('id-ID')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-2 text-dark-400 hover:text-white hover:bg-dark-600 rounded-lg transition-colors"
                        title="Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-dark-400 hover:text-yellow-500 hover:bg-yellow-500/10 rounded-lg transition-colors"
                        title="Suspend"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-dark-400">Tidak ada user ditemukan</p>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/80">
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-6 max-w-lg w-full mx-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                {selectedUser.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{selectedUser.username}</h3>
                <p className="text-dark-400">{selectedUser.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-dark-700 rounded-lg p-3">
                <p className="text-dark-400 text-xs mb-1">Status</p>
                {getStatusBadge(selectedUser.status)}
              </div>
              <div className="bg-dark-700 rounded-lg p-3">
                <p className="text-dark-400 text-xs mb-1">Saldo</p>
                <p className="text-white font-medium">{formatIDR(selectedUser.balance)}</p>
              </div>
              <div className="bg-dark-700 rounded-lg p-3">
                <p className="text-dark-400 text-xs mb-1">Total Taruhan</p>
                <p className="text-white font-medium">{selectedUser.totalBets}</p>
              </div>
              <div className="bg-dark-700 rounded-lg p-3">
                <p className="text-dark-400 text-xs mb-1">Total Profit</p>
                <p className={selectedUser.totalProfit >= 0 ? 'text-green-500 font-medium' : 'text-red-500 font-medium'}>
                  {selectedUser.totalProfit >= 0 ? '+' : ''}{formatIDR(selectedUser.totalProfit)}
                </p>
              </div>
              <div className="bg-dark-700 rounded-lg p-3">
                <p className="text-dark-400 text-xs mb-1">Bergabung</p>
                <p className="text-white font-medium text-sm">{new Date(selectedUser.joinedAt).toLocaleDateString('id-ID')}</p>
              </div>
              <div className="bg-dark-700 rounded-lg p-3">
                <p className="text-dark-400 text-xs mb-1">Terakhir Aktif</p>
                <p className="text-white font-medium text-sm">{new Date(selectedUser.lastActive).toLocaleDateString('id-ID')}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedUser(null)}
                className="flex-1 px-4 py-2.5 bg-dark-700 hover:bg-dark-600 text-white rounded-lg font-medium transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
