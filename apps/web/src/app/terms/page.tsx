export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-white mb-2">Syarat & Ketentuan</h1>
      <p className="text-dark-500 mb-8">Terakhir diperbarui: 1 Februari 2025</p>

      <div className="prose prose-invert max-w-none space-y-8">
        {[
          {
            title: '1. Penerimaan Syarat',
            content:
              'Dengan mengakses dan menggunakan platform PolyID ("Platform"), Anda menyetujui dan terikat dengan syarat dan ketentuan ini. Jika Anda tidak menyetujui syarat ini, mohon untuk tidak menggunakan Platform.',
          },
          {
            title: '2. Kelayakan',
            content:
              'Anda harus berusia minimal 18 tahun dan merupakan warga negara atau penduduk Indonesia untuk menggunakan Platform. Anda bertanggung jawab untuk memastikan bahwa penggunaan Platform sesuai dengan hukum yang berlaku di wilayah Anda.',
          },
          {
            title: '3. Akun Pengguna',
            content:
              'Anda bertanggung jawab untuk menjaga kerahasiaan kredensial akun Anda. Setiap aktivitas yang terjadi melalui akun Anda menjadi tanggung jawab Anda. Anda wajib memberikan informasi yang akurat saat mendaftar dan memperbarui informasi tersebut jika ada perubahan. PolyID berhak menangguhkan atau menutup akun yang melanggar ketentuan ini.',
          },
          {
            title: '4. Prediction Markets',
            content:
              'PolyID menyediakan platform prediction market di mana pengguna dapat membeli dan menjual shares berdasarkan prediksi outcome event. Harga shares ditentukan oleh mekanisme pasar otomatis (AMM). PolyID tidak menjamin keakuratan probabilitas yang ditampilkan. Hasil trading bergantung pada keputusan Anda sendiri.',
          },
          {
            title: '5. Deposit dan Withdrawal',
            content:
              'Deposit dapat dilakukan melalui metode pembayaran yang tersedia di Platform. Withdrawal diproses dalam 1x24 jam kerja. PolyID berhak meminta verifikasi identitas sebelum memproses withdrawal. Minimum withdrawal adalah Rp 50.000.',
          },
          {
            title: '6. Biaya',
            content:
              'PolyID mengenakan biaya sebesar 2% dari profit yang diperoleh pengguna saat market di-resolve. Biaya ini dapat berubah dengan pemberitahuan sebelumnya. Tidak ada biaya untuk deposit atau withdrawal.',
          },
          {
            title: '7. Resolusi Market',
            content:
              'Market di-resolve berdasarkan sumber data resmi yang telah ditentukan. Keputusan resolusi bersifat final. Jika market dibatalkan, semua taruhan dikembalikan penuh. PolyID berhak membatalkan market jika ditemukan manipulasi atau kondisi force majeure.',
          },
          {
            title: '8. Larangan',
            content:
              'Pengguna dilarang: (a) Memanipulasi pasar dengan cara apapun; (b) Menggunakan bot atau software otomatis tanpa izin; (c) Membuat akun ganda; (d) Melakukan money laundering; (e) Menyalahgunakan bug atau kerentanan sistem; (f) Melanggar hukum yang berlaku.',
          },
          {
            title: '9. Pembatasan Tanggung Jawab',
            content:
              'PolyID tidak bertanggung jawab atas kerugian yang timbul dari penggunaan Platform, termasuk namun tidak terbatas pada kerugian trading. Platform disediakan "sebagaimana adanya" tanpa jaminan apapun. PolyID tidak bertanggung jawab atas gangguan teknis atau force majeure.',
          },
          {
            title: '10. Perubahan Ketentuan',
            content:
              'PolyID berhak mengubah syarat dan ketentuan ini kapan saja. Perubahan akan diberitahukan melalui email atau notifikasi di Platform. Penggunaan Platform setelah perubahan dianggap sebagai persetujuan Anda terhadap ketentuan yang diperbarui.',
          },
          {
            title: '11. Hukum yang Berlaku',
            content:
              'Syarat dan ketentuan ini diatur oleh hukum Republik Indonesia. Setiap sengketa akan diselesaikan melalui musyawarah, dan jika tidak tercapai kesepakatan, melalui pengadilan yang berwenang di Indonesia.',
          },
          {
            title: '12. Kontak',
            content:
              'Jika Anda memiliki pertanyaan tentang syarat dan ketentuan ini, silakan hubungi kami di legal@polyid.co.id.',
          },
        ].map((section) => (
          <div key={section.title} className="bg-dark-800 rounded-xl border border-dark-700 p-6">
            <h2 className="text-xl font-bold text-white mb-3">{section.title}</h2>
            <p className="text-dark-400 leading-relaxed">{section.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
