'use client';

import { useState, useEffect } from 'react';
import {
  Settings, Bell, Globe, Database, Save, Check, CreditCard, Zap, ExternalLink,
} from 'lucide-react';

interface PlatformSettings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  minBetAmount: number;
  maxBetAmount: number;
  platformFeePercent: number;
  minWithdrawal: number;
  autoResolve: boolean;
  emailNotifications: boolean;
  betNotifications: boolean;
  marketResolveNotifications: boolean;
  depositNotifications: boolean;
  defaultLanguage: string;
  currency: string;
  timezone: string;
  // Payment Settings
  bankTransferEnabled: boolean;
  ewalletEnabled: boolean;
  qrisEnabled: boolean;
  cryptoEnabled: boolean;
  // Uniwire Settings
  uniwireApiKey: string;
  uniwireApiSecret: string;
  uniwireProfileId: string;
  uniwireCallbackToken: string;
  uniwireTestMode: boolean;
}

const defaultSettings: PlatformSettings = {
  siteName: 'PolyID',
  siteDescription: 'Platform Prediction Market Indonesia',
  maintenanceMode: false,
  registrationEnabled: true,
  minBetAmount: 10000,
  maxBetAmount: 10000000,
  platformFeePercent: 2,
  minWithdrawal: 50000,
  autoResolve: false,
  emailNotifications: true,
  betNotifications: true,
  marketResolveNotifications: true,
  depositNotifications: true,
  defaultLanguage: 'id',
  currency: 'IDR',
  timezone: 'Asia/Jakarta',
  // Payment Settings
  bankTransferEnabled: true,
  ewalletEnabled: true,
  qrisEnabled: true,
  cryptoEnabled: true,
  // Uniwire Settings
  uniwireApiKey: '',
  uniwireApiSecret: '',
  uniwireProfileId: '',
  uniwireCallbackToken: '',
  uniwireTestMode: true,
};

