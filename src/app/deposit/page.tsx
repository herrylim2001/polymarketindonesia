'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Wallet, Building2, Smartphone, QrCode, ChevronRight,
  Copy, Check, Clock, AlertCircle, ArrowLeft, Shield, Zap, ExternalLink
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { BANKS, EWALLETS, CRYPTOCURRENCIES, PaymentMethod, BankCode, EwalletCode, CryptoCode, Transaction, UniwireInvoice } from '@/types';
import { formatIDR } from '@/lib/utils';
import { createCryptoInvoice, formatCryptoAmount, getCryptoSymbol, getEstimatedConfirmationTime, getNetworkFeeEstimate, convertIDRToCrypto } from '@/lib/uniwire';

const PRESET_AMOUNTS = [50000, 100000, 250000, 500000, 1000000, 2500000];

type Step = 'amount' | 'method' | 'payment' | 'confirmation';

export default function DepositPage() {
  const router = useRouter();
  const { user, isLoggedIn, createDeposit, confirmDeposit } = useStore();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>('amount');
  const [amount, setAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [selectedBank, setSelectedBank] = useState<BankCode | null>(null);
  const [selectedEwallet, setSelectedEwallet] = useState<EwalletCode | null>(null);
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoCode | null>(null);
  const [cryptoInvoice, setCryptoInvoice] = useState<UniwireInvoice | null>(null);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoggedIn) {
      router.push('/auth');
    }
  }, [mounted, isLoggedIn, router]);

  // Countdown timer for payment expiration
  useEffect(() => {
    if (!transaction?.expiresAt) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const expires = new Date(transaction.expiresAt!).getTime();
      const diff = expires - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [transaction?.expiresAt]);

  if (!mounted || !isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse h-96 w-full max-w-md bg-dark-800 rounded-xl" />
      </div>
    );
  }

  const handleAmountSelect = (value: number) => {
    setAmount(value);
    setCustomAmount('');
  };

  const handleCustomAmount = (value: string) => {
    const num = parseInt(value.replace(/\D/g, ''), 10);
    setCustomAmount(value);
    setAmount(isNaN(num) ? 0 : num);
  };

  const handleCopyVA = async () => {
    if (!transaction?.virtualAccountNumber) return;
    try {
      await navigator.clipboard.writeText(transaction.virtualAccountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyAddress = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCreateTransaction = async () => {
    if (amount < 10000) return;

    // Handle crypto payment
    if (paymentMethod === 'crypto' && selectedCrypto) {
      setIsCreatingInvoice(true);
      try {
        const invoice = await createCryptoInvoice(amount, selectedCrypto);
        setCryptoInvoice(invoice);

        const tx = createDeposit(
          amount,
          'crypto',
          undefined,
          undefined,
          selectedCrypto
        );
        setTransaction(tx);
        setStep('payment');
      } catch (error) {
        console.error('Failed to create crypto invoice:', error);
      } finally {
        setIsCreatingInvoice(false);
      }
      return;
    }

    // Handle other payment methods
    const tx = createDeposit(
      amount,
      paymentMethod!,
      selectedBank || undefined,
      selectedEwallet || undefined
    );
    setTransaction(tx);
    setStep('payment');
  };

  const handleConfirmPayment = () => {
    if (!transaction) return;
    confirmDeposit(transaction.id);
    setStep('confirmation');
  };

  const getSelectedBankInfo = () => BANKS.find(b => b.code === selectedBank);
  const getSelectedEwalletInfo = () => EWALLETS.find(e => e.code === selectedEwallet);
  const getSelectedCryptoInfo = () => CRYPTOCURRENCIES.find(c => c.code === selectedCrypto);

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {['amount', 'method', 'payment', 'confirmation'].map((s, i) => (
        <div key={s} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            step === s ? 'bg-primary-600 text-white' :
            ['amount', 'method', 'payment', 'confirmation'].indexOf(step) > i ?
            'bg-green-600 text-white' : 'bg-dark-700 text-dark-400'
          }`}>
            {i + 1}
          </div>
          {i < 3 && <div className={`w-8 h-0.5 ${
            ['amount', 'method', 'payment', 'confirmation'].indexOf(step) > i ?
            'bg-green-600' : 'bg-dark-700'
          }`} />}
        </div>
      ))}
    </div>
  );

  const renderAmountStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Wallet className="w-12 h-12 text-primary-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Deposit Dana</h1>
        <p className="text-dark-400">Pilih atau masukkan jumlah deposit</p>
      </div>

      <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
        <p className="text-dark-400 text-sm mb-1">Saldo Saat Ini</p>
        <p className="text-2xl font-bold text-white">{formatIDR(user?.balance || 0)}</p>
      </div>

      <div>
        <label className="block text-dark-300 text-sm font-medium mb-3">Pilih Nominal</label>
        <div className="grid grid-cols-3 gap-3">
          {PRESET_AMOUNTS.map(preset => (
            <button
              key={preset}
              onClick={() => handleAmountSelect(preset)}
              className={`py-3 px-4 rounded-xl font-medium transition-all ${
                amount === preset && !customAmount
                  ? 'bg-primary-600 text-white ring-2 ring-primary-500'
                  : 'bg-dark-700 text-white hover:bg-dark-600'
              }`}
            >
              {formatIDR(preset)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-dark-300 text-sm font-medium mb-2">Atau Masukkan Nominal Lain</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400">Rp</span>
          <input
            type="text"
            value={customAmount}
            onChange={(e) => handleCustomAmount(e.target.value)}
            placeholder="0"
            className="w-full bg-dark-700 border border-dark-600 rounded-xl py-3 pl-12 pr-4 text-white text-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <p className="text-dark-500 text-xs mt-2">Minimum deposit Rp 10.000</p>
      </div>

      <button
        onClick={() => setStep('method')}
        disabled={amount < 10000}
        className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-dark-700 disabled:text-dark-500 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        Lanjutkan
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );

  const renderMethodStep = () => (
    <div className="space-y-6">
      <button onClick={() => setStep('amount')} className="flex items-center gap-2 text-dark-400 hover:text-white">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Pilih Metode Pembayaran</h1>
        <p className="text-dark-400">Deposit sebesar <span className="text-primary-400 font-semibold">{formatIDR(amount)}</span></p>
      </div>

      {/* Virtual Account / Bank Transfer */}
      <div>
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-400" />
          Transfer Bank / Virtual Account
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {BANKS.map(bank => (
            <button
              key={bank.code}
              onClick={() => {
                setPaymentMethod('virtual_account');
                setSelectedBank(bank.code);
                setSelectedEwallet(null);
              }}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                selectedBank === bank.code
                  ? 'bg-primary-600/20 border-primary-500'
                  : 'bg-dark-800 border-dark-700 hover:border-dark-500'
              }`}
            >
              <div className={`w-10 h-10 ${bank.color} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                {bank.shortName.slice(0, 3)}
              </div>
              <div className="text-left">
                <p className="text-white font-medium text-sm">{bank.shortName}</p>
                <p className="text-dark-400 text-xs">Virtual Account</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* E-Wallets */}
      <div>
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-green-400" />
          E-Wallet
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {EWALLETS.map(ewallet => (
            <button
              key={ewallet.code}
              onClick={() => {
                setPaymentMethod('ewallet');
                setSelectedEwallet(ewallet.code);
                setSelectedBank(null);
              }}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                selectedEwallet === ewallet.code
                  ? 'bg-primary-600/20 border-primary-500'
                  : 'bg-dark-800 border-dark-700 hover:border-dark-500'
              }`}
            >
              <div className={`w-10 h-10 ${ewallet.color} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                {ewallet.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-white font-medium text-sm">{ewallet.name}</p>
                <p className="text-dark-400 text-xs">E-Wallet</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* QRIS */}
      <div>
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <QrCode className="w-5 h-5 text-purple-400" />
          QRIS
        </h3>
        <button
          onClick={() => {
            setPaymentMethod('qris');
            setSelectedBank(null);
            setSelectedEwallet(null);
            setSelectedCrypto(null);
          }}
          className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${
            paymentMethod === 'qris'
              ? 'bg-primary-600/20 border-primary-500'
              : 'bg-dark-800 border-dark-700 hover:border-dark-500'
          }`}
        >
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <p className="text-white font-medium">QRIS</p>
            <p className="text-dark-400 text-xs">Scan dengan aplikasi e-wallet manapun</p>
          </div>
        </button>
      </div>

      {/* Crypto - Powered by Uniwire */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-400" />
            Cryptocurrency
          </h3>
          <a
            href="https://uniwire.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-dark-400 hover:text-primary-400 flex items-center gap-1"
          >
            Powered by Uniwire <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {CRYPTOCURRENCIES.slice(0, 8).map(crypto => (
            <button
              key={crypto.code}
              onClick={() => {
                setPaymentMethod('crypto');
                setSelectedCrypto(crypto.code);
                setSelectedBank(null);
                setSelectedEwallet(null);
              }}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                selectedCrypto === crypto.code
                  ? 'bg-primary-600/20 border-primary-500'
                  : 'bg-dark-800 border-dark-700 hover:border-dark-500'
              }`}
            >
              <div className={`w-10 h-10 ${crypto.color} rounded-lg flex items-center justify-center text-white font-bold text-lg`}>
                {crypto.icon}
              </div>
              <div className="text-left min-w-0">
                <p className="text-white font-medium text-sm truncate">{crypto.symbol}</p>
                <p className="text-dark-400 text-xs truncate">{crypto.networkName}</p>
              </div>
            </button>
          ))}
        </div>
        {selectedCrypto && (
          <div className="mt-3 bg-dark-900 rounded-xl p-3 border border-dark-700">
            <div className="flex justify-between text-sm">
              <span className="text-dark-400">Estimasi jumlah:</span>
              <span className="text-white font-mono">
                {formatCryptoAmount(convertIDRToCrypto(amount, selectedCrypto), selectedCrypto)} {getCryptoSymbol(selectedCrypto)}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-dark-400">Waktu konfirmasi:</span>
              <span className="text-white">{getEstimatedConfirmationTime(selectedCrypto)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-dark-400">Network fee:</span>
              <span className="text-white">{getNetworkFeeEstimate(selectedCrypto)}</span>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleCreateTransaction}
        disabled={!paymentMethod || isCreatingInvoice}
        className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-dark-700 disabled:text-dark-500 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        {isCreatingInvoice ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Membuat Invoice...
          </>
        ) : (
          <>
            Lanjutkan ke Pembayaran
            <ChevronRight className="w-5 h-5" />
          </>
        )}
      </button>
    </div>
  );

  const renderPaymentStep = () => {
    const bankInfo = getSelectedBankInfo();
    const ewalletInfo = getSelectedEwalletInfo();
    const cryptoInfo = getSelectedCryptoInfo();

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Selesaikan Pembayaran</h1>
          <div className="flex items-center justify-center gap-2 text-amber-400">
            <Clock className="w-4 h-4" />
            <span className="font-mono">{timeLeft}</span>
          </div>
        </div>

        {/* Payment Details Card */}
        <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
          <div className="p-4 border-b border-dark-700">
            <p className="text-dark-400 text-sm">Total Pembayaran</p>
            <p className="text-3xl font-bold text-white">{formatIDR(amount)}</p>
            {paymentMethod === 'crypto' && cryptoInvoice && (
              <p className="text-lg text-primary-400 font-mono mt-1">
                {formatCryptoAmount(cryptoInvoice.amountCrypto, selectedCrypto!)} {cryptoInvoice.currency}
              </p>
            )}
          </div>

          {/* Virtual Account Number */}
          {paymentMethod === 'virtual_account' && bankInfo && (
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 ${bankInfo.color} rounded-xl flex items-center justify-center text-white font-bold`}>
                  {bankInfo.shortName.slice(0, 3)}
                </div>
                <div>
                  <p className="text-white font-semibold">{bankInfo.name}</p>
                  <p className="text-dark-400 text-sm">Virtual Account</p>
                </div>
              </div>

              <div className="bg-dark-900 rounded-xl p-4">
                <p className="text-dark-400 text-sm mb-1">Nomor Virtual Account</p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-mono font-bold text-white tracking-wider">
                    {transaction?.virtualAccountNumber}
                  </p>
                  <button
                    onClick={handleCopyVA}
                    className="p-2 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
                  >
                    {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-dark-300" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* E-Wallet */}
          {paymentMethod === 'ewallet' && ewalletInfo && (
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 ${ewalletInfo.color} rounded-xl flex items-center justify-center text-white font-bold`}>
                  {ewalletInfo.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-semibold">{ewalletInfo.name}</p>
                  <p className="text-dark-400 text-sm">E-Wallet</p>
                </div>
              </div>
              <p className="text-dark-300 text-sm">
                Buka aplikasi {ewalletInfo.name} Anda dan scan QR code atau klik tombol bayar untuk melanjutkan.
              </p>
            </div>
          )}

          {/* QRIS */}
          {paymentMethod === 'qris' && (
            <div className="p-4 text-center">
              <div className="bg-white p-4 rounded-xl inline-block mb-4">
                <div className="w-48 h-48 bg-dark-200 flex items-center justify-center">
                  <QrCode className="w-32 h-32 text-dark-800" />
                </div>
              </div>
              <p className="text-dark-300 text-sm">
                Scan QR code dengan aplikasi e-wallet atau mobile banking Anda
              </p>
            </div>
          )}

          {/* Crypto Payment */}
          {paymentMethod === 'crypto' && cryptoInfo && cryptoInvoice && (
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 ${cryptoInfo.color} rounded-xl flex items-center justify-center text-white font-bold text-xl`}>
                  {cryptoInfo.icon}
                </div>
                <div>
                  <p className="text-white font-semibold">{cryptoInfo.name}</p>
                  <p className="text-dark-400 text-sm">{cryptoInfo.networkName}</p>
                </div>
              </div>

              {/* Crypto Amount */}
              <div className="bg-dark-900 rounded-xl p-4 mb-4">
                <p className="text-dark-400 text-sm mb-1">Jumlah yang harus dikirim</p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-mono font-bold text-white">
                    {formatCryptoAmount(cryptoInvoice.amountCrypto, selectedCrypto!)} {cryptoInvoice.currency}
                  </p>
                  <button
                    onClick={() => handleCopyAddress(cryptoInvoice.amountCrypto.toString())}
                    className="p-2 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
                  >
                    {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-dark-300" />}
                  </button>
                </div>
              </div>

              {/* QR Code */}
              {cryptoInvoice.qrCodeUrl && (
                <div className="flex justify-center mb-4">
                  <div className="bg-white p-3 rounded-xl">
                    <img
                      src={cryptoInvoice.qrCodeUrl}
                      alt="QR Code"
                      className="w-40 h-40"
                    />
                  </div>
                </div>
              )}

              {/* Wallet Address */}
              <div className="bg-dark-900 rounded-xl p-4">
                <p className="text-dark-400 text-sm mb-1">
                  {cryptoInfo.isLightning ? 'Lightning Invoice' : 'Alamat Wallet'}
                </p>
                <div className="flex items-start gap-2">
                  <p className="text-sm font-mono text-white break-all flex-1">
                    {cryptoInfo.isLightning && cryptoInvoice.lightningInvoice
                      ? cryptoInvoice.lightningInvoice
                      : cryptoInvoice.address}
                  </p>
                  <button
                    onClick={() => handleCopyAddress(
                      cryptoInfo.isLightning && cryptoInvoice.lightningInvoice
                        ? cryptoInvoice.lightningInvoice
                        : cryptoInvoice.address
                    )}
                    className="p-2 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors flex-shrink-0"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-dark-300" />}
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-dark-400">Network:</span>
                  <span className="text-white">{cryptoInfo.networkName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Konfirmasi:</span>
                  <span className="text-white">{cryptoInfo.confirmations} konfirmasi</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Est. waktu:</span>
                  <span className="text-white">{getEstimatedConfirmationTime(selectedCrypto!)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-4">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            Cara Pembayaran
          </h3>
          <ol className="space-y-2 text-dark-300 text-sm list-decimal list-inside">
            {paymentMethod === 'virtual_account' && (
              <>
                <li>Buka aplikasi mobile banking atau ATM {bankInfo?.shortName}</li>
                <li>Pilih menu Transfer atau Virtual Account</li>
                <li>Masukkan nomor VA: <span className="text-white font-mono">{transaction?.virtualAccountNumber}</span></li>
                <li>Periksa detail dan konfirmasi pembayaran</li>
                <li>Simpan bukti pembayaran</li>
              </>
            )}
            {paymentMethod === 'ewallet' && (
              <>
                <li>Buka aplikasi {ewalletInfo?.name} Anda</li>
                <li>Scan QR code atau klik tombol bayar</li>
                <li>Periksa detail pembayaran</li>
                <li>Masukkan PIN untuk konfirmasi</li>
              </>
            )}
            {paymentMethod === 'qris' && (
              <>
                <li>Buka aplikasi e-wallet atau mobile banking</li>
                <li>Pilih menu Scan QR / QRIS</li>
                <li>Arahkan kamera ke QR code di atas</li>
                <li>Periksa detail dan konfirmasi pembayaran</li>
              </>
            )}
            {paymentMethod === 'crypto' && cryptoInfo && (
              <>
                <li>Buka wallet crypto Anda ({cryptoInfo.name})</li>
                <li>Scan QR code atau salin alamat di atas</li>
                <li>Kirim <span className="text-white font-mono">{cryptoInvoice && formatCryptoAmount(cryptoInvoice.amountCrypto, selectedCrypto!)} {cryptoInfo.symbol}</span> ke alamat tersebut</li>
                <li>Pastikan menggunakan network <span className="text-white">{cryptoInfo.networkName}</span></li>
                <li>Tunggu {cryptoInfo.confirmations > 0 ? `${cryptoInfo.confirmations} konfirmasi` : 'konfirmasi instan'}</li>
              </>
            )}
          </ol>
        </div>

        {/* Demo: Simulate Payment Confirmation */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <p className="text-amber-400 text-sm mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Mode Demo
          </p>
          <p className="text-dark-300 text-sm mb-3">
            Ini adalah simulasi. Di production, pembayaran akan dikonfirmasi otomatis oleh payment gateway.
          </p>
          <button
            onClick={handleConfirmPayment}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Simulasi: Konfirmasi Pembayaran
          </button>
        </div>
      </div>
    );
  };

  const renderConfirmationStep = () => (
    <div className="space-y-6 text-center">
      <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto">
        <Check className="w-10 h-10 text-white" />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Deposit Berhasil!</h1>
        <p className="text-dark-400">Dana telah ditambahkan ke saldo Anda</p>
      </div>

      <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
        <p className="text-dark-400 text-sm mb-1">Jumlah Deposit</p>
        <p className="text-3xl font-bold text-green-500 mb-4">{formatIDR(amount)}</p>
        <p className="text-dark-400 text-sm mb-1">Saldo Sekarang</p>
        <p className="text-xl font-bold text-white">{formatIDR(user?.balance || 0)}</p>
      </div>

      <div className="bg-dark-800 rounded-xl border border-dark-700 p-4 text-left">
        <p className="text-dark-400 text-sm">Referensi</p>
        <p className="text-white font-mono">{transaction?.reference}</p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => {
            setStep('amount');
            setAmount(0);
            setCustomAmount('');
            setPaymentMethod(null);
            setSelectedBank(null);
            setSelectedEwallet(null);
            setSelectedCrypto(null);
            setCryptoInvoice(null);
            setTransaction(null);
          }}
          className="flex-1 bg-dark-700 hover:bg-dark-600 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          Deposit Lagi
        </button>
        <button
          onClick={() => router.push('/')}
          className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          Mulai Prediksi
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      {renderStepIndicator()}
      {step === 'amount' && renderAmountStep()}
      {step === 'method' && renderMethodStep()}
      {step === 'payment' && renderPaymentStep()}
      {step === 'confirmation' && renderConfirmationStep()}
    </div>
  );
}
