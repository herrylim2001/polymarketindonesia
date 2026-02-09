'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  LineChart,
  List,
  PlusCircle,
  Users,
  Receipt,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Calculator,
  Shield,
} from 'lucide-react';
import AdminGuard from '@/components/AdminGuard';

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/markets', label: 'Markets', icon: List },
  { href: '/admin/markets/new', label: 'Tambah Market', icon: PlusCircle },
  { href: '/admin/odds-calculator', label: 'Kalkulator Odds', icon: Calculator },
  { href: '/admin/transactions', label: 'Transaksi', icon: Receipt },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/reports', label: 'Laporan', icon: LineChart },
  { href: '/admin/settings', label: 'Pengaturan', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    sessionStorage.removeItem('adminUsername');
    router.push('/admin/login');
  };

  // If on login page, don't show sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <AdminGuard>
    <div className="min-h-screen bg-dark-950">
      {/* Mobile Header */}
      <div className="lg:hidden bg-dark-900 border-b border-dark-700 px-4 py-3 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold">PolyID Admin</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-dark-400 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-dark-950/95 pt-16">
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-dark-300 hover:bg-dark-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <hr className="border-dark-700 my-4" />
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-dark-300 hover:bg-dark-800 hover:text-white"
            >
              <LogOut className="w-5 h-5" />
              <span>Kembali ke Situs</span>
            </Link>
            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-dark-800 hover:text-red-300 w-full text-left"
            >
              <Shield className="w-5 h-5" />
              <span>Logout Admin</span>
            </button>
          </nav>
        </div>
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden lg:flex flex-col bg-dark-900 border-r border-dark-700 min-h-screen transition-all duration-300 ${
            sidebarCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          {/* Logo */}
          <div className="p-4 border-b border-dark-700">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              {!sidebarCollapsed && (
                <div>
                  <span className="text-white font-bold text-lg">PolyID</span>
                  <p className="text-dark-500 text-xs">Admin Panel</p>
                </div>
              )}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-dark-300 hover:bg-dark-800 hover:text-white'
                  } ${sidebarCollapsed ? 'justify-center' : ''}`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-dark-700 space-y-2">
            <Link
              href="/"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-dark-300 hover:bg-dark-800 hover:text-white transition-colors ${
                sidebarCollapsed ? 'justify-center' : ''
              }`}
              title={sidebarCollapsed ? 'Kembali ke Situs' : undefined}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span>Kembali ke Situs</span>}
            </Link>

            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-dark-800 hover:text-red-300 transition-colors w-full ${
                sidebarCollapsed ? 'justify-center' : ''
              }`}
              title={sidebarCollapsed ? 'Logout Admin' : undefined}
            >
              <Shield className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span>Logout Admin</span>}
            </button>

            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-dark-400 hover:bg-dark-800 hover:text-white transition-colors w-full ${
                sidebarCollapsed ? 'justify-center' : ''
              }`}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <>
                  <ChevronLeft className="w-5 h-5" />
                  <span>Collapse</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          {children}
        </main>
      </div>
    </div>
    </AdminGuard>
  );
}
