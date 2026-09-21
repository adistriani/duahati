import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CoupleProfile } from '../../types';
import { getWishesItems, generateDynamicWishes } from '../../data/questions';
import { sound } from '../../utils/audio';
import { ArrowRight, HeartHandshake, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../../context/LanguageContext';
import { useRealtime } from '../../context/RealtimeContext';
import { GameInstructionsCard } from '../GameInstructionsCard';

interface WishesAndHopesGameProps {
  profile: CoupleProfile;
  onBackToLobby: () => void;
  questionsExplored?: number;
  onIncrementExplored?: () => void;
}

export const WishesAndHopesGame: React.FC<WishesAndHopesGameProps> = ({
  profile,
  onBackToLobby,
  questionsExplored,
  onIncrementExplored
}) => {
  const { language, t } = useLanguage();
  const { isOnlineMode, myRole, myName, partnerName, sendGameAction, onGameSync } = useRealtime();

  const [showInstructions, setShowInstructions] = useState(true);
  const [items, setItems] = useState(() => getWishesItems(language));
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [ans1, setAns1] = useState('');
  const [ans2, setAns2] = useState('');
  const [myAnswer, setMyAnswer] = useState('');
  const [myLocked, setMyLocked] = useState(false);
  const [sharedDream, setSharedDream] = useState('');

  useEffect(() => {
    setItems(getWishesItems(language));
  }, [language]);

  const currentWish = items[index % items.length];

  // Realtime Sync Subscription
  useEffect(() => {
    if (!isOnlineMode) return;

    const unsubscribe = onGameSync((data) => {
      if (data.gameKey !== 'wishes') return;

      if (data.action === 'ANSWER_LOCKED' || data.action === 'ANSWER_UPDATED') {
        if (data.state.p1Answer !== undefined) setAns1(data.state.p1Answer);
        if (data.state.p2Answer !== undefined) setAns2(data.state.p2Answer);
        if (data.state.index !== undefined) setIndex(data.state.index);

        if (data.bothReady || data.state.revealed) {
          setRevealed(true);
          sound.playReveal();
          confetti({
            particleCount: 25,
            spread: 50,
            origin: { y: 0.7 },
            colors: ['#D8A499', '#8E2435', '#FAF7F2']
          });
        }
      } else if (data.action === 'ROUND_RESET' || data.action === 'NEXT_CARD') {
        setAns1('');
        setAns2('');
        setMyAnswer('');
        setMyLocked(false);
        setRevealed(false);
        setSharedDream('');
        if (data.state.index !== undefined) setIndex(data.state.index);
        sound.playTap();
      }
    });

    return unsubscribe;
  }, [isOnlineMode, onGameSync]);

  const handleOnlineSubmit = () => {
    if (!myAnswer.trim()) return;
    sound.playLockIn();
    setMyLocked(true);

    if (myRole === 'player1') {
      setAns1(myAnswer.trim());
      sendGameAction('ANSWER_SUBMIT', {
        gameKey: 'wishes',
        ans1: myAnswer.trim(),
        index,
        bothReady: !!ans2
      });
      if (ans2) {
        setRevealed(true);
        sound.playReveal();
      }
    } else {
      setAns2(myAnswer.trim());
      sendGameAction('ANSWER_SUBMIT', {
        gameKey: 'wishes',
        ans2: myAnswer.trim(),
        index,
        bothReady: !!ans1
      });
      if (ans1) {
        setRevealed(true);
        sound.playReveal();
      }
    }
  };

  const handleRevealOffline = () => {
    if (!ans1.trim() && !ans2.trim()) return;
    sound.playReveal();
    setRevealed(true);
  };

  const handleNext = () => {
    sound.playTap();
    onIncrementExplored?.();
    const nextIdx = index + 1;
    if (nextIdx >= items.length) {
      const dyn = generateDynamicWishes(nextIdx + 2, language);
      setItems(prev => [...prev, dyn]);
    }

    if (isOnlineMode) {
      sendGameAction('ROUND_RESET', {
        gameKey: 'wishes',
        nextIndex: nextIdx
      });
    } else {
      setRevealed(false);
      setAns1('');
      setAns2('');
      setSharedDream('');
      setIndex(nextIdx);
    }
  };

  if (showInstructions) {
    return (
      <GameInstructionsCard
        mode="wishes"
        profile={profile}
        onStart={() => setShowInstructions(false)}
        onBackToLobby={onBackToLobby}
      />
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center max-w-3xl mx-auto px-4 py-8 relative z-10">
      {/* Main Card */}
      <motion.div
        key={currentWish.prompt}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full bg-white rounded-[32px] p-6 sm:p-10 border border-[#2D2D2D]/10 shadow-xl shadow-[#2D2D2D]/5 space-y-8"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#2D2D2D]/8 text-xs text-[#6E6664]">
          <span className="font-serif italic">{language === 'id' ? `Harapan #${index + 1}` : `Dream #${index + 1}`}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInstructions(true)}
              className="text-[11px] text-[#2D2D2D]/60 hover:text-[#8E2435] flex items-center gap-1 transition-colors px-2 py-0.5 rounded-md hover:bg-[#F0EBE3]"
              title={language === 'id' ? 'Lihat petunjuk bermain' : 'View how to play'}
            >
              <HelpCircle className="w-3 h-3 text-[#8E2435]" />
              <span>{language === 'id' ? 'Cara bermain' : 'How to play'}</span>
            </button>
            <span className="font-semibold text-[#8E2435] bg-[#F0EBE3] px-2.5 py-0.5 rounded-full">
              {language === 'id' ? 'Masa depan' : 'Future'}
            </span>
          </div>
        </div>

        {/* Prompt */}
        <div className="text-center space-y-2 py-2">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#1a1a1a] leading-relaxed italic">
            “{currentWish.prompt}”
          </h2>
        </div>

        {/* Interaction Area */}
        {isOnlineMode ? (
          <div className="space-y-4">
            {!revealed ? (
              <div className="space-y-3">
                {!myLocked ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-[#8E2435] font-semibold">
                      <span>{language === 'id' ? `Bayangan dari ${myName || 'Kamu'}:` : `Your thoughts (${myName || 'You'}):`}</span>
                      <span className="text-[11px] text-[#2D2D2D]/50">{language === 'id' ? 'Tuliskan dari hati' : 'From the heart'}</span>
                    </div>
                    <textarea
                      rows={3}
                      value={myAnswer}
                      onChange={(e) => setMyAnswer(e.target.value)}
                      placeholder={language === 'id' ? 'Tuliskan gambaran yang ada di kepalamu...' : 'Describe what you see in your mind...'}
                      className="w-full text-xs sm:text-sm p-4 rounded-2xl border border-[#2D2D2D]/15 focus:border-[#8E2435] focus:outline-hidden bg-[#FAF7F2]/60"
                    />
                    <button
                      onClick={handleOnlineSubmit}
                      disabled={!myAnswer.trim()}
                      className="w-full py-3.5 rounded-xl bg-[#8E2435] hover:bg-[#781E2C] text-white text-xs font-semibold disabled:opacity-40 shadow-xs"
                    >
                      {language === 'id' ? 'Kirim harapan & buka bersama' : 'Send & reveal together'}
                    </button>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#8E2435]/20 text-center space-y-2">
                    <span className="text-xs font-semibold text-emerald-700 block">✓ {language === 'id' ? 'Harapanmu sudah terkirim' : 'Your hope is sent'}</span>
                    <p className="font-serif italic text-sm text-[#2D2D2D]">"{myAnswer}"</p>
                    <p className="text-xs text-[#6E6664] italic">
                      {language === 'id' ? `Menunggu ${partnerName || 'pasanganmu'} mengirim harapannya...` : `Waiting for ${partnerName || 'partner'}...`}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <span className="text-xs font-semibold text-[#8E2435] bg-[#FAF7F2] px-3 py-1 rounded-full border border-[#8E2435]/15">
                    {language === 'id' ? '✨ Harapan Masa Depan Terbuka' : '✨ Future Hopes Revealed'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Jawaban dari Namamu (Kamu) */}
                  <div className="p-5 rounded-2xl bg-white border-2 border-[#8E2435]/25 shadow-xs space-y-2 text-left">
                    <div className="flex items-center justify-between pb-1 border-b border-[#2D2D2D]/5">
                      <span className="text-xs font-bold text-[#8E2435] flex items-center gap-1.5">
                        <span>💬 {language === 'id' ? `Harapan dari ${myName || profile.player1}` : `Hope from ${myName || profile.player1}`}</span>
                        <span className="text-[10px] bg-[#8E2435]/10 text-[#8E2435] px-2 py-0.5 rounded-full font-semibold">
                          {language === 'id' ? 'Kamu' : 'You'}
                        </span>
                      </span>
                    </div>
                    <p className="font-serif italic text-sm sm:text-base text-[#1a1a1a] leading-relaxed pt-1">
                      "{((myRole === 'player1' ? ans1 : ans2) || myAnswer || (language === 'id' ? 'Tidak ada catatan' : 'No note'))}"
                    </p>
                  </div>

                  {/* Jawaban dari Nama Pasanganmu */}
                  <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#2D2D2D]/15 space-y-2 text-left">
                    <div className="flex items-center justify-between pb-1 border-b border-[#2D2D2D]/5">
                      <span className="text-xs font-bold text-[#2D2D2D] flex items-center gap-1.5">
                        <span>💌 {language === 'id' ? `Harapan dari ${partnerName || profile.player2}` : `Hope from ${partnerName || profile.player2}`}</span>
                        <span className="text-[10px] bg-[#2D2D2D]/10 text-[#2D2D2D] px-2 py-0.5 rounded-full font-semibold">
                          {language === 'id' ? 'Pasangan' : 'Partner'}
                        </span>
                      </span>
                    </div>
                    <p className="font-serif italic text-sm sm:text-base text-[#2D2D2D] leading-relaxed pt-1">
                      "{((myRole === 'player1' ? ans2 : ans1) || (language === 'id' ? 'Menunggu catatan pasangan...' : 'Waiting for partner...'))}"
                    </p>
                  </div>
                </div>

                {/* Shared dream synthesis */}
                <div className="p-4 rounded-2xl bg-white border border-[#8E2435]/30 space-y-2 text-left">
                  <label className="text-xs font-semibold text-[#8E2435] flex items-center gap-1.5">
                    <HeartHandshake className="w-4 h-4" />
                    <span>{language === 'id' ? 'Rangkum jadi impian bersama:' : 'Summarize our shared dream:'}</span>
                  </label>
                  <input
                    type="text"
                    value={sharedDream}
                    onChange={(e) => setSharedDream(e.target.value)}
                    placeholder={language === 'id' ? 'Misal: Semoga kita bisa punya rumah teduh berhalaman luas...' : 'e.g., We dream of traveling to quiet mountain towns...'}
                    className="w-full p-3 text-xs sm:text-sm rounded-xl border border-[#2D2D2D]/15 focus:border-[#8E2435] bg-[#FAF7F2] focus:outline-hidden"
                  />
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Action Bar */}
        <div className="flex items-center justify-end pt-4 border-t border-[#2D2D2D]/8">
          <button
            onClick={handleNext}
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-[#2D2D2D] hover:bg-black text-white text-xs sm:text-sm font-semibold transition-all shadow-xs"
          >
            <span>{t('nextCard')}</span>
          </button>
        </div>
      </motion.div>

      {/* Footer Back */}
      <div className="mt-8 text-center">
        <button
          onClick={onBackToLobby}
          className="px-6 py-2.5 rounded-full text-xs font-medium text-[#2D2D2D]/60 hover:text-[#2D2D2D] border border-[#2D2D2D]/10 bg-white hover:bg-[#F0EBE3] transition-colors"
        >
          {t('backToLobby')}
        </button>
      </div>
    </div>
  );
};
