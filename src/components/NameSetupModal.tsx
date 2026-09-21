import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CoupleProfile } from '../types';
import { Heart, User, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { sound } from '../utils/audio';
import { useLanguage } from '../context/LanguageContext';

interface NameSetupModalProps {
  isOpen: boolean;
  profile: CoupleProfile;
  onSave: (updated: Partial<CoupleProfile>) => void;
  onClose?: () => void;
  canCancel?: boolean;
}

export const NameSetupModal: React.FC<NameSetupModalProps> = ({
  isOpen,
  profile,
  onSave,
  onClose,
  canCancel = false
}) => {
  const { language } = useLanguage();

  const sanitizeName = (val?: string) => {
    if (!val) return '';
    const lower = val.trim().toLowerCase();
    if (lower === 'partner' || lower === 'alex' || lower === 'sam') return '';
    return val;
  };

  const [p1, setP1] = useState(() => sanitizeName(profile.player1));
  const [p2, setP2] = useState(() => sanitizeName(profile.player2));
  const [error, setError] = useState<string | null>(null);

  const input1Ref = useRef<HTMLInputElement>(null);
  const input2Ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setP1(sanitizeName(profile.player1));
      setP2(sanitizeName(profile.player2));
      setError(null);
    }
  }, [isOpen, profile.player1, profile.player2]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean1 = p1.trim();
    const clean2 = p2.trim();

    if (!clean1 && !clean2) {
      setError(
        language === 'id'
          ? 'Silakan isi nama kamu dan nama pasanganmu terlebih dahulu!'
          : 'Please enter both your name and your partner’s name!'
      );
      input1Ref.current?.focus();
      return;
    }

    if (!clean1) {
      setError(
        language === 'id'
          ? 'Silakan isi namamu terlebih dahulu!'
          : 'Please enter your name!'
      );
      input1Ref.current?.focus();
      return;
    }

    if (!clean2 || clean2.toLowerCase() === 'partner') {
      setError(
        language === 'id'
          ? 'Silakan isi nama panggilan pasanganmu (bukan "Partner")!'
          : 'Please enter your partner’s name (not "Partner")!'
      );
      input2Ref.current?.focus();
      return;
    }

    sound.playSparkle();
    onSave({ player1: clean1, player2: clean2 });
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-[32px] p-6 sm:p-8 max-w-md w-full border border-[#2D2D2D]/15 shadow-2xl space-y-6 relative"
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#8E2435]/10 text-[#8E2435] flex items-center justify-center mx-auto mb-2">
              <Heart className="w-6 h-6 fill-[#8E2435]" />
            </div>
            <h2 className="font-serif italic text-2xl sm:text-3xl text-[#1a1a1a]">
              {language === 'id' ? 'Masukkan nama kalian' : 'Enter your names'}
            </h2>
            <p className="text-xs text-[#2D2D2D]/70 leading-relaxed">
              {language === 'id'
                ? 'Nama kamu dan pasanganmu diperlukan agar kartu obrolan dan pilihan voting terasa nyata dan intim.'
                : 'Your names are required so that the cards and voting feel authentic and personal.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#2D2D2D]/80 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#8E2435]" />
                  <span>{language === 'id' ? 'Namamu' : 'Your name'}</span>
                </label>
                <input
                  ref={input1Ref}
                  type="text"
                  value={p1}
                  onChange={(e) => {
                    setP1(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder={language === 'id' ? 'Contoh: Gusti' : 'e.g. Alex'}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#2D2D2D]/20 focus:border-[#8E2435] focus:outline-hidden bg-white text-[#2D2D2D] font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#2D2D2D]/80 mb-1 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-[#8E2435]" />
                  <span>{language === 'id' ? 'Nama pasanganmu' : 'Partner’s name'}</span>
                </label>
                <input
                  ref={input2Ref}
                  type="text"
                  value={p2}
                  onChange={(e) => {
                    setP2(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder={language === 'id' ? 'Contoh: Adit' : 'e.g. Sam'}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#2D2D2D]/20 focus:border-[#8E2435] focus:outline-hidden bg-white text-[#2D2D2D] font-medium"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-1.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-2 flex gap-2">
              {canCancel && onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-3 border border-[#2D2D2D]/15 text-xs font-medium rounded-xl text-[#2D2D2D]/70 hover:bg-[#F0EBE3] transition-colors"
                >
                  {language === 'id' ? 'Batal' : 'Cancel'}
                </button>
              )}
              <button
                type="submit"
                className="flex-1 py-3.5 px-4 bg-[#8E2435] hover:bg-[#781E2C] text-white text-xs sm:text-sm font-medium rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-98"
              >
                <span>{language === 'id' ? 'Simpan & lanjut bermain' : 'Save & continue playing'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