export default function AdminSettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'trading' | 'payment' | 'notifications' | 'regional'>('general');

  useEffect(() => { setMounted(true); }, []);

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

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-12 h-6 rounded-full transition-colors ${value ? 'bg-primary-600' : 'bg-dark-600'}`}
    >
      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${value ? 'left-6' : 'left-0.5'}`} />
    </button>
  );

  const tabs = [
    { key: 'general', label: 'Umum', icon: Settings },
    { key: 'trading', label: 'Trading', icon: Database },
    { key: 'payment', label: 'Pembayaran', icon: CreditCard },
    { key: 'notifications', label: 'Notifikasi', icon: Bell },
    { key: 'regional', label: 'Regional', icon: Globe },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Pengaturan Platform</h1>
          <p className="text-dark-400 mt-1">Konfigurasi pengaturan platform PolyID</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors ${
            saved
              ? 'bg-green-600 text-white'
              : 'bg-primary-600 hover:bg-primary-700 text-white'
          }`}
        >
          {saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          {saved ? 'Tersimpan!' : 'Simpan'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-dark-700 overflow-x-auto">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === t.key
                  ? 'border-primary-500 text-white'
                  : 'border-transparent text-dark-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Informasi Situs</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-dark-300 text-sm mb-2">Nama Situs</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-dark-300 text-sm mb-2">Deskripsi</label>
                <textarea
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                  rows={3}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Status Platform</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Mode Maintenance</p>
                  <p className="text-dark-400 text-sm">Nonaktifkan akses publik sementara</p>
                </div>
                <Toggle
                  value={settings.maintenanceMode}
                  onChange={(v) => setSettings({ ...settings, maintenanceMode: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Registrasi Terbuka</p>
                  <p className="text-dark-400 text-sm">Izinkan pengguna baru mendaftar</p>
                </div>
                <Toggle
                  value={settings.registrationEnabled}
                  onChange={(v) => setSettings({ ...settings, registrationEnabled: v })}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trading Settings */}
      {activeTab === 'trading' && (
        <div className="space-y-6">
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Pengaturan Trading</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-dark-300 text-sm mb-2">Minimum Taruhan (Rp)</label>
                <input
                  type="number"
                  value={settings.minBetAmount}
                  onChange={(e) => setSettings({ ...settings, minBetAmount: Number(e.target.value) })}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-dark-300 text-sm mb-2">Maksimum Taruhan (Rp)</label>
                <input
                  type="number"
                  value={settings.maxBetAmount}
                  onChange={(e) => setSettings({ ...settings, maxBetAmount: Number(e.target.value) })}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-dark-300 text-sm mb-2">Fee Platform (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.platformFeePercent}
                  onChange={(e) => setSettings({ ...settings, platformFeePercent: Number(e.target.value) })}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-dark-300 text-sm mb-2">Minimum Withdrawal (Rp)</label>
                <input
                  type="number"
                  value={settings.minWithdrawal}
                  onChange={(e) => setSettings({ ...settings, minWithdrawal: Number(e.target.value) })}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Market Resolution</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Auto-Resolve</p>
                <p className="text-dark-400 text-sm">Resolve market otomatis berdasarkan data source</p>
              </div>
              <Toggle
                value={settings.autoResolve}
                onChange={(v) => setSettings({ ...settings, autoResolve: v })}
              />
            </div>
          </div>
        </div>
      )}

      {/* Payment Settings */}
      {activeTab === 'payment' && (
        <div className="space-y-6">
          {/* Payment Methods */}
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Metode Pembayaran</h2>
            <div className="space-y-4">
              {[
                { key: 'bankTransferEnabled', label: 'Transfer Bank / VA', desc: 'BCA, BNI, BRI, Mandiri, dll' },
                { key: 'ewalletEnabled', label: 'E-Wallet', desc: 'DANA, OVO, GoPay, ShopeePay, LinkAja' },
                { key: 'qrisEnabled', label: 'QRIS', desc: 'Pembayaran via QRIS' },
                { key: 'cryptoEnabled', label: 'Cryptocurrency', desc: 'Bitcoin, Ethereum, USDT, dll (via Uniwire)' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-white font-medium">{item.label}</p>
                    <p className="text-dark-400 text-sm">{item.desc}</p>
                  </div>
                  <Toggle
                    value={settings[item.key as keyof PlatformSettings] as boolean}
                    onChange={(v) => setSettings({ ...settings, [item.key]: v })}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Uniwire Configuration */}
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Uniwire Integration</h2>
                  <p className="text-dark-400 text-sm">Crypto payment gateway</p>
                </div>
              </div>
              <a
                href="https://docs.uniwire.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary-400 hover:text-primary-300 text-sm"
              >
                Dokumentasi <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-dark-700">
                <div>
                  <p className="text-white font-medium">Test Mode</p>
                  <p className="text-dark-400 text-sm">Gunakan sandbox untuk testing</p>
                </div>
                <Toggle
                  value={settings.uniwireTestMode}
                  onChange={(v) => setSettings({ ...settings, uniwireTestMode: v })}
                />
              </div>

              <div>
                <label className="block text-dark-300 text-sm mb-2">API Key</label>
                <input
                  type="text"
                  value={settings.uniwireApiKey}
                  onChange={(e) => setSettings({ ...settings, uniwireApiKey: e.target.value })}
                  placeholder="Masukkan API Key dari dashboard Uniwire"
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2.5 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-dark-300 text-sm mb-2">API Secret</label>
                <input
                  type="password"
                  value={settings.uniwireApiSecret}
                  onChange={(e) => setSettings({ ...settings, uniwireApiSecret: e.target.value })}
                  placeholder="Masukkan API Secret"
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2.5 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-dark-300 text-sm mb-2">Profile ID</label>
                <input
                  type="text"
                  value={settings.uniwireProfileId}
                  onChange={(e) => setSettings({ ...settings, uniwireProfileId: e.target.value })}
                  placeholder="Masukkan Profile ID"
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2.5 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-dark-300 text-sm mb-2">Callback Token</label>
                <input
                  type="password"
                  value={settings.uniwireCallbackToken}
                  onChange={(e) => setSettings({ ...settings, uniwireCallbackToken: e.target.value })}
                  placeholder="Token untuk verifikasi callback"
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2.5 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <p className="text-amber-400 text-sm">
                <strong>Catatan:</strong> Untuk mendapatkan kredensial API, daftar di{' '}
                <a href="https://uniwire.com" target="_blank" rel="noopener noreferrer" className="underline">
                  uniwire.com
                </a>{' '}
                dan buat configuration profile di dashboard.
              </p>
            </div>
          </div>

          {/* Supported Cryptocurrencies */}
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Cryptocurrency Didukung</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: 'Bitcoin', symbol: 'BTC', icon: '₿', color: 'bg-orange-500' },
                { name: 'Lightning', symbol: 'BTC-LN', icon: '⚡', color: 'bg-yellow-500' },
                { name: 'Ethereum', symbol: 'ETH', icon: 'Ξ', color: 'bg-indigo-500' },
                { name: 'USDT TRC20', symbol: 'USDT', icon: '₮', color: 'bg-green-500' },
                { name: 'USDT ERC20', symbol: 'USDT', icon: '₮', color: 'bg-green-600' },
                { name: 'USDT TON', symbol: 'USDT', icon: '₮', color: 'bg-blue-500' },
                { name: 'TON', symbol: 'TON', icon: '💎', color: 'bg-sky-500' },
                { name: 'Polygon', symbol: 'MATIC', icon: '⬡', color: 'bg-purple-500' },
              ].map(crypto => (
                <div key={crypto.name} className="flex items-center gap-2 p-3 bg-dark-900 rounded-lg">
                  <div className={`w-8 h-8 ${crypto.color} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                    {crypto.icon}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{crypto.symbol}</p>
                    <p className="text-dark-400 text-xs">{crypto.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notification Settings */}
      {activeTab === 'notifications' && (
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Pengaturan Notifikasi</h2>
          <div className="space-y-4">
            {[
              { key: 'emailNotifications', label: 'Email Notifikasi', desc: 'Kirim notifikasi via email ke pengguna' },
              { key: 'betNotifications', label: 'Notifikasi Taruhan', desc: 'Notifikasi saat taruhan berhasil ditempatkan' },
              { key: 'marketResolveNotifications', label: 'Notifikasi Resolusi', desc: 'Notifikasi saat market di-resolve' },
              { key: 'depositNotifications', label: 'Notifikasi Deposit', desc: 'Notifikasi saat deposit berhasil' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-white font-medium">{item.label}</p>
                  <p className="text-dark-400 text-sm">{item.desc}</p>
                </div>
                <Toggle
                  value={settings[item.key as keyof PlatformSettings] as boolean}
                  onChange={(v) => setSettings({ ...settings, [item.key]: v })}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regional Settings */}
      {activeTab === 'regional' && (
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Pengaturan Regional</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-dark-300 text-sm mb-2">Bahasa Default</label>
              <select
                value={settings.defaultLanguage}
                onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
                className="w-full appearance-none bg-dark-700 border border-dark-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 cursor-pointer"
              >
                <option value="id">Bahasa Indonesia</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="block text-dark-300 text-sm mb-2">Mata Uang</label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full appearance-none bg-dark-700 border border-dark-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 cursor-pointer"
              >
                <option value="IDR">IDR - Rupiah Indonesia</option>
                <option value="USD">USD - US Dollar</option>
              </select>
            </div>
            <div>
              <label className="block text-dark-300 text-sm mb-2">Timezone</label>
              <select
                value={settings.timezone}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                className="w-full appearance-none bg-dark-700 border border-dark-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 cursor-pointer"
              >
                <option value="Asia/Jakarta">WIB (Jakarta)</option>
                <option value="Asia/Makassar">WITA (Makassar)</option>
                <option value="Asia/Jayapura">WIT (Jayapura)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
