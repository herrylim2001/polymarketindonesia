export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-white mb-2">Kebijakan Privasi</h1>
      <p className="text-dark-500 mb-8">Terakhir diperbarui: 1 Februari 2025</p>

      <div className="space-y-8">
        {[
          {
            title: '1. Informasi yang Kami Kumpulkan',
            content: (
              <ul className="list-disc list-inside space-y-2 text-dark-400">
                <li>Informasi akun: nama, email, nomor telepon</li>
                <li>Informasi verifikasi: KTP, selfie untuk KYC</li>
                <li>Data transaksi: deposit, withdrawal, riwayat trading</li>
                <li>Data penggunaan: halaman yang dikunjungi, fitur yang digunakan</li>
                <li>Informasi perangkat: IP address, browser, sistem operasi</li>
                <li>Cookies dan teknologi pelacakan serupa</li>
              </ul>
            ),
          },
          {
            title: '2. Penggunaan Informasi',
            content: (
              <ul className="list-disc list-inside space-y-2 text-dark-400">
                <li>Menyediakan dan memelihara layanan Platform</li>
                <li>Memproses transaksi dan mengelola akun Anda</li>
                <li>Mengirim notifikasi tentang aktivitas akun</li>
                <li>Mencegah penipuan dan aktivitas ilegal</li>
                <li>Mematuhi kewajiban hukum dan regulasi</li>
                <li>Meningkatkan pengalaman pengguna dan fitur Platform</li>
                <li>Mengirim komunikasi pemasaran (dengan persetujuan Anda)</li>
              </ul>
            ),
          },
          {
            title: '3. Pembagian Informasi',
            content: (
              <div className="text-dark-400 space-y-3">
                <p>
                  Kami tidak menjual informasi pribadi Anda. Kami dapat membagikan informasi kepada:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Penyedia layanan pihak ketiga yang membantu operasi kami</li>
                  <li>Lembaga keuangan untuk memproses pembayaran</li>
                  <li>Otoritas hukum jika diwajibkan oleh hukum</li>
                  <li>Pihak ketiga dalam konteks merger atau akuisisi</li>
                </ul>
              </div>
            ),
          },
          {
            title: '4. Keamanan Data',
            content: (
              <p className="text-dark-400">
                Kami menggunakan enkripsi SSL/TLS untuk melindungi data dalam transmisi. Data
                sensitif disimpan dengan enkripsi di server kami. Kami menerapkan kontrol akses ketat
                dan melakukan audit keamanan secara berkala. Meskipun demikian, tidak ada sistem yang
                100% aman, dan kami tidak dapat menjamin keamanan absolut.
              </p>
            ),
          },
          {
            title: '5. Hak Pengguna',
            content: (
              <ul className="list-disc list-inside space-y-2 text-dark-400">
                <li>Mengakses dan mendapatkan salinan data pribadi Anda</li>
                <li>Memperbarui atau memperbaiki informasi yang tidak akurat</li>
                <li>Meminta penghapusan data pribadi Anda</li>
                <li>Menolak pemrosesan data untuk tujuan pemasaran</li>
                <li>Menarik persetujuan yang telah diberikan</li>
                <li>Mengajukan keluhan kepada otoritas perlindungan data</li>
              </ul>
            ),
          },
          {
            title: '6. Cookies',
            content: (
              <div className="text-dark-400 space-y-3">
                <p>Kami menggunakan cookies untuk:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Menjaga sesi login Anda</li>
                  <li>Menyimpan preferensi pengguna</li>
                  <li>Menganalisis penggunaan Platform</li>
                  <li>Meningkatkan performa dan keamanan</li>
                </ul>
                <p>Anda dapat mengatur preferensi cookies melalui pengaturan browser Anda.</p>
              </div>
            ),
          },
          {
            title: '7. Retensi Data',
            content: (
              <p className="text-dark-400">
                Kami menyimpan data pribadi Anda selama akun Anda aktif atau selama diperlukan untuk
                menyediakan layanan. Data transaksi disimpan sesuai kewajiban hukum (minimal 5
                tahun). Setelah akun dihapus, data akan dianonymisasi atau dihapus dalam 30 hari
                kerja, kecuali yang diwajibkan oleh hukum.
              </p>
            ),
          },
          {
            title: '8. Perubahan Kebijakan',
            content: (
              <p className="text-dark-400">
                Kami dapat memperbarui kebijakan privasi ini dari waktu ke waktu. Perubahan material
                akan diberitahukan melalui email atau notifikasi di Platform. Tanggal pembaruan
                terakhir akan ditampilkan di bagian atas halaman ini.
              </p>
            ),
          },
          {
            title: '9. Kontak',
            content: (
              <div className="text-dark-400 space-y-2">
                <p>Untuk pertanyaan tentang kebijakan privasi ini, hubungi:</p>
                <p>Email: privacy@polyid.co.id</p>
                <p>Alamat: Jakarta, Indonesia</p>
              </div>
            ),
          },
        ].map((section) => (
          <div key={section.title} className="bg-dark-800 rounded-xl border border-dark-700 p-6">
            <h2 className="text-xl font-bold text-white mb-3">{section.title}</h2>
            {section.content}
          </div>
        ))}
      </div>
    </div>
  );
}
