import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BaseQuestion, CoupleProfile, MemoryKeepsake } from '../../types';
import { getBaseQuestions, getNextBaseQuestion } from '../../data/questions';
import { sound } from '../../utils/audio';
import { Heart, ArrowRight, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useRealtime } from '../../context/RealtimeContext';
import { useLanguage } from '../../context/LanguageContext';
import { GameInstructionsCard } from '../GameInstructionsCard';

interface LoveAndUsGameProps {
  profile: CoupleProfile;
  onBackToLobby: () => void;
  questionsExplored?: number;
  onIncrementExplored?: () => void;
}

export const LoveAndUsGame: React.FC<LoveAndUsGameProps> = ({
  profile,
  onBackToLobby,
  questionsExplored,
  onIncrementExplored
}) => {
  const { isOnlineMode, myRole, myName, partnerName, sendGameAction, onGameSync } = useRealtime();
  const { language, t } = useLanguage();

  const [showInstructions, setShowInstructions] = useState(true);
  const [loveQuestions, setLoveQuestions] = useState<BaseQuestion[]>(() => {
    return getBaseQuestions(language).filter(q => q.category === 'Love');
  });

  const [index, setIndex] = useState(0);
  const [ans1, setAns1] = useState('');
  const [ans2, setAns2] = useState('');
  const [myAnswer, setMyAnswer] = useState('');
  const [myLocked, setMyLocked] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setLoveQuestions(getBaseQuestions(language).filter(q => q.category === 'Love'));
  }, [language]);

  const currentQ = loveQuestions[index] || getNextBaseQuestion('Love', 'personal', loveQuestions.map(q => q.id), language, profile.player1, profile.player2);

  // Realtime Sync Subscription
  useEffect(() => {
    if (!isOnlineMode) return;

    const unsubscribe = onGameSync((data) => {
      if (data.gameKey !== 'love-and-us') return;

      if (data.action === 'LOVE_NEXT' || data.action === 'ROUND_RESET') {
        if (data.state.index !== undefined) setIndex(data.state.index);
        setAns1('');
        setAns2('');
        setMyAnswer('');
        setMyLocked(false);
        setRevealed(false);
        sound.playTap();
      } else if (data.action === 'ANSWER_LOCKED' || data.action === 'ANSWER_UPDATED') {
        const state = data.state;
        if (state.p1Answer !== undefined && state.p1Answer !== '') setAns1(state.p1Answer);
        if (state.p2Answer !== undefined && state.p2Answer !== '') setAns2(state.p2Answer);
        if (state.ans1 !== undefined && state.ans1 !== '') setAns1(state.ans1);
        if (state.ans2 !== undefined && state.ans2 !== '') setAns2(state.ans2);

        if (data.bothReady || state.revealed || (state.p1Locked && state.p2Locked)) {
          setRevealed(true);
          sound.playReveal();
          confetti({
            particleCount: 25,
            spread: 50,
            origin: { y: 0.7 },
            colors: ['#D8A499', '#8E2435', '#FAF7F2']
          });
        }
      }
    });

    return unsubscribe;
  }, [isOnlineMode, onGameSync]);

  const handleOnlineSubmit = () => {
    if (!myAnswer.trim()) return;
    sound.playLockIn();
    setMyLocked(true);
    if (myRole === 'player1') setAns1(myAnswer.trim());
    else setAns2(myAnswer.trim());

    sendGameAction('ANSWER_SUBMIT', {
      gameKey: 'love-and-us',
      answer: myAnswer.trim(),
      index
    });
  };

  const handleRevealOffline = () => {
    if (!ans1.trim() && !ans2.trim()) return;
    sound.playReveal();
    setRevealed(true);
    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#D8A499', '#8E2435', '#FAF7F2']
    });
  };

  const handleNext = () => {
    sound.playTap();
    onIncrementExplored?.();
    const nextIdx = index + 1;
    if (nextIdx >= loveQuestions.length) {
      const dyn = getNextBaseQuestion('Love', 'personal', loveQuestions.map(q => q.id), language, profile.player1, profile.player2);
      setLoveQuestions(prev => [...prev, dyn]);
    }

    if (isOnlineMode) {
      sendGameAction('LOVE_NEXT', {
        gameKey: 'love-and-us',
        nextIndex: nextIdx
      });
    } else {
      setAns1('');
      setAns2('');
      setMyAnswer('');
      setMyLocked(false);
      setRevealed(false);
      setIndex(nextIdx);
    }
  };

  if (showInstructions) {
    return (
      <GameInstructionsCard
        mode="love-us"
        profile={profile}
        onStart={() => setShowInstructions(false)}
        onBackToLobby={onBackToLobby}
      />
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center max-w-3xl mx-auto px-4 py-8 relative z-10">
      <motion.div
        key={currentQ.id}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full bg-white rounded-[32px] p-6 sm:p-10 border border-[#2D2D2D]/10 shadow-xl shadow-[#2D2D2D]/5 space-y-8"
      >
        {/* Meta Top */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2D2D2D]/8">
          <span className="text-xs font-serif text-[#2D2D2D]/60 italic">
            {language === 'id' ? `Refleksi #${index + 1}` : `Reflection #${index + 1}`}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInstructions(true)}
              className="text-[11px] text-[#2D2D2D]/60 hover:text-[#8E2435] flex items-center gap-1 transition-colors px-2 py-0.5 rounded-md hover:bg-[#F0EBE3]"
              title={language === 'id' ? 'Lihat petunjuk bermain' : 'View how to play'}
            >
              <HelpCircle className="w-3 h-3 text-[#8E2435]" />
              <span>{language === 'id' ? 'Cara bermain' : 'How to play'}</span>
            </button>
            <span className="text-[11px] px-3 py-1 rounded-full bg-[#F0EBE3] text-[#8E2435] font-semibold">
              {currentQ.difficulty || (language === 'id' ? '💭 Hangat' : '💭 Warm')}
            </span>
          </div>
        </div>

        {/* Question Text */}
        <div className="text-center space-y-3 py-2">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#1a1a1a] leading-relaxed italic">
            “{currentQ.text}”
          </h2>
        </div>

        {/* Interaction area */}
        {isOnlineMode ? (
          <div className="space-y-4">
            {!revealed ? (
              <div className="space-y-3">
                {!myLocked ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-[#8E2435] font-semibold">
                      <span>{language === 'id' ? `Jawabanmu (${myName || 'Kamu'}):` : `Your answer (${myName || 'You'}):`}</span>
                      <span className="text-[#2D2D2D]/50 text-[11px]">{language === 'id' ? 'Buka hatimu' : 'From the heart'}</span>
                    </div>
                    <textarea
                      rows={3}
                      value={myAnswer}
                      onChange={(e) => setMyAnswer(e.target.value)}
                      placeholder={language === 'id' ? 'Tuliskan jawabanmu dengan tulus...' : 'Write your honest answer...'}
                      className="w-full p-4 rounded-2xl border border-[#2D2D2D]/15 focus:border-[#8E2435] bg-[#F9F7F2]/60 text-xs sm:text-sm text-[#2D2D2D] focus:outline-hidden"
                    />
                    <button
                      onClick={handleOnlineSubmit}
                      disabled={!myAnswer.trim()}
                      className="w-full py-3.5 rounded-xl bg-[#8E2435] hover:bg-[#781E2C] text-white text-xs font-semibold disabled:opacity-40 shadow-xs"
                    >
                      {language === 'id' ? 'Kirim & buka jawaban bersama' : 'Send & reveal together'}
                    </button>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#8E2435]/20 text-center space-y-2">
                    <span className="text-xs font-semibold text-emerald-700 block">✓ {language === 'id' ? 'Jawabanmu sudah terkirim' : 'Your answer is sent'}</span>
                    <p className="font-serif italic text-sm text-[#2D2D2D]">"{myAnswer}"</p>
                    <p className="text-xs text-[#6E6664] italic">
                      {language === 'id' ? `Menunggu ${partnerName || 'pasanganmu'} mengirim jawaban...` : `Waiting for ${partnerName || 'partner'}...`}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <span className="text-xs font-semibold text-[#8E2435] bg-[#FAF7F2] px-3 py-1 rounded-full border border-[#8E2435]/15">
                    {language === 'id' ? '✨ Jawaban Refleksi Terbuka' : '✨ Reflection Answers Revealed'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Jawaban dari Namamu (Kamu) */}
                  <div className="p-5 rounded-2xl bg-white border-2 border-[#8E2435]/25 shadow-xs space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-[#2D2D2D]/5">
                      <span className="text-xs font-bold text-[#8E2435] flex items-center gap-1.5">
                        <span>💬 {language === 'id' ? `Jawaban dari ${myName || profile.player1}` : `Answer from ${myName || profile.player1}`}</span>
                        <span className="text-[10px] bg-[#8E2435]/10 text-[#8E2435] px-2 py-0.5 rounded-full font-semibold">
                          {language === 'id' ? 'Kamu' : 'You'}
                        </span>
                      </span>
                    </div>
                    <p className="font-serif italic text-sm sm:text-base text-[#1a1a1a] leading-relaxed pt-1">
                      "{((myRole === 'player1' ? ans1 : ans2) || myAnswer || (language === 'id' ? 'Tidak ada jawaban' : 'No answer'))}"
                    </p>
                  </div>

                  {/* Jawaban dari Nama Pasanganmu */}
                  <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#2D2D2D]/15 space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-[#2D2D2D]/5">
                      <span className="text-xs font-bold text-[#2D2D2D] flex items-center gap-1.5">
                        <span>💌 {language === 'id' ? `Jawaban dari ${partnerName || profile.player2}` : `Answer from ${partnerName || profile.player2}`}</span>
                        <span className="text-[10px] bg-[#2D2D2D]/10 text-[#2D2D2D] px-2 py-0.5 rounded-full font-semibold">
                          {language === 'id' ? 'Pasangan' : 'Partner'}
                        </span>
                      </span>
                    </div>
                    <p className="font-serif italic text-sm sm:text-base text-[#2D2D2D] leading-relaxed pt-1">
                      "{((myRole === 'player1' ? ans2 : ans1) || (language === 'id' ? 'Menunggu jawaban pasangan...' : 'Waiting for partner...'))}"
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Action Bar - Clean Kartu berikutnya */}
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
