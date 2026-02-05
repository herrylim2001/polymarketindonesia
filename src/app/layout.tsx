import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
        <Footer />
      </body>
    </html>
  );
}
