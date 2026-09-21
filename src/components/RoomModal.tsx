import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Share2,
  Copy,
  Check,
  Radio,
  Users,
  Smartphone,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useRealtime } from '../context/RealtimeContext';
import { useLanguage } from '../context/LanguageContext';
import { sound } from '../utils/audio';
import { normalizeRoomCode } from '../utils/roomCode';

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
  defaultName?: string;
  onSuccess?: () => void;
}

export const RoomModal: React.FC<RoomModalProps> = ({
  isOpen,
  onClose,
  initialCode = '',
  defaultName = '',
  onSuccess
}) => {
  const {
    isConnected,
    isOnlineMode,
    roomId,
    myRole,
    myName,
    partnerName,
    partnerStatus,
    createRoom,
    joinRoom,
    leaveRoom,
    shareRoomLink
  } = useRealtime();

  const { language, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'create' | 'join'>(initialCode ? 'join' : 'create');
  const [name, setName] = useState(defaultName || (myRole ? myName : (language === 'id' ? 'Rama' : 'Alex')));
  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
      setActiveTab('join');
    }
  }, [initialCode]);

  useEffect(() => {
    if (defaultName && !name) {
      setName(defaultName);
    }
  }, [defaultName]);

  const handleCreate = async () => {
    if (!name.trim()) {
      setError(language === 'id' ? 'Silakan masukkan namamu terlebih dahulu' : 'Please enter your name');
      return;
    }
    setError(null);
    setLoading(true);
    const res = await createRoom(name.trim());
    setLoading(false);
    if (res.success) {
      if (onSuccess) onSuccess();
    } else {
      setError(res.error || (language === 'id' ? 'Gagal membuat ruang' : 'Failed to create room'));
    }
  };

  const handleJoin = async () => {
    if (!name.trim()) {
      setError(language === 'id' ? 'Silakan masukkan namamu dulu ya' : 'Please enter your name');
      return;
    }
    if (!code.trim()) {
      setError(language === 'id' ? 'Silakan masukkan kode ruang dari pasanganmu' : 'Please enter the room code');
      return;
    }
    setError(null);
    setLoading(true);
    const cleanCode = normalizeRoomCode(code);
    const res = await joinRoom(cleanCode, name.trim());
    setLoading(false);
    if (res.success) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      const rawError = res.error || '';
      let friendlyError = rawError;
      if (language === 'id') {
        if (rawError.toLowerCase().includes('not found') || rawError.toLowerCase().includes('tidak ditemukan')) {
          friendlyError = 'Kode ruang tidak ditemukan. Pastikan kodenya sudah sesuai atau buat ruang baru ya.';
        } else if (rawError.toLowerCase().includes('already has 2') || rawError.toLowerCase().includes('sudah penuh')) {
          friendlyError = 'Ruang ini sudah penuh dengan 2 pemain.';
        } else {
          friendlyError = 'Gagal bergabung ke ruang. Coba periksa koneksi dan coba lagi.';
        }
      }
      setError(friendlyError);
    }
  };

  const handleCopyLink = () => {
    sound.playTap();
    const link = shareRoomLink();
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    sound.playTap();
    const link = shareRoomLink();
    const message = encodeURIComponent(
      language === 'id'
        ? `Hai sayang! Ayo main "Dua Hati" bareng di HP masing-masing 💖\n\n🔗 Klik link undangan ini untuk langsung gabung:\n${link}\n\n🔑 Kode Ruang: ${roomId}\n(Atau buka aplikasi Dua Hati dan masukkan Kode Ruang di menu "Gabung Ruang")`
        : `Hey! Let's play "Dua Hati" together on our phones 💖\n\n🔗 Click this link to join directly:\n${link}\n\n🔑 Room Code: ${roomId}\n(Or open Dua Hati and enter this Room Code in the "Join Room" menu)`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-md bg-[#F9F7F2] border border-[#2D2D2D]/15 rounded-[32px] p-6 sm:p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Ambient Crimson Background */}
        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-[#8E2435]/10 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/70 hover:bg-white border border-[#2D2D2D]/10 flex items-center justify-center text-[#2D2D2D] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1.5 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#2D2D2D]/10 text-xs font-medium text-[#8E2435] shadow-2xs">
            <Radio className="w-3 h-3 text-[#8E2435] animate-pulse" />
            <span>{language === 'id' ? 'Sinkronisasi 2 HP' : 'Online real-time sync'}</span>
          </div>
          <h2 className="font-serif italic text-2xl text-[#1a1a1a]">
            {isOnlineMode
              ? (language === 'id' ? 'Ruang terhubung' : 'Connected room')
              : (language === 'id' ? 'Main berjauhan di 2 HP' : 'Play on 2 different phones')}
          </h2>
          <p className="text-xs text-[#6E6664] max-w-xs mx-auto">
            {isOnlineMode
              ? (language === 'id' ? 'Kedua pemain tersinkronisasi secara real-time.' : 'Both players are synchronized in real-time.')
              : (language === 'id' ? 'Buat kode ruang baru atau masukkan kode undangan dari pasanganmu.' : 'Create a session code or invite your partner to play together.')}
          </p>
        </div>

        {/* ACTIVE ROOM VIEW */}
        {isOnlineMode && roomId ? (
          <div className="space-y-6">
            {/* Room Code Card */}
            <div className="bg-white p-5 rounded-2xl border border-[#2D2D2D]/10 shadow-xs text-center space-y-3">
              <div className="text-xs font-medium text-[#2D2D2D]/60">
                {t('yourRoomCode')}
              </div>
              <div className="font-serif text-3xl font-bold tracking-wider text-[#8E2435] select-all">
                {roomId}
              </div>
              <div className="flex justify-center gap-2 pt-1">
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-[#F9F7F2] hover:bg-[#F0EBE3] border border-[#2D2D2D]/10 text-xs font-medium text-[#2D2D2D] rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? t('linkCopied') : t('copyLink')}</span>
                </button>
                <button
                  onClick={handleWhatsAppShare}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Players Presence Status */}
            <div className="space-y-2.5">
              <div className="text-xs font-medium text-[#2D2D2D]/60 px-1">
                {language === 'id' ? 'Status pemain' : 'Connected partners'}
              </div>

              {/* Player 1 Card */}
              <div className="bg-white/80 p-3.5 rounded-xl border border-[#2D2D2D]/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#8E2435] text-white flex items-center justify-center font-serif text-sm font-semibold">
                    {myName.charAt(0) || 'P'}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#2D2D2D]">
                      {myName} {myRole === 'player1' ? (language === 'id' ? '(kamu • pembuat ruang)' : '(you • host)') : (language === 'id' ? '(kamu)' : '(you)')}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {language === 'id' ? 'Terhubung & siap' : 'Connected & ready'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Partner Card */}
              <div className="bg-white/80 p-3.5 rounded-xl border border-[#2D2D2D]/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#2D2D2D] text-white flex items-center justify-center font-serif text-sm font-semibold">
                    {partnerStatus.present ? partnerName.charAt(0) : '?'}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#2D2D2D]">
                      {partnerStatus.present ? partnerName : (language === 'id' ? 'Menunggu pasangan bergabung...' : 'Waiting for partner...')}
                    </div>
                    <div className="text-[10px] font-medium flex items-center gap-1">
                      {partnerStatus.connected ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-emerald-600">{language === 'id' ? 'Online di HP' : 'Online on phone'}</span>
                        </>
                      ) : partnerStatus.present ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span className="text-amber-600">{language === 'id' ? 'Menyambungkan ulang...' : 'Reconnecting...'}</span>
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#8E2435] animate-ping" />
                          <span className="text-[#8E2435]">{language === 'id' ? 'Bagikan link untuk mengundang pasangan' : 'Share link to invite partner'}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-[#2D2D2D] hover:bg-black text-white text-xs font-medium rounded-xl transition-all shadow-xs"
              >
                {language === 'id' ? 'Lanjut bermain' : 'Back to game'}
              </button>
              <button
                onClick={() => {
                  leaveRoom();
                }}
                className="px-4 py-3 border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-medium rounded-xl transition-colors"
              >
                {language === 'id' ? 'Keluar ruang' : 'Leave room'}
              </button>
            </div>
          </div>
        ) : (
          /* CREATE / JOIN TABS */
          <div className="space-y-5">
            {/* Tabs */}
            <div className="flex bg-white/70 p-1 rounded-xl border border-[#2D2D2D]/10">
              <button
                onClick={() => {
                  setActiveTab('create');
                  setError(null);
                }}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                  activeTab === 'create'
                    ? 'bg-[#2D2D2D] text-white shadow-2xs'
                    : 'text-[#2D2D2D]/60 hover:text-[#2D2D2D]'
                }`}
              >
                {t('createRoomTab')}
              </button>
              <button
                onClick={() => {
                  setActiveTab('join');
                  setError(null);
                }}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                  activeTab === 'join'
                    ? 'bg-[#2D2D2D] text-white shadow-2xs'
                    : 'text-[#2D2D2D]/60 hover:text-[#2D2D2D]'
                }`}
              >
                {t('joinRoomTab')}
              </button>
            </div>

            {/* Error banner */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center">
                {error}
              </div>
            )}

            {/* Create Tab View */}
            {activeTab === 'create' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">
                    {language === 'id' ? 'Namamu' : 'Your name'}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={language === 'id' ? 'Contoh: Rama' : 'e.g. Alex'}
                    className="w-full px-4 py-3 text-sm rounded-xl border border-[#2D2D2D]/15 focus:border-[#8E2435] focus:outline-hidden bg-white text-[#2D2D2D]"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#2D2D2D]/10 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#8E2435]">
                    <Smartphone className="w-4 h-4" />
                    <span>{language === 'id' ? 'Cara main mode online:' : 'How it works:'}</span>
                  </div>
                  <ul className="text-xs text-[#6E6664] space-y-1 list-disc list-inside">
                    <li>{language === 'id' ? 'Kamu dapat kode ruang unik & link undangan otomatis.' : 'You get a unique room code & invite link.'}</li>
                    <li>{language === 'id' ? 'Kirim linknya ke pasanganmu lewat WhatsApp.' : 'Send the link to your partner via WhatsApp.'}</li>
                    <li>{language === 'id' ? 'Saat pasangan klik, layar kalian langsung terhubung dan tersinkron!' : 'When they tap the link, your screens will connect and sync!'}</li>
                  </ul>
                </div>

                <button
                  disabled={loading}
                  onClick={handleCreate}
                  className="w-full py-3.5 bg-[#8E2435] hover:bg-[#781E2C] text-white text-xs font-semibold rounded-xl transition-all shadow-xs disabled:opacity-50 flex items-center justify-center"
                >
                  <span>{loading ? (language === 'id' ? 'Membuat ruang...' : 'Creating room...') : (language === 'id' ? 'Buat ruang baru & dapatkan kode' : 'Create room & get code')}</span>
                </button>
              </div>
            ) : (
              /* Join Tab View */
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">
                    {language === 'id' ? 'Namamu' : 'Your name'}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={language === 'id' ? 'Contoh: Shinta' : 'e.g. Sam'}
                    className="w-full px-4 py-3 text-sm rounded-xl border border-[#2D2D2D]/15 focus:border-[#8E2435] focus:outline-hidden bg-white text-[#2D2D2D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2D2D2D]/70 mb-1.5">
                    {t('enterRoomCode')}
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212]/g, '-');
                      setCode(val.toUpperCase());
                    }}
                    placeholder="US-4921 atau kode dari pasangan"
                    className="w-full px-4 py-3 text-sm font-mono tracking-wider rounded-xl border border-[#2D2D2D]/15 focus:border-[#8E2435] focus:outline-hidden bg-white text-[#2D2D2D]"
                  />
                </div>

                <button
                  disabled={loading}
                  onClick={handleJoin}
                  className="w-full py-3.5 bg-[#2D2D2D] hover:bg-black text-white text-xs font-semibold rounded-xl transition-all shadow-xs disabled:opacity-50 flex items-center justify-center"
                >
                  <span>{loading ? (language === 'id' ? 'Menghubungkan...' : 'Connecting...') : (language === 'id' ? 'Gabung ke ruang pasangan' : 'Join partner room')}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
