'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Calculator,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { useAdminStore } from '@/store/adminStore';
import { CATEGORIES, Category } from '@/types';
import { probabilityToOdds, calculateBetOutcome, formatOddsDisplay } from '@/lib/odds';
import { formatIDR } from '@/lib/utils';

interface OutcomeInput {
  id: string;
  label: string;
  probability: number;
}

export default function NewMarketPage() {
  const router = useRouter();
  const { addMarket } = useAdminStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('politik');
  const [imageUrl, setImageUrl] = useState('');
  const [endDate, setEndDate] = useState('');
  const [source, setSource] = useState('');
  const [featured, setFeatured] = useState(false);
  const [trending, setTrending] = useState(false);

  const [outcomes, setOutcomes] = useState<OutcomeInput[]>([
    { id: '1', label: 'Ya', probability: 50 },
    { id: '2', label: 'Tidak', probability: 50 },
  ]);

  const [errors, setErrors] = useState<string[]>([]);
  const [showOddsPreview, setShowOddsPreview] = useState(false);
  const [previewBetAmount, setPreviewBetAmount] = useState(100000);

  // Calculate total probability
  const totalProbability = outcomes.reduce((sum, o) => sum + o.probability, 0);
  const isProbabilityValid = totalProbability === 100;

  const addOutcome = () => {
    const remainingProb = Math.max(0, 100 - totalProbability);
    setOutcomes([
      ...outcomes,
      { id: Date.now().toString(), label: '', probability: remainingProb },
    ]);
  };

  const updateOutcome = (id: string, field: 'label' | 'probability', value: string | number) => {
    setOutcomes(
      outcomes.map((o) => (o.id === id ? { ...o, [field]: value } : o))
    );
  };

  const removeOutcome = (id: string) => {
    if (outcomes.length <= 2) return;
    setOutcomes(outcomes.filter((o) => o.id !== id));
  };

  const normalizeOutcomes = () => {
    if (totalProbability === 0) return;

    const normalized = outcomes.map((o) => ({
      ...o,
      probability: Math.round((o.probability / totalProbability) * 100),
    }));

    // Adjust for rounding errors
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
    if (new Date(endDate) <= new Date()) newErrors.push('Tanggal berakhir harus di masa depan');
    if (outcomes.some((o) => !o.label.trim())) newErrors.push('Semua outcome harus memiliki label');
    if (!isProbabilityValid) newErrors.push('Total probabilitas harus 100%');
    if (outcomes.some((o) => o.probability < 1)) newErrors.push('Probabilitas minimum adalah 1%');

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const newMarket = addMarket({
      title,
      description,
      category,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
      endDate,
      source,
      featured,
      trending,
      status: 'active',
      outcomes: outcomes.map((o) => ({
        id: o.id,
        label: o.label,
        probability: o.probability,
        totalBets: 0,
        volume: 0,
      })),
    });

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
        <h1 className="text-2xl font-bold text-white">Buat Market Baru</h1>
        <p className="text-dark-400 mt-1">Tambahkan prediction market baru ke platform</p>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-medium mb-2">Terdapat kesalahan:</p>
              <ul className="list-disc list-inside text-red-400 text-sm space-y-1">
                {errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Informasi Dasar</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-dark-300 text-sm font-medium mb-2">
                Judul Market *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Siapa yang akan memenangkan Pilkada Jakarta 2027?"
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-dark-300 text-sm font-medium mb-2">
                Deskripsi *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Jelaskan detail market, kriteria resolusi, dan sumber data yang akan digunakan..."
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-dark-300 text-sm font-medium mb-2">
                  Kategori *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-dark-300 text-sm font-medium mb-2">
                  Tanggal Berakhir *
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-dark-300 text-sm font-medium mb-2">
                  <ImageIcon className="w-4 h-4 inline mr-1" />
                  URL Gambar
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-dark-300 text-sm font-medium mb-2">
                  Sumber Data
                </label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="Contoh: KPU RI, BPS, FIFA..."
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            {/* Flags */}
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-5 h-5 rounded border-dark-600 bg-dark-700 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-dark-300">Featured Market</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={trending}
                  onChange={(e) => setTrending(e.target.checked)}
                  className="w-5 h-5 rounded border-dark-600 bg-dark-700 text-primary-500 focus:ring-primary-500"
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
              <p className="text-dark-400 text-sm mt-1">
                Total probabilitas harus 100%
              </p>
            </div>
            <div
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                isProbabilityValid
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              Total: {totalProbability}%
            </div>
          </div>

          <div className="space-y-3">
            {outcomes.map((outcome, index) => {
              const odds = formatOddsDisplay(outcome.probability);
              return (
                <div
                  key={outcome.id}
                  className="bg-dark-700/50 rounded-lg p-4 border border-dark-600"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-dark-400 text-xs mb-1">
                        Outcome {index + 1}
                      </label>
                      <input
                        type="text"
                        value={outcome.label}
                        onChange={(e) => updateOutcome(outcome.id, 'label', e.target.value)}
                        placeholder="Label outcome..."
                        className="w-full bg-dark-600 border border-dark-500 rounded-lg px-3 py-2 text-white placeholder-dark-400 focus:outline-none focus:border-primary-500"
                      />
                    </div>
                    <div className="w-32">
                      <label className="block text-dark-400 text-xs mb-1">
                        Probabilitas
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={outcome.probability}
                          onChange={(e) =>
                            updateOutcome(
                              outcome.id,
                              'probability',
                              Math.max(1, Math.min(99, parseInt(e.target.value) || 0))
                            )
                          }
                          min={1}
                          max={99}
                          className="w-full bg-dark-600 border border-dark-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-400">
                          %
                        </span>
                      </div>
                    </div>
                    <div className="w-24 text-center">
                      <label className="block text-dark-400 text-xs mb-1">Odds</label>
                      <span className="text-primary-400 font-bold">{odds.multiplier}</span>
                    </div>
                    {outcomes.length > 2 && (
                      <button
                        onClick={() => removeOutcome(outcome.id)}
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

          <div className="flex gap-3 mt-4">
            <button
              onClick={addOutcome}
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
        </div>

        {/* Odds Preview */}
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              <Calculator className="w-5 h-5 inline mr-2" />
              Preview Kalkulasi Odds
            </h2>
            <button
              onClick={() => setShowOddsPreview(!showOddsPreview)}
              className="text-primary-400 text-sm hover:text-primary-300"
            >
              {showOddsPreview ? 'Sembunyikan' : 'Tampilkan'}
            </button>
          </div>

          {showOddsPreview && (
            <div className="space-y-4">
              <div>
                <label className="block text-dark-400 text-sm mb-2">
                  Simulasi Jumlah Taruhan
                </label>
                <input
                  type="number"
                  value={previewBetAmount}
                  onChange={(e) => setPreviewBetAmount(parseInt(e.target.value) || 0)}
                  className="w-48 bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {outcomes.map((outcome) => {
                  const betResult = calculateBetOutcome(previewBetAmount, outcome.probability);
                  const odds = formatOddsDisplay(outcome.probability);

                  return (
                    <div
                      key={outcome.id}
                      className="bg-dark-700/50 rounded-lg p-4 border border-dark-600"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-white font-medium">
                          {outcome.label || 'Unnamed'}
                        </span>
                        <span
                          className={`text-lg font-bold ${
                            outcome.probability >= 50 ? 'text-green-500' : 'text-red-500'
                          }`}
                        >
                          {outcome.probability}%
                        </span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-dark-400">Odds Desimal</span>
                          <span className="text-white">{odds.decimal}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-dark-400">Odds Fraksional</span>
                          <span className="text-white">{odds.fractional}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-dark-400">Odds Amerika</span>
                          <span className="text-white">{odds.american}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-dark-400">Harga per Share</span>
                          <span className="text-white">Rp {betResult.pricePerShare}</span>
                        </div>
                        <hr className="border-dark-600" />
                        <div className="flex justify-between">
                          <span className="text-dark-400">Shares Didapat</span>
                          <span className="text-primary-400 font-medium">
                            {betResult.sharesReceived.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-dark-400">Potensi Payout</span>
                          <span className="text-white font-medium">
                            {formatIDR(betResult.potentialPayout)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-dark-400">Potensi Profit</span>
                          <span className="text-green-500 font-medium">
                            +{formatIDR(betResult.potentialProfit)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-lg font-medium transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isProbabilityValid}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              isProbabilityValid
                ? 'bg-primary-600 hover:bg-primary-700 text-white'
                : 'bg-dark-700 text-dark-500 cursor-not-allowed'
            }`}
          >
            <Save className="w-5 h-5" />
            Simpan Market
          </button>
        </div>
      </div>
    </div>
  );
}
