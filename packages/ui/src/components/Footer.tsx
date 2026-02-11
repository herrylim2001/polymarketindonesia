import Link from 'next/link';

export default function Footer() {
  return (
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
              <li><Link href="/kategori/politik" className="hover:text-white transition-colors">Politik</Link></li>
              <li><Link href="/kategori/ekonomi" className="hover:text-white transition-colors">Ekonomi</Link></li>
              <li><Link href="/kategori/olahraga" className="hover:text-white transition-colors">Olahraga</Link></li>
              <li><Link href="/kategori/hiburan" className="hover:text-white transition-colors">Hiburan</Link></li>
              <li><Link href="/kategori/teknologi" className="hover:text-white transition-colors">Teknologi</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Informasi</h4>
            <ul className="space-y-2 text-dark-400 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">Tentang Kami</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Syarat &amp; Ketentuan</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Kebijakan Privasi</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-dark-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-dark-500 text-sm">
            &copy; 2026 PolyID. Platform ini untuk tujuan edukasi dan hiburan.
          </p>
          <p className="text-dark-500 text-sm mt-2 md:mt-0">
            Dibuat di Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}
