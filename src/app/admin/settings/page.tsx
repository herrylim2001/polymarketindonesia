'use client';

import { useState, useEffect } from 'react';
import {
  Settings, Shield, Bell, Globe, Palette, Database, Save, Check,
  ToggleLeft, ToggleRight,
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
};

export default function AdminSettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'trading' | 'notifications' | 'regional'>('general');

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
