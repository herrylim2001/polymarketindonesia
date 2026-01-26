'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Calculator,
  AlertCircle,
  CheckCircle,
  XCircle,
  Trophy,
  AlertTriangle,
} from 'lucide-react';
import { useAdminStore } from '@/store/adminStore';
import { CATEGORIES, Category } from '@/types';
import { formatOddsDisplay, calculateBetOutcome } from '@/lib/odds';
import { formatIDR, formatCompactNumber } from '@/lib/utils';

interface OutcomeInput {
  id: string;
  label: string;
  probability: number;
  totalBets: number;
  volume: number;
}

export default function EditMarketPage() {
  const params = useParams();
  const router = useRouter();
  const { markets, updateMarket, resolveMarket, deleteMarket, addOutcome, updateOutcome, deleteOutcome } =
    useAdminStore();

  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('politik');
  const [imageUrl, setImageUrl] = useState('');
  const [endDate, setEndDate] = useState('');
  const [source, setSource] = useState('');
  const [featured, setFeatured] = useState(false);
  const [trending, setTrending] = useState(false);
  const [status, setStatus] = useState<'active' | 'resolved' | 'pending' | 'cancelled'>('active');
  const [outcomes, setOutcomes] = useState<OutcomeInput[]>([]);

  const [errors, setErrors] = useState<string[]>([]);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null);

  const market = markets.find((m) => m.id === params.id);

  useEffect(() => {
    setMounted(true);
    if (market) {
      setTitle(market.title);
      setDescription(market.description);
      setCategory(market.category);
      setImageUrl(market.imageUrl || '');
      setEndDate(market.endDate);
      setSource(market.source || '');
      setFeatured(market.featured || false);
      setTrending(market.trending || false);
      setStatus(market.status);
      setOutcomes(
        market.outcomes.map((o) => ({
          id: o.id,
          label: o.label,
          probability: o.probability,
          totalBets: o.totalBets,
          volume: o.volume,
        }))
      );
    }
  }, [market]);

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

  if (!market) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Market tidak ditemukan</h1>
        <button
          onClick={() => router.push('/admin/markets')}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Kembali ke Daftar Markets
        </button>
      </div>
    );
  }

  const totalProbability = outcomes.reduce((sum, o) => sum + o.probability, 0);
  const isProbabilityValid = totalProbability === 100;

  const handleAddOutcome = () => {
    const remainingProb = Math.max(0, 100 - totalProbability);
    setOutcomes([
      ...outcomes,
      { id: `new-${Date.now()}`, label: '', probability: remainingProb, totalBets: 0, volume: 0 },
    ]);
  };

  const handleUpdateOutcome = (id: string, field: keyof OutcomeInput, value: string | number) => {
    setOutcomes(outcomes.map((o) => (o.id === id ? { ...o, [field]: value } : o)));
  };

  const handleRemoveOutcome = (id: string) => {
    if (outcomes.length <= 2) return;
    setOutcomes(outcomes.filter((o) => o.id !== id));
  };

  const normalizeOutcomes = () => {
    if (totalProbability === 0) return;
    const normalized = outcomes.map((o) => ({
      ...o,
      probability: Math.round((o.probability / totalProbability) * 100),
    }));
    const newTotal = normalized.reduce((sum, o) => sum + o.probability, 0);
    if (newTotal !== 100 && normalized.length > 0) {
      normalized[0].probability += 100 - newTotal;
    }
    setOutcomes(normalized);
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];
    if (!title.trim()) newErrors.push('Judul market harus diisi');
    if (!description.trim()) newErrors.push('Deskripsi harus diisi');
    if (!endDate) newErrors.push('Tanggal berakhir harus diisi');
    if (outcomes.some((o) => !o.label.trim())) newErrors.push('Semua outcome harus memiliki label');
    if (!isProbabilityValid) newErrors.push('Total probabilitas harus 100%');
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    updateMarket(market.id, {
      title,
      description,
      category,
      imageUrl,
      endDate,
      source,
      featured,
      trending,
      outcomes: outcomes.map((o) => ({
        id: o.id,
        label: o.label,
        probability: o.probability,
        totalBets: o.totalBets,
        volume: o.volume,
      })),
    });

    router.push('/admin/markets');
  };

  const handleResolve = () => {
    if (!selectedWinner) return;
    resolveMarket(market.id, selectedWinner, 'Admin');
    setShowResolveModal(false);
    router.push('/admin/markets');
  };

  const handleCancel = () => {
    updateMarket(market.id, { status: 'cancelled' });
    setShowCancelModal(false);
    router.push('/admin/markets');
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Kembali
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Edit Market</h1>
            <p className="text-dark-400 mt-1">ID: {market.id}</p>
          </div>
          <div className="flex items-center gap-2">
            {market.status === 'active' && (
              <span className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-full text-sm">
                <CheckCircle className="w-4 h-4" />
                Aktif
              </span>
            )}
            {market.status === 'resolved' && (
              <span className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                <Trophy className="w-4 h-4" />
                Resolved
              </span>
            )}
            {market.status === 'cancelled' && (
              <span className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-full text-sm">
                <XCircle className="w-4 h-4" />
                Dibatalkan
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <ul className="list-disc list-inside text-red-400 text-sm space-y-1">
              {errors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4">
          <p className="text-dark-400 text-sm">Total Volume</p>
          <p className="text-xl font-bold text-primary-400">{formatCompactNumber(market.totalVolume)}</p>
        </div>
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4">
          <p className="text-dark-400 text-sm">Total Taruhan</p>
          <p className="text-xl font-bold text-white">{market.totalBets.toLocaleString()}</p>
        </div>
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4">
          <p className="text-dark-400 text-sm">Outcomes</p>
          <p className="text-xl font-bold text-white">{outcomes.length}</p>
        </div>
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4">
          <p className="text-dark-400 text-sm">Dibuat</p>
          <p className="text-xl font-bold text-white">
            {new Date(market.createdAt).toLocaleDateString('id-ID')}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Informasi Dasar</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-dark-300 text-sm font-medium mb-2">Judul Market *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={market.status !== 'active'}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-dark-300 text-sm font-medium mb-2">Deskripsi *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                disabled={market.status !== 'active'}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 resize-none disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-dark-300 text-sm font-medium mb-2">Kategori</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  disabled={market.status !== 'active'}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 disabled:opacity-50"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-dark-300 text-sm font-medium mb-2">Tanggal Berakhir</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={market.status !== 'active'}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-dark-300 text-sm font-medium mb-2">URL Gambar</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  disabled={market.status !== 'active'}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-dark-300 text-sm font-medium mb-2">Sumber</label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  disabled={market.status !== 'active'}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  disabled={market.status !== 'active'}
                  className="w-5 h-5 rounded border-dark-600 bg-dark-700 text-primary-500 focus:ring-primary-500 disabled:opacity-50"
                />
                <span className="text-dark-300">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={trending}
                  onChange={(e) => setTrending(e.target.checked)}
                  disabled={market.status !== 'active'}
                  className="w-5 h-5 rounded border-dark-600 bg-dark-700 text-primary-500 focus:ring-primary-500 disabled:opacity-50"
                />
                <span className="text-dark-300">Trending</span>
              </label>
            </div>
          </div>
        </div>

        {/* Outcomes */}
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Pilihan Outcome</h2>
              <p className="text-dark-400 text-sm mt-1">Total probabilitas harus 100%</p>
            </div>
            <div
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                isProbabilityValid ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}
            >
              Total: {totalProbability}%
            </div>
          </div>

          <div className="space-y-3">
            {outcomes.map((outcome, index) => {
              const odds = formatOddsDisplay(outcome.probability);
              return (
                <div key={outcome.id} className="bg-dark-700/50 rounded-lg p-4 border border-dark-600">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-dark-400 text-xs mb-1">Outcome {index + 1}</label>
                      <input
                        type="text"
                        value={outcome.label}
                        onChange={(e) => handleUpdateOutcome(outcome.id, 'label', e.target.value)}
                        disabled={market.status !== 'active'}
                        className="w-full bg-dark-600 border border-dark-500 rounded-lg px-3 py-2 text-white placeholder-dark-400 focus:outline-none focus:border-primary-500 disabled:opacity-50"
                      />
                    </div>
                    <div className="w-24">
                      <label className="block text-dark-400 text-xs mb-1">Prob (%)</label>
                      <input
                        type="number"
                        value={outcome.probability}
                        onChange={(e) =>
                          handleUpdateOutcome(
                            outcome.id,
                            'probability',
                            Math.max(1, Math.min(99, parseInt(e.target.value) || 0))
                          )
                        }
                        min={1}
                        max={99}
                        disabled={market.status !== 'active'}
                        className="w-full bg-dark-600 border border-dark-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500 disabled:opacity-50"
                      />
                    </div>
                    <div className="w-20 text-center">
                      <label className="block text-dark-400 text-xs mb-1">Odds</label>
                      <span className="text-primary-400 font-bold">{odds.multiplier}</span>
                    </div>
                    <div className="w-24 text-right">
                      <label className="block text-dark-400 text-xs mb-1">Volume</label>
                      <span className="text-white text-sm">{formatCompactNumber(outcome.volume)}</span>
                    </div>
                    {outcomes.length > 2 && market.status === 'active' && (
                      <button
                        onClick={() => handleRemoveOutcome(outcome.id)}
                        className="p-2 text-dark-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {market.status === 'active' && (
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAddOutcome}
                className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Tambah Outcome
              </button>
              {!isProbabilityValid && (
                <button
                  onClick={normalizeOutcomes}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600/20 hover:bg-primary-600/30 text-primary-400 rounded-lg transition-colors"
                >
                  <Calculator className="w-4 h-4" />
                  Normalisasi ke 100%
                </button>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        {market.status === 'active' && (
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Aksi Market</h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setShowResolveModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                <Trophy className="w-5 h-5" />
                Resolve Market
              </button>
              <button
                onClick={() => setShowCancelModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                <XCircle className="w-5 h-5" />
                Batalkan Market
              </button>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-lg font-medium transition-colors"
          >
            Batal
          </button>
          {market.status === 'active' && (
            <button
              onClick={handleSave}
              disabled={!isProbabilityValid}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                isProbabilityValid
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-dark-700 text-dark-500 cursor-not-allowed'
              }`}
            >
              <Save className="w-5 h-5" />
              Simpan Perubahan
            </button>
          )}
        </div>
      </div>

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/80">
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-8 h-8 text-green-500" />
              <div>
                <h3 className="text-xl font-bold text-white">Resolve Market</h3>
                <p className="text-dark-400 text-sm">Pilih outcome pemenang</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {outcomes.map((outcome) => (
                <button
                  key={outcome.id}
                  onClick={() => setSelectedWinner(outcome.id)}
                  className={`w-full p-4 rounded-lg border transition-all text-left ${
                    selectedWinner === outcome.id
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-dark-600 hover:border-dark-500 bg-dark-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{outcome.label}</span>
                    <span className="text-dark-400">{outcome.probability}%</span>
                  </div>
                  <p className="text-dark-500 text-sm mt-1">
                    Volume: {formatCompactNumber(outcome.volume)} | Taruhan: {outcome.totalBets}
                  </p>
                </button>
              ))}
            </div>

            <div className="flex items-start gap-2 p-3 bg-yellow-500/10 rounded-lg mb-6">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-yellow-300 text-sm">
                Tindakan ini tidak dapat dibatalkan. Semua taruhan pada outcome lain akan dianggap kalah.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowResolveModal(false);
                  setSelectedWinner(null);
                }}
                className="flex-1 px-4 py-2.5 bg-dark-700 hover:bg-dark-600 text-white rounded-lg font-medium transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleResolve}
                disabled={!selectedWinner}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  selectedWinner
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-dark-700 text-dark-500 cursor-not-allowed'
                }`}
              >
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/80">
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
              <h3 className="text-xl font-bold text-white">Batalkan Market?</h3>
            </div>
            <p className="text-dark-400 mb-6">
              Market yang dibatalkan tidak dapat diaktifkan kembali. Semua taruhan akan dikembalikan ke user.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2.5 bg-dark-700 hover:bg-dark-600 text-white rounded-lg font-medium transition-colors"
              >
                Kembali
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
