import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'PolyID - Prediction Market Indonesia',
  description: 'Platform prediction market terbesar untuk berita dan event Indonesia. Prediksi politik, ekonomi, olahraga, dan lainnya.',
  keywords: 'prediction market, polymarket, indonesia, politik, ekonomi, olahraga, taruhan, prediksi',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="font-sans bg-dark-950 text-white min-h-screen">
        <Header />
        <main>{children}</main>

        {/* Footer */}
        <footer className="bg-dark-900 border-t border-dark-700 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <span className="text-xl font-bold text-white">
                    Poly<span className="text-primary-500">ID</span>
                  </span>
                </div>
                <p className="text-dark-400 text-sm max-w-md">
                  Platform prediction market terbesar untuk berita dan event Indonesia.
                  Prediksi berbagai topik dari politik, ekonomi, olahraga, hingga hiburan.
                </p>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">Kategori</h4>
                <ul className="space-y-2 text-dark-400 text-sm">
                  <li><a href="/kategori/politik" className="hover:text-white transition-colors">Politik</a></li>
                  <li><a href="/kategori/ekonomi" className="hover:text-white transition-colors">Ekonomi</a></li>
                  <li><a href="/kategori/olahraga" className="hover:text-white transition-colors">Olahraga</a></li>
                  <li><a href="/kategori/hiburan" className="hover:text-white transition-colors">Hiburan</a></li>
                  <li><a href="/kategori/teknologi" className="hover:text-white transition-colors">Teknologi</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">Informasi</h4>
                <ul className="space-y-2 text-dark-400 text-sm">
                  <li><a href="/about" className="hover:text-white transition-colors">Tentang Kami</a></li>
                  <li><a href="/faq" className="hover:text-white transition-colors">FAQ</a></li>
                  <li><a href="/terms" className="hover:text-white transition-colors">Syarat & Ketentuan</a></li>
                  <li><a href="/privacy" className="hover:text-white transition-colors">Kebijakan Privasi</a></li>
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-dark-700 flex flex-col md:flex-row justify-between items-center">
              <p className="text-dark-500 text-sm">
                © 2026 PolyID. Platform ini untuk tujuan edukasi dan hiburan.
              </p>
              <p className="text-dark-500 text-sm mt-2 md:mt-0">
                Dibuat dengan ❤️ di Indonesia
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
