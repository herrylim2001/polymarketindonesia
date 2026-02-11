'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const faqs = [
  {
    category: 'Umum',
    items: [
      {
        q: 'Apa itu PolyID?',
        a: 'PolyID adalah platform prediction market Indonesia yang memungkinkan pengguna membeli dan menjual shares berdasarkan prediksi mereka tentang event di masa depan. Harga shares mencerminkan probabilitas yang diyakini oleh pasar.',
      },
      {
        q: 'Apakah PolyID legal?',
        a: 'PolyID beroperasi sebagai platform prediksi berbasis informasi. Kami terus memantau dan mematuhi regulasi yang berlaku di Indonesia. Platform ini dirancang untuk tujuan edukasi dan hiburan.',
      },
      {
        q: 'Bagaimana cara mendaftar?',
        a: 'Klik tombol "Daftar" di halaman utama, isi email dan password, lalu verifikasi akun Anda. Anda akan mendapatkan bonus saldo awal untuk mulai trading.',
      },
    ],
  },
  {
    category: 'Trading & Odds',
    items: [
      {
        q: 'Bagaimana cara kerja odds?',
        a: 'Odds ditentukan oleh sistem Automated Market Maker (AMM) yang menyesuaikan harga berdasarkan aktivitas trading. Semakin banyak orang membeli outcome tertentu, semakin tinggi harganya (probabilitas naik). Setiap share bernilai antara Rp 0 - Rp 1.000.',
      },
      {
        q: 'Apa itu shares?',
        a: 'Shares adalah unit yang Anda beli saat memprediksi outcome. Jika prediksi Anda benar, setiap share bernilai penuh (Rp 1.000). Jika salah, share menjadi tidak bernilai. Harga beli share mencerminkan probabilitas pasar.',
      },
      {
        q: 'Berapa minimum dan maksimum taruhan?',
        a: 'Minimum taruhan adalah Rp 10.000 dan maksimum taruhan per transaksi adalah Rp 10.000.000. Tidak ada batasan jumlah total taruhan per akun.',
      },
      {
        q: 'Apa itu price impact?',
        a: 'Price impact adalah perubahan harga yang terjadi akibat transaksi Anda. Taruhan besar pada market dengan likuiditas rendah akan memiliki price impact yang lebih besar.',
      },
      {
        q: 'Bisakah saya menjual shares sebelum market selesai?',
        a: 'Ya, Anda dapat menjual shares kapan saja sebelum market di-resolve. Harga jual ditentukan oleh kondisi pasar saat itu.',
      },
    ],
  },
  {
    category: 'Deposit & Withdraw',
    items: [
      {
        q: 'Bagaimana cara deposit?',
        a: 'Anda dapat melakukan deposit melalui transfer bank, e-wallet (GoPay, OVO, Dana), atau virtual account. Deposit akan diproses dalam waktu 1-5 menit.',
      },
      {
        q: 'Bagaimana cara withdraw?',
        a: 'Buka halaman Portfolio, klik "Withdraw", masukkan jumlah dan pilih metode pembayaran. Withdrawal diproses dalam 1x24 jam kerja.',
      },
      {
        q: 'Apakah ada biaya transaksi?',
        a: 'PolyID mengenakan fee sebesar 2% dari profit yang Anda dapatkan saat market resolve. Tidak ada biaya untuk deposit atau withdraw.',
      },
    ],
  },
  {
    category: 'Resolusi Market',
    items: [
      {
        q: 'Bagaimana market di-resolve?',
        a: 'Market di-resolve berdasarkan sumber data resmi dan terpercaya yang telah ditentukan sebelumnya. Tim kami memverifikasi hasil dan memproses resolusi secepat mungkin setelah event terjadi.',
      },
      {
        q: 'Apa yang terjadi jika market dibatalkan?',
        a: 'Jika market dibatalkan karena alasan tertentu, semua taruhan akan dikembalikan penuh ke saldo masing-masing pengguna.',
      },
      {
        q: 'Berapa lama payout setelah market resolve?',
        a: 'Payout otomatis diproses segera setelah market di-resolve. Saldo akan masuk ke akun Anda dalam hitungan detik.',
      },
    ],
  },
  {
    category: 'Akun & Keamanan',
    items: [
      {
        q: 'Bagaimana cara mengamankan akun saya?',
        a: 'Gunakan password yang kuat, aktifkan two-factor authentication (2FA), dan jangan pernah bagikan informasi login Anda kepada siapapun.',
      },
      {
        q: 'Apa yang harus dilakukan jika lupa password?',
        a: 'Klik "Lupa Password" di halaman login, masukkan email terdaftar, dan ikuti instruksi di email untuk reset password Anda.',
      },
    ],
  },
];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (key: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <HelpCircle className="w-12 h-12 text-primary-500 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-white mb-4">
          Pertanyaan yang Sering Diajukan
        </h1>
        <p className="text-dark-400 text-lg max-w-2xl mx-auto">
          Temukan jawaban untuk pertanyaan umum tentang PolyID.
        </p>
      </div>

      <div className="space-y-8">
        {faqs.map((section) => (
          <div key={section.category}>
            <h2 className="text-xl font-bold text-white mb-4">
              {section.category}
            </h2>
            <div className="space-y-2">
              {section.items.map((item, idx) => {
                const key = `${section.category}-${idx}`;
                const isOpen = openItems.has(key);
                return (
                  <div
                    key={key}
                    className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleItem(key)}
                      className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-dark-700/50 transition-colors"
                    >
                      <span className="text-white font-medium pr-4">
                        {item.q}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-dark-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-dark-400 flex-shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-4 text-dark-400 text-sm leading-relaxed">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-dark-800 rounded-xl border border-dark-700 p-8 text-center">
        <h3 className="text-xl font-bold text-white mb-2">
          Masih punya pertanyaan?
        </h3>
        <p className="text-dark-400 mb-4">
          Hubungi tim support kami untuk bantuan lebih lanjut.
        </p>
        <a
          href="mailto:support@polyid.co.id"
          className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Hubungi Support
        </a>
      </div>
    </div>
  );
}
