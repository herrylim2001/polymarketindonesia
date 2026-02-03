'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TrendingUp, Eye, EyeOff, AlertCircle, CheckCircle, Mail, Lock, User } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function AuthPage() {
  const router = useRouter();
  const { login, register, isLoggedIn } = useStore();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isLoggedIn) {
      router.push('/');
    }
  }, [isLoggedIn, mounted, router]);

  if (!mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (mode === 'login') {
      if (!email || !password) {
        setError('Email dan password harus diisi');
        return;
      }
      const ok = login(email, password);
      if (!ok) {
        setError('Email atau password salah. Coba: demo@polyid.com / demo123');
        return;
      }
      router.push('/');
    } else {
      if (!username || !email || !password) {
        setError('Semua field harus diisi');
        return;
      }
      if (password.length < 6) {
        setError('Password minimal 6 karakter');
        return;
      }
      if (password !== confirmPassword) {
        setError('Password tidak cocok');
        return;
      }
      const ok = register(username, email, password);
      if (!ok) {
        setError('Email sudah terdaftar');
        return;
      }
      router.push('/');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-white">
              Poly<span className="text-primary-500">ID</span>
            </span>
          </Link>
          <p className="text-dark-400 mt-3">
            {mode === 'login' ? 'Masuk ke akun Anda' : 'Buat akun baru'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-dark-800 rounded-xl p-1 mb-6 border border-dark-700">
          <button
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2.5 rounded-lg font-medium transition-colors ${
              mode === 'login' ? 'bg-primary-600 text-white' : 'text-dark-400 hover:text-white'
            }`}
          >
            Masuk
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-2.5 rounded-lg font-medium transition-colors ${
              mode === 'register' ? 'bg-primary-600 text-white' : 'text-dark-400 hover:text-white'
            }`}
          >
            Daftar
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-dark-800 rounded-xl border border-dark-700 p-6 space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-dark-300 text-sm font-medium mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Username Anda"
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-dark-300 text-sm font-medium mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@contoh.com"
                className="w-full bg-dark-700 border border-dark-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-dark-300 text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-dark-700 border border-dark-600 rounded-lg pl-10 pr-12 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-dark-300 text-sm font-medium mb-2">Konfirmasi Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password"
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            {mode === 'login' ? 'Masuk' : 'Daftar Sekarang'}
          </button>

          {mode === 'login' && (
            <div className="bg-dark-700/50 rounded-lg p-3">
              <p className="text-dark-400 text-xs text-center">
                Demo akun: <span className="text-white">demo@polyid.com</span> / <span className="text-white">demo123</span>
              </p>
            </div>
          )}

          {mode === 'register' && (
            <div className="flex items-start gap-2 p-3 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-green-300 text-sm">
                Bonus Rp 10.000.000 saldo gratis untuk member baru!
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
