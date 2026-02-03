import { TrendingUp, Users, BarChart3, Shield, Globe, Zap } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Tentang PolyID</h1>
        <p className="text-dark-400 text-lg max-w-2xl mx-auto">
          Platform prediction market pertama di Indonesia yang memungkinkan Anda memprediksi dan mendapatkan profit dari berbagai event.
        </p>
      </div>

      <div className="bg-dark-800 rounded-xl border border-dark-700 p-8 mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Apa itu PolyID?</h2>
        <div className="text-dark-400 space-y-4">
          <p>
            PolyID adalah platform prediction market yang memungkinkan pengguna untuk membeli dan menjual shares berdasarkan prediksi mereka tentang event di masa depan. Setiap event memiliki beberapa kemungkinan outcome, dan harga shares mencerminkan probabilitas yang diyakini oleh pasar.
          </p>
          <p>
            Jika prediksi Anda benar, shares Anda akan bernilai penuh. Jika salah, shares menjadi tidak bernilai. Ini menciptakan insentif bagi pengguna untuk melakukan riset dan membuat prediksi yang akurat.
          </p>
          <p>
            Kami fokus pada berita dan event di Indonesia, mencakup politik, ekonomi, olahraga, hiburan, teknologi, dan topik-topik lainnya yang relevan dengan masyarakat Indonesia.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { icon: BarChart3, title: 'Market-Based Pricing', desc: 'Harga ditentukan oleh pasar, bukan oleh kami. Sistem AMM otomatis menyesuaikan odds berdasarkan aktivitas trading.' },
          { icon: Shield, title: 'Transparan', desc: 'Semua transaksi tercatat dan dapat diverifikasi. Resolusi market dilakukan berdasarkan sumber data yang terpercaya.' },
          { icon: Zap, title: 'Real-Time', desc: 'Odds berubah secara real-time berdasarkan informasi terbaru dan aktivitas pasar.' },
        ].map((item, i) => (
          <div key={i} className="bg-dark-800 rounded-xl border border-dark-700 p-6">
            <item.icon className="w-10 h-10 text-primary-500 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
            <p className="text-dark-400 text-sm">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-dark-800 rounded-xl border border-dark-700 p-8 mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Cara Kerja</h2>
        <div className="space-y-6">
          {[
            { step: '1', title: 'Pilih Market', desc: 'Jelajahi berbagai prediction market tentang event Indonesia yang tersedia.' },
            { step: '2', title: 'Beli Shares', desc: 'Pilih outcome yang Anda yakini dan beli shares. Harga shares mencerminkan probabilitas pasar.' },
            { step: '3', title: 'Tunggu Resolusi', desc: 'Setelah event terjadi, market akan di-resolve berdasarkan hasil aktual.' },
            { step: '4', title: 'Klaim Profit', desc: 'Jika prediksi Anda benar, setiap share bernilai penuh dan Anda mendapat profit.' },
          ].map(item => (
            <div key={item.step} className="flex gap-4">
              <div className="w-10 h-10 bg-primary-500/20 text-primary-500 rounded-xl flex items-center justify-center flex-shrink-0 font-bold">
                {item.step}
              </div>
              <div>
                <h3 className="text-white font-semibold">{item.title}</h3>
                <p className="text-dark-400 text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Mulai Prediksi Sekarang</h2>
        <p className="text-primary-100 mb-6">Daftar gratis dan dapatkan bonus saldo Rp 10.000.000</p>
        <a href="/auth" className="inline-block bg-white text-primary-700 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors">
          Daftar Sekarang
        </a>
      </div>
    </div>
  );
}
