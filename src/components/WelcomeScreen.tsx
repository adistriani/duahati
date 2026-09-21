import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { CoupleProfile } from '../types';
import { ArrowRight, Radio, Globe, User, Heart, AlertCircle } from 'lucide-react';
import { sound } from '../utils/audio';
import { useRealtime } from '../context/RealtimeContext';
import { useLanguage } from '../context/LanguageContext';

interface WelcomeScreenProps {
  onStart: (p1: string, p2: string) => void;
  profile: CoupleProfile;
  onOpenRoomModal: (code?: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, profile, onOpenRoomModal }) => {
  // If profile names are dummy defaults or 'Partner', initialize as empty so user types their real names
  const sanitizeInitialName = (val?: string) => {
    if (!val) return '';
    const lower = val.trim().toLowerCase();
    if (lower === 'partner' || lower === 'alex' || lower === 'sam' || lower === 'rama' || lower === 'shinta') {
      return '';
    }
    return val;
  };

  const [name1, setName1] = useState(() => sanitizeInitialName(profile.player1));
  const [name2, setName2] = useState(() => sanitizeInitialName(profile.player2));
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  const input1Ref = useRef<HTMLInputElement>(null);
  const input2Ref = useRef<HTMLInputElement>(null);

  const { isOnlineMode } = useRealtime();
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room') || urlParams.get('join');
    if (roomParam) {
      setInviteCode(roomParam.toUpperCase());
    }
  }, []);

  const validateNames = (): boolean => {
    const clean1 = name1.trim();
    const clean2 = name2.trim();

    if (!clean1 && !clean2) {
      setErrorMsg(
        language === 'id'
          ? 'Yuk masukkan nama kamu dan nama pasanganmu terlebih dahulu untuk mulai bermain!'
          : 'Please enter both your name and your partner’s name to start playing!'
      );
      input1Ref.current?.focus();
      return false;
    }

    if (!clean1) {
      setErrorMsg(
        language === 'id'
          ? 'Silakan isi namamu terlebih dahulu ya!'
          : 'Please enter your name!'
      );
      input1Ref.current?.focus();
      return false;
    }

    if (!clean2 || clean2.toLowerCase() === 'partner') {
      setErrorMsg(
        language === 'id'
          ? 'Silakan isi nama panggilan pasanganmu (bukan "Partner")!'
          : 'Please enter your partner’s name (not "Partner")!'
      );
      input2Ref.current?.focus();
      return false;
    }

    setErrorMsg(null);
    return true;
  };

  const handleBeginOffline = () => {
    if (!validateNames()) {
      sound.playTap();
      return;
    }
    sound.playReveal();
    onStart(name1.trim(), name2.trim());
  };

  const handleBeginOnline = (code?: string) => {
    if (!validateNames()) {
      sound.playTap();
      return;
    }
    sound.playSparkle();
    onStart(name1.trim(), name2.trim());
    onOpenRoomModal(code || inviteCode || undefined);
  };

  const toggleLanguage = () => {
    sound.playTap();
    setLanguage(language === 'id' ? 'en' : 'id');
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between px-4 sm:px-6 py-6 sm:py-10 relative overflow-hidden bg-[#F9F7F2] text-[#2D2D2D]">
      {/* Sleek Dot Grid Backdrop */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-sleek-dots" />

      {/* Top Header Badge & Language Toggle */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-4xl flex items-center justify-between z-10 mb-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-[#2D2D2D]/30 bg-white flex items-center justify-center font-serif italic text-lg shadow-2xs">
            &
          </div>
          <div className="flex flex-col text-left">
            <span className="font-serif italic text-lg sm:text-xl text-[#8E2435]">
              Dua Hati
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <button
            id="welcome-lang-btn"
            onClick={toggleLanguage}
            title={language === 'id' ? 'Ganti ke Bahasa Inggris' : 'Switch to Indonesian'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#2D2D2D]/20 bg-white hover:border-[#8E2435] transition-all text-xs font-bold shadow-2xs text-[#2D2D2D]"
          >
            <Globe className="w-3.5 h-3.5 text-[#8E2435]" />
            <span className={language === 'id' ? 'text-[#8E2435] font-black' : 'text-[#2D2D2D]/50'}>ID</span>
            <span className="text-[#2D2D2D]/30">|</span>
            <span className={language === 'en' ? 'text-[#8E2435] font-black' : 'text-[#2D2D2D]/50'}>EN</span>
          </button>

          {inviteCode && (
            <button
              onClick={() => handleBeginOnline(inviteCode)}
              className="px-3.5 py-1.5 rounded-full bg-[#8E2435] text-white text-xs font-medium flex items-center gap-1.5 shadow-xs animate-bounce"
            >
              <Radio className="w-3 h-3" />
              <span>{language === 'id' ? 'Gabung ruang' : 'Join room'}: {inviteCode}</span>
            </button>
          )}
        </div>
      </motion.header>

      {/* Center Interactive Hero Card */}
      <main className="w-full max-w-2xl flex flex-col items-center text-center my-auto z-10 py-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full relative group"
        >
          {/* Ambient Crimson Glow */}
          <div className="absolute inset-0 bg-[#8E2435] rounded-[32px] blur-2xl opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none" />

          <div className="relative bg-white border border-[#2D2D2D]/10 rounded-[32px] p-6 sm:p-10 shadow-xl shadow-[#2D2D2D]/5 flex flex-col items-center text-center space-y-6">
            {/* Invite Banner if URL contains room */}
            {inviteCode && (
              <div className="w-full p-4 rounded-2xl bg-[#F0EBE3] border border-[#8E2435]/20 text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8E2435]">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>{language === 'id' ? 'Undangan ruang terdeteksi' : 'Room invitation detected'}</span>
                </div>
                <p className="font-serif italic text-base text-[#2D2D2D]">
                  {language === 'id' ? 'Kamu diundang ke ruang ' : 'You have been invited to room '}
                  <strong className="font-mono text-[#8E2435]">{inviteCode}</strong>!
                </p>
                <button
                  onClick={() => handleBeginOnline(inviteCode)}
                  className="px-6 py-2.5 bg-[#8E2435] hover:bg-[#781E2C] text-white text-xs font-medium rounded-xl transition-all shadow-xs"
                >
                  {language === 'id' ? 'Gabung sekarang →' : 'Join room now →'}
                </button>
              </div>
            )}

            {/* Header / Headline Copy */}
            <div className="text-center max-w-lg space-y-2">
              <h1 className="font-serif text-3xl sm:text-4xl italic text-[#8E2435] leading-snug">
                {language === 'id'
                  ? 'Siap mengenal pasanganmu lebih dekat?'
                  : 'Ready to get to know your partner deeper?'}
              </h1>
              <p className="text-xs sm:text-sm text-[#2D2D2D]/70 leading-relaxed">
                {language === 'id'
                  ? 'Masukkan nama kamu dan pasanganmu sebelum bermain, ya!'
                  : 'Enter your name and your partner’s name before playing!'}
              </p>
            </div>

            {/* MANDATORY NAME INPUTS */}
            <div className="w-full max-w-lg bg-[#FAF8F5] p-5 sm:p-6 rounded-2xl border border-[#2D2D2D]/10 text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#8E2435] flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 fill-[#8E2435]" />
                  {language === 'id' ? 'Nama kalian berdua (wajib)' : 'Your names (required)'}
                </span>
                <span className="text-[10px] text-[#2D2D2D]/50 font-medium">
                  {language === 'id' ? 'Digunakan di kartu permainan' : 'Used on cards & voting'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-[#2D2D2D]/80 mb-1.5 flex items-center gap-1">
                    <User className="w-3 h-3 text-[#8E2435]" />
                    <span>{language === 'id' ? 'Namamu' : 'Your name'}</span>
                  </label>
                  <input
                    ref={input1Ref}
                    id="player1-name-input"
                    type="text"
                    value={name1}
                    onChange={(e) => {
                      setName1(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder={language === 'id' ? 'Contoh: Gusti' : 'e.g. Alex'}
                    className={`w-full px-3.5 py-2.5 text-sm rounded-xl border transition-all bg-white text-[#2D2D2D] font-medium placeholder:text-[#2D2D2D]/35 focus:outline-hidden ${
                      errorMsg && !name1.trim()
                        ? 'border-rose-500 ring-2 ring-rose-200'
                        : 'border-[#2D2D2D]/15 focus:border-[#8E2435] focus:ring-1 focus:ring-[#8E2435]'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2D2D2D]/80 mb-1.5 flex items-center gap-1">
                    <Heart className="w-3 h-3 text-[#8E2435]" />
                    <span>{language === 'id' ? 'Nama pasanganmu' : 'Partner’s name'}</span>
                  </label>
                  <input
                    ref={input2Ref}
                    id="player2-name-input"
                    type="text"
                    value={name2}
                    onChange={(e) => {
                      setName2(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder={language === 'id' ? 'Contoh: Adit' : 'e.g. Sam'}
                    className={`w-full px-3.5 py-2.5 text-sm rounded-xl border transition-all bg-white text-[#2D2D2D] font-medium placeholder:text-[#2D2D2D]/35 focus:outline-hidden ${
                      errorMsg && (!name2.trim() || name2.trim().toLowerCase() === 'partner')
                        ? 'border-rose-500 ring-2 ring-rose-200'
                        : 'border-[#2D2D2D]/15 focus:border-[#8E2435] focus:ring-1 focus:ring-[#8E2435]'
                    }`}
                  />
                </div>
              </div>

              {/* Error Notice */}
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl font-medium"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}
            </div>

            {/* Mode Selection Choice: Offline vs Online */}
            <div className="flex flex-col items-center gap-3 w-full">
              <div className="text-xs font-medium text-[#2D2D2D]/60">
                {language === 'id' ? 'Pilih cara bermain' : 'Choose how to play'}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full max-w-lg">
                {/* Mode 1: Mode Offline (Face-to-Face / Talk to Talk) */}
                <button
                  id="play-offline-btn"
                  onClick={handleBeginOffline}
                  className="p-5 rounded-2xl bg-[#2D2D2D] hover:bg-black text-white text-left flex flex-col justify-between transition-all group shadow-sm active:scale-98 border border-[#2D2D2D]/20 hover:border-black relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">
                      🗣️
                    </div>
                    <span className="text-[10px] font-medium bg-white/15 text-stone-200 px-2.5 py-0.5 rounded-full">
                      {language === 'id' ? '1 layar berdua' : '1 screen'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="font-serif text-base sm:text-lg font-semibold text-white">
                      {language === 'id' ? 'Mode offline' : 'Offline mode'}
                    </div>
                    <div className="text-xs text-stone-300 leading-snug">
                      {language === 'id'
                        ? 'Duduk berdua. Buka kartu dan obrolkan langsung secara santai tanpa perlu mengetik.'
                        : 'Sitting together. Flip cards and talk openly without typing.'}
                    </div>
                  </div>
                  <div className="mt-4 inline-flex items-center text-xs font-semibold text-rose-300">
                    <span>{language === 'id' ? 'Mulai bermain' : 'Start playing'}</span>
                  </div>
                </button>

                {/* Mode 2: Mode Online (Multiplayer / 2 HP) */}
                <button
                  id="play-online-btn"
                  onClick={() => handleBeginOnline()}
                  className="p-5 rounded-2xl bg-[#8E2435] hover:bg-[#781E2C] text-white text-left flex flex-col justify-between transition-all group shadow-sm active:scale-98 border border-[#8E2435]/30 hover:border-[#8E2435] relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">
                      📱
                    </div>
                    <span className="text-[10px] font-medium bg-white/20 text-rose-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Radio className="w-2.5 h-2.5 animate-pulse" />
                      <span>{language === 'id' ? 'Sinkron 2 HP' : '2 phones sync'}</span>
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="font-serif text-base sm:text-lg font-semibold text-white">
                      {language === 'id' ? 'Mode online (2 HP)' : 'Online mode (2 phones)'}
                    </div>
                    <div className="text-xs text-rose-100/90 leading-snug">
                      {language === 'id'
                        ? '2 HP terpisah. Jawaban rahasia, status mengetik, dan buka kartu bersama via kode ruang.'
                        : 'Separate phones. Secret answers, live typing indicators, and synchronized reveals.'}
                    </div>
                  </div>
                  <div className="mt-4 inline-flex items-center text-xs font-semibold text-rose-200">
                    <span>{language === 'id' ? 'Masuk / buat ruang' : 'Join / create room'}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="w-full max-w-4xl px-4 py-4 border-t border-[#2D2D2D]/8 flex justify-center items-center z-10"
      >
        <p className="text-xs text-[#2D2D2D]/70 font-medium tracking-wide">
          Made by Gusti Adistriani | 2026
        </p>
      </motion.footer>
    </div>
  );
};
