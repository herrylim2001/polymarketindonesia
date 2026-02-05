'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Search, Menu, X, Wallet, User, TrendingUp, Bell, LogOut, BookOpen, Trophy, Settings } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatIDR } from '@/lib/utils';

export default function Header() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isLoggedIn, notifications, logout, markNotificationRead, markAllNotificationsRead, clearNotifications } = useStore();
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    router.push('/');
  };

  return (
    <header className="bg-dark-900 border-b border-dark-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              Poly<span className="text-primary-500">ID</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-dark-300 hover:text-white transition-colors">
              Beranda
            </Link>
            <Link href="/kategori/politik" className="text-dark-300 hover:text-white transition-colors">
              Politik
            </Link>
            <Link href="/kategori/ekonomi" className="text-dark-300 hover:text-white transition-colors">
              Ekonomi
            </Link>
            <Link href="/kategori/olahraga" className="text-dark-300 hover:text-white transition-colors">
              Olahraga
            </Link>
            <Link href="/kategori" className="text-dark-300 hover:text-white transition-colors">
              Semua Kategori
            </Link>
          </nav>

          {/* Search & User Actions */}
          <div className="flex items-center space-x-3">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-dark-400 hover:text-white transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notifications */}
            {isLoggedIn && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-dark-400 hover:text-white transition-colors relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-dark-800 border border-dark-700 rounded-xl shadow-2xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-dark-700">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-semibold">Notifikasi</h3>
                        {unreadCount > 0 && (
                          <span className="text-xs text-primary-400">{unreadCount} belum dibaca</span>
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <div className="flex items-center gap-2">
                          {unreadCount > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAllNotificationsRead();
                              }}
                              className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                            >
                              Tandai semua dibaca
                            </button>
                          )}
                          <span className="text-dark-600">|</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              clearNotifications();
                            }}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors"
                          >
                            Hapus semua
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-dark-400 text-sm">Belum ada notifikasi</div>
                      ) : (
                        notifications.slice(0, 10).map(notif => (
                          <button
                            key={notif.id}
                            onClick={() => {
                              markNotificationRead(notif.id);
                              if (notif.link) router.push(notif.link);
                              setShowNotifications(false);
                            }}
                            className={`w-full text-left px-4 py-3 hover:bg-dark-700/50 transition-colors border-b border-dark-700/50 ${
                              !notif.read ? 'bg-dark-750' : ''
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {!notif.read && <div className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 flex-shrink-0" />}
                              <div className={!notif.read ? '' : 'ml-4'}>
                                <p className="text-white text-sm font-medium">{notif.title}</p>
                                <p className="text-dark-400 text-xs mt-0.5">{notif.message}</p>
                                <p className="text-dark-500 text-xs mt-1">
                                  {new Date(notif.timestamp).toLocaleString('id-ID')}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Balance & Profile */}
            {isLoggedIn && user ? (
              <div className="hidden sm:flex items-center space-x-2">
                <Link
                  href="/portfolio"
                  className="flex items-center space-x-2 bg-dark-800 rounded-lg px-3 py-2 hover:bg-dark-700 transition-colors"
                >
                  <Wallet className="w-4 h-4 text-primary-500" />
                  <span className="text-white font-medium text-sm">
                    {formatIDR(user.balance)}
                  </span>
                </Link>

                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 bg-dark-800 rounded-lg px-3 py-2 hover:bg-dark-700 transition-colors"
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-md flex items-center justify-center text-white text-xs font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-white text-sm">{user.username}</span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-dark-800 border border-dark-700 rounded-xl shadow-2xl overflow-hidden">
                      <Link
                        href="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-3 text-dark-300 hover:bg-dark-700 hover:text-white transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Profil
                      </Link>
                      <Link
                        href="/portfolio"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-3 text-dark-300 hover:bg-dark-700 hover:text-white transition-colors"
                      >
                        <Wallet className="w-4 h-4" />
                        Portfolio
                      </Link>
                      <Link
                        href="/leaderboard"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-3 text-dark-300 hover:bg-dark-700 hover:text-white transition-colors"
                      >
                        <Trophy className="w-4 h-4" />
                        Leaderboard
                      </Link>
                      <hr className="border-dark-700" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-dark-700 hover:text-red-300 transition-colors w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        Keluar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link
                href="/auth"
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
              >
                Masuk
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-dark-400 hover:text-white transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="py-4 border-t border-dark-700">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="text"
                placeholder="Cari market..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-dark-800 border border-dark-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-dark-400 focus:outline-none focus:border-primary-500"
                autoFocus
              />
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-dark-700">
            <nav className="flex flex-col space-y-4">
              <Link href="/" onClick={() => setIsMenuOpen(false)} className="text-dark-300 hover:text-white transition-colors">
                Beranda
              </Link>
              <Link href="/kategori/politik" onClick={() => setIsMenuOpen(false)} className="text-dark-300 hover:text-white transition-colors">
                Politik
              </Link>
              <Link href="/kategori/ekonomi" onClick={() => setIsMenuOpen(false)} className="text-dark-300 hover:text-white transition-colors">
                Ekonomi
              </Link>
              <Link href="/kategori/olahraga" onClick={() => setIsMenuOpen(false)} className="text-dark-300 hover:text-white transition-colors">
                Olahraga
              </Link>
              <Link href="/kategori" onClick={() => setIsMenuOpen(false)} className="text-dark-300 hover:text-white transition-colors">
                Semua Kategori
              </Link>
              {isLoggedIn && user ? (
                <div className="pt-4 border-t border-dark-700 space-y-3">
                  <div className="flex items-center space-x-2 text-primary-500">
                    <Wallet className="w-4 h-4" />
                    <span className="font-medium">{formatIDR(user.balance)}</span>
                  </div>
                  <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="block text-dark-300 hover:text-white transition-colors">
                    Profil
                  </Link>
                  <Link href="/portfolio" onClick={() => setIsMenuOpen(false)} className="block text-dark-300 hover:text-white transition-colors">
                    Portfolio
                  </Link>
                  <Link href="/leaderboard" onClick={() => setIsMenuOpen(false)} className="block text-dark-300 hover:text-white transition-colors">
                    Leaderboard
                  </Link>
                  <button onClick={handleLogout} className="text-red-400 hover:text-red-300 transition-colors">
                    Keluar
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-dark-700">
                  <Link
                    href="/auth"
                    onClick={() => setIsMenuOpen(false)}
                    className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Masuk / Daftar
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
