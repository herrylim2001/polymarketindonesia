'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Search, Menu, X, Wallet, User, TrendingUp, Bell } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatIDR } from '@/lib/utils';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, isLoggedIn } = useStore();

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
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-dark-400 hover:text-white transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <button className="p-2 text-dark-400 hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full"></span>
            </button>

            {/* User Balance & Profile */}
            {isLoggedIn && user ? (
              <div className="hidden sm:flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-dark-800 rounded-lg px-3 py-2">
                  <Wallet className="w-4 h-4 text-primary-500" />
                  <span className="text-white font-medium text-sm">
                    {formatIDR(user.balance)}
                  </span>
                </div>
                <button className="flex items-center space-x-2 bg-dark-800 rounded-lg px-3 py-2 hover:bg-dark-700 transition-colors">
                  <User className="w-4 h-4 text-dark-400" />
                  <span className="text-white text-sm">{user.username}</span>
                </button>
              </div>
            ) : (
              <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Masuk
              </button>
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="text"
                placeholder="Cari market..."
                className="w-full bg-dark-800 border border-dark-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-dark-400 focus:outline-none focus:border-primary-500"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-dark-700">
            <nav className="flex flex-col space-y-4">
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
              {isLoggedIn && user && (
                <div className="pt-4 border-t border-dark-700">
                  <div className="flex items-center space-x-2 text-primary-500">
                    <Wallet className="w-4 h-4" />
                    <span className="font-medium">{formatIDR(user.balance)}</span>
                  </div>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
