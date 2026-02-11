'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowDownCircle, ArrowUpCircle, Clock, CheckCircle2,
  XCircle, AlertCircle, Plus, Filter, ChevronDown
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Transaction, BANKS, EWALLETS, CRYPTOCURRENCIES } from '@/types';
import { formatIDR } from '@/lib/utils';

export default function TransactionsPage() {
  const router = useRouter();
  const { user, isLoggedIn, transactions } = useStore();
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<'all' | 'deposit' | 'withdrawal'>('all');
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoggedIn) {
      router.push('/auth');
    }
  }, [mounted, isLoggedIn, router]);

  if (!mounted || !isLoggedIn) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-dark-800 rounded w-1/3" />
          <div className="h-32 bg-dark-800 rounded-xl" />
          <div className="h-24 bg-dark-800 rounded-xl" />
          <div className="h-24 bg-dark-800 rounded-xl" />
        </div>
      </div>
    );
  }

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1 text-green-400 text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Berhasil
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1 text-amber-400 text-xs font-medium">
            <Clock className="w-3.5 h-3.5" /> Menunggu
          </span>
        );
      case 'processing':
        return (
          <span className="flex items-center gap-1 text-blue-400 text-xs font-medium">
            <AlertCircle className="w-3.5 h-3.5" /> Diproses
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center gap-1 text-red-400 text-xs font-medium">
            <XCircle className="w-3.5 h-3.5" /> Gagal
          </span>
        );
      case 'expired':
        return (
          <span className="flex items-center gap-1 text-dark-400 text-xs font-medium">
            <XCircle className="w-3.5 h-3.5" /> Expired
          </span>
        );
    }
  };

  const getPaymentMethodLabel = (tx: Transaction) => {
    if (tx.bankCode) {
      const bank = BANKS.find(b => b.code === tx.bankCode);
      return bank ? `${bank.shortName} VA` : 'Bank Transfer';
    }
    if (tx.ewalletCode) {
      const ewallet = EWALLETS.find(e => e.code === tx.ewalletCode);
      return ewallet?.name || 'E-Wallet';
    }
    if (tx.cryptoCode) {
      const crypto = CRYPTOCURRENCIES.find(c => c.code === tx.cryptoCode);
      return crypto ? `${crypto.symbol} (${crypto.networkName})` : 'Crypto';
    }
    if (tx.paymentMethod === 'qris') return 'QRIS';
    return 'Transfer';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Riwayat Transaksi</h1>
          <p className="text-dark-400 text-sm">Saldo: <span className="text-white font-semibold">{formatIDR(user?.balance || 0)}</span></p>
        </div>
        <Link
          href="/deposit"
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Deposit
        </Link>
      </div>

      {/* Filter */}
      <div className="relative mb-6">
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="flex items-center gap-2 bg-dark-800 border border-dark-700 rounded-xl px-4 py-2 text-white"
        >
          <Filter className="w-4 h-4 text-dark-400" />
          {filter === 'all' ? 'Semua Transaksi' : filter === 'deposit' ? 'Deposit' : 'Penarikan'}
          <ChevronDown className="w-4 h-4 text-dark-400" />
        </button>
        {showFilter && (
          <div className="absolute top-full mt-2 bg-dark-800 border border-dark-700 rounded-xl overflow-hidden z-10">
            {[
              { key: 'all', label: 'Semua Transaksi' },
              { key: 'deposit', label: 'Deposit' },
              { key: 'withdrawal', label: 'Penarikan' },
            ].map(option => (
              <button
                key={option.key}
                onClick={() => {
                  setFilter(option.key as typeof filter);
                  setShowFilter(false);
                }}
                className={`w-full text-left px-4 py-2 hover:bg-dark-700 ${
                  filter === option.key ? 'text-primary-400' : 'text-white'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-8 text-center">
          <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowDownCircle className="w-8 h-8 text-dark-500" />
          </div>
          <p className="text-dark-400 mb-4">Belum ada transaksi</p>
          <Link
            href="/deposit"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-2 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            Deposit Sekarang
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map(tx => (
            <div
              key={tx.id}
              className="bg-dark-800 rounded-xl border border-dark-700 p-4 hover:border-dark-600 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  tx.type === 'deposit' ? 'bg-green-600/20' : 'bg-red-600/20'
                }`}>
                  {tx.type === 'deposit' ? (
                    <ArrowDownCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <ArrowUpCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white font-semibold">
                      {tx.type === 'deposit' ? 'Deposit' : 'Penarikan'}
                    </p>
                    <p className={`font-bold ${tx.type === 'deposit' ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.type === 'deposit' ? '+' : '-'}{formatIDR(tx.amount)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-dark-400 text-sm">{getPaymentMethodLabel(tx)}</span>
                      <span className="text-dark-600">•</span>
                      {getStatusBadge(tx.status)}
                    </div>
                    <p className="text-dark-500 text-xs">{formatDate(tx.createdAt)}</p>
                  </div>
                  {tx.virtualAccountNumber && tx.status === 'pending' && (
                    <p className="text-dark-400 text-xs mt-2 font-mono">
                      VA: {tx.virtualAccountNumber}
                    </p>
                  )}
                  {tx.reference && (
                    <p className="text-dark-500 text-xs mt-1">
                      Ref: {tx.reference}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
