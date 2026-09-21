import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThisOrThatItem, CoupleProfile, MemoryKeepsake } from '../../types';
import { getThisOrThatItems, generateDynamicThisOrThat } from '../../data/questions';
import { sound } from '../../utils/audio';
import { ArrowRight, Sparkles, HelpCircle, Users, Radio, CheckCircle2, Play, MessageSquare } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useRealtime } from '../../context/RealtimeContext';
import { useLanguage } from '../../context/LanguageContext';
import { GameInstructionsCard } from '../GameInstructionsCard';

interface ThisOrThatGameProps {
  profile: CoupleProfile;
  onBackToLobby: () => void;
  questionsExplored?: number;
  onIncrementExplored?: () => void;
}

export const ThisOrThatGame: React.FC<ThisOrThatGameProps> = ({
  profile,
  onBackToLobby,
  questionsExplored,
  onIncrementExplored
}) => {
  const { isOnlineMode, myRole, myName, partnerName, sendGameAction, onGameSync } = useRealtime();
  const { language, t } = useLanguage();

  const [showInstructions, setShowInstructions] = useState(true);
  const [itemList, setItemList] = useState<ThisOrThatItem[]>(() => getThisOrThatItems(language));
  const [index, setIndex] = useState(0);
  const [p1Choice, setP1Choice] = useState<'A' | 'B' | null>(null);
  const [p2Choice, setP2Choice] = useState<'A' | 'B' | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [showWhyPrompt, setShowWhyPrompt] = useState(false);
  const [offlineOutcome, setOfflineOutcome] = useState<'match' | 'diff' | null>(null);

  // Update item list if language changes
  useEffect(() => {
    setItemList(getThisOrThatItems(language));
  }, [language]);

  const currentItem = itemList[index] || generateDynamicThisOrThat(index, language);

  // Subscribe to realtime game sync events
  useEffect(() => {
    if (!isOnlineMode) return;

    const unsubscribe = onGameSync((data) => {
      if (data.gameKey !== 'this-or-that') return;

      if (data.action === 'CHOICE_UPDATED') {
        if (data.state.p1Choice !== undefined) setP1Choice(data.state.p1Choice);
        if (data.state.p2Choice !== undefined) setP2Choice(data.state.p2Choice);
        if (data.state.index !== undefined) setIndex(data.state.index);

        if (data.bothReady && !revealed && countdown === null) {
          sound.playLockIn();
          setCountdown(3);
        }
      } else if (data.action === 'NEXT_QUESTION') {
        setIndex(data.state.index || 0);
        setP1Choice(null);
        setP2Choice(null);
        setCountdown(null);
        setRevealed(false);
        setShowWhyPrompt(false);
        setOfflineOutcome(null);
        sound.playTap();
      }
    });

    return unsubscribe;
  }, [isOnlineMode, onGameSync, revealed, countdown]);

  const handleP1Select = (choice: 'A' | 'B') => {
    sound.playTap();
    setP1Choice(choice);
    if (isOnlineMode) {
      sendGameAction('THIS_OR_THAT_SELECT', { gameKey: 'this-or-that', choice, index });
    }
  };

  const handleP2Select = (choice: 'A' | 'B') => {
    sound.playTap();
    setP2Choice(choice);
    if (isOnlineMode) {
      sendGameAction('THIS_OR_THAT_SELECT', { gameKey: 'this-or-that', choice, index });
    }
  };

  const handleStartVerbalCountdown = () => {
    sound.playLockIn();
    setCountdown(3);
  };

  // Countdown timer logic
  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => {
        sound.playTap();
        setCountdown(countdown - 1);
      }, 700);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      sound.playReveal();
      if (isOnlineMode) {
        setRevealed(true);
      }
      setCountdown(null);
      if (isOnlineMode && p1Choice === p2Choice) {
        confetti({
          particleCount: 30,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#D8A499', '#8E2435', '#FAF7F2']
        });
      }
    }
  }, [countdown, p1Choice, p2Choice, isOnlineMode]);

  const handleNext = () => {
    sound.playTap();
    onIncrementExplored?.();
    const nextIdx = index + 1;
    if (nextIdx >= itemList.length) {
      const dyn = generateDynamicThisOrThat(nextIdx + 5, language);
      setItemList(prev => [...prev, dyn]);
    }

    if (isOnlineMode) {
      sendGameAction('THIS_OR_THAT_NEXT', { gameKey: 'this-or-that', nextIndex: nextIdx });
    } else {
      setP1Choice(null);
      setP2Choice(null);
      setCountdown(null);
      setRevealed(false);
      setShowWhyPrompt(false);
      setOfflineOutcome(null);
      setIndex(nextIdx);
    }
  };

  const isMatch = isOnlineMode ? (p1Choice === p2Choice) : (offlineOutcome === 'match');

  if (showInstructions) {
    return (
      <GameInstructionsCard
        mode="this-or-that"
        profile={profile}
        onStart={() => setShowInstructions(false)}
        onBackToLobby={onBackToLobby}
      />
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center max-w-3xl mx-auto px-4 py-8 relative z-10">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentItem.id}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3 }}
          className="w-full relative"
        >
          <div className="bg-white rounded-[32px] p-6 sm:p-10 border border-[#2D2D2D]/10 shadow-xl shadow-[#2D2D2D]/5 space-y-8">
            {/* Meta Top */}
            <div className="flex items-center justify-between pb-4 border-b border-[#2D2D2D]/8">
              <span className="text-xs font-serif text-[#2D2D2D]/60 italic">
                {language === 'id' ? `Pilihan #${index + 1}` : `Choice #${index + 1}`}
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
                  {currentItem.category || 'Santai'}
                </span>
              </div>
            </div>

            {/* Countdown Overlay */}
            {countdown !== null && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-6 space-y-2 bg-[#FAF7F2] rounded-2xl border border-[#8E2435]/20"
              >
                <span className="text-5xl sm:text-6xl font-serif italic text-[#8E2435] font-bold">
                  {countdown === 0 ? (language === 'id' ? 'Buka!' : 'Reveal!') : countdown}
                </span>
                <p className="text-xs text-[#6E6664] font-serif italic">
                  {language === 'id' ? 'Sebutkan pilihanmu sekarang!' : 'Shout your choice now!'}
                </p>
              </motion.div>
            )}

            {/* Two Choices Display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option A */}
              <div
                className={`p-6 rounded-2xl border transition-all text-center space-y-3 relative ${
                  revealed && (p1Choice === 'A' || p2Choice === 'A')
                    ? 'border-[#8E2435] bg-[#8E2435]/5 shadow-xs'
                    : 'border-[#2D2D2D]/10 bg-[#FAF7F2]/60 hover:bg-[#F9F7F2]'
                }`}
              >
                <div className="text-4xl">{currentItem.optionA.icon}</div>
                <h3 className="font-serif italic text-lg sm:text-xl text-[#1a1a1a]">
                  {currentItem.optionA.label}
                </h3>

                {isOnlineMode && !revealed && (
                  <button
                    onClick={() => (myRole === 'player1' ? handleP1Select('A') : handleP2Select('A'))}
                    className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      (myRole === 'player1' ? p1Choice === 'A' : p2Choice === 'A')
                        ? 'bg-[#8E2435] text-white'
                        : 'bg-white border border-[#2D2D2D]/15 text-[#2D2D2D] hover:bg-[#F0EBE3]'
                    }`}
                  >
                    {(myRole === 'player1' ? p1Choice === 'A' : p2Choice === 'A')
                      ? (language === 'id' ? '✓ Pilihanmu' : '✓ Your choice')
                      : (language === 'id' ? 'Pilih opsi ini' : 'Pick this')}
                  </button>
                )}
              </div>

              {/* Option B */}
              <div
                className={`p-6 rounded-2xl border transition-all text-center space-y-3 relative ${
                  revealed && (p1Choice === 'B' || p2Choice === 'B')
                    ? 'border-[#8E2435] bg-[#8E2435]/5 shadow-xs'
                    : 'border-[#2D2D2D]/10 bg-[#FAF7F2]/60 hover:bg-[#F9F7F2]'
                }`}
              >
                <div className="text-4xl">{currentItem.optionB.icon}</div>
                <h3 className="font-serif italic text-lg sm:text-xl text-[#1a1a1a]">
                  {currentItem.optionB.label}
                </h3>

                {isOnlineMode && !revealed && (
                  <button
                    onClick={() => (myRole === 'player1' ? handleP1Select('B') : handleP2Select('B'))}
                    className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      (myRole === 'player1' ? p1Choice === 'B' : p2Choice === 'B')
                        ? 'bg-[#8E2435] text-white'
                        : 'bg-white border border-[#2D2D2D]/15 text-[#2D2D2D] hover:bg-[#F0EBE3]'
                    }`}
                  >
                    {(myRole === 'player1' ? p1Choice === 'B' : p2Choice === 'B')
                      ? (language === 'id' ? '✓ Pilihanmu' : '✓ Your choice')
                      : (language === 'id' ? 'Pilih opsi ini' : 'Pick this')}
                  </button>
                )}
              </div>
            </div>

            {/* Revealed Choices Comparison */}
            {revealed && (p1Choice || p2Choice) && (
              <div className="space-y-4 pt-2">
                <div className="text-center">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                    p1Choice === p2Choice
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-[#FAF7F2] text-[#8E2435] border-[#8E2435]/15'
                  }`}>
                    {p1Choice === p2Choice
                      ? (language === 'id' ? '✨ Kalian Sehati! Pilihan kalian sama' : '✨ In Sync! Same choice')
                      : (language === 'id' ? '💫 Selera Berbeda! Yuk diskusikan alasannya' : '💫 Different taste! Discuss why')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pilihan dari Namamu */}
                  <div className="p-4 rounded-2xl bg-white border-2 border-[#8E2435]/25 shadow-xs space-y-1 text-left">
                    <div className="flex items-center justify-between pb-1 border-b border-[#2D2D2D]/5">
                      <span className="text-xs font-bold text-[#8E2435] flex items-center gap-1.5">
                        <span>💬 {language === 'id' ? `Pilihan dari ${myName || (myRole === 'player1' ? profile.player1 : profile.player2)}` : `Choice from ${myName || (myRole === 'player1' ? profile.player1 : profile.player2)}`}</span>
                        <span className="text-[10px] bg-[#8E2435]/10 text-[#8E2435] px-2 py-0.5 rounded-full font-semibold">
                          {language === 'id' ? 'Kamu' : 'You'}
                        </span>
                      </span>
                    </div>
                    <div className="pt-1 flex items-center gap-2">
                      <span className="text-2xl">
                        {(myRole === 'player1' ? p1Choice : p2Choice) === 'A' ? currentItem.optionA.icon : (myRole === 'player1' ? p1Choice : p2Choice) === 'B' ? currentItem.optionB.icon : '❓'}
                      </span>
                      <span className="font-serif italic text-base font-semibold text-[#1a1a1a]">
                        {(myRole === 'player1' ? p1Choice : p2Choice) === 'A'
                          ? currentItem.optionA.label
                          : (myRole === 'player1' ? p1Choice : p2Choice) === 'B'
                          ? currentItem.optionB.label
                          : (language === 'id' ? 'Belum memilih' : 'Not picked')}
                      </span>
                    </div>
                  </div>

                  {/* Pilihan dari Nama Pasanganmu */}
                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#2D2D2D]/15 space-y-1 text-left">
                    <div className="flex items-center justify-between pb-1 border-b border-[#2D2D2D]/5">
                      <span className="text-xs font-bold text-[#2D2D2D] flex items-center gap-1.5">
                        <span>💌 {language === 'id' ? `Pilihan dari ${partnerName || (myRole === 'player1' ? profile.player2 : profile.player1)}` : `Choice from ${partnerName || (myRole === 'player1' ? profile.player2 : profile.player1)}`}</span>
                        <span className="text-[10px] bg-[#2D2D2D]/10 text-[#2D2D2D] px-2 py-0.5 rounded-full font-semibold">
                          {language === 'id' ? 'Pasangan' : 'Partner'}
                        </span>
                      </span>
                    </div>
                    <div className="pt-1 flex items-center gap-2">
                      <span className="text-2xl">
                        {(myRole === 'player1' ? p2Choice : p1Choice) === 'A' ? currentItem.optionA.icon : (myRole === 'player1' ? p2Choice : p1Choice) === 'B' ? currentItem.optionB.icon : '❓'}
                      </span>
                      <span className="font-serif italic text-base font-semibold text-[#2D2D2D]">
                        {(myRole === 'player1' ? p2Choice : p1Choice) === 'A'
                          ? currentItem.optionA.label
                          : (myRole === 'player1' ? p2Choice : p1Choice) === 'B'
                          ? currentItem.optionB.label
                          : (language === 'id' ? 'Menunggu pasangan memilih...' : 'Waiting for partner...')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Bar - Clean Kartu berikutnya */}
            <div className="flex items-center justify-end pt-4 border-t border-[#2D2D2D]/8">
              <button
                onClick={handleNext}
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-[#2D2D2D] hover:bg-black text-white text-xs sm:text-sm font-semibold transition-all shadow-xs"
              >
                <span>{t('nextCard')}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

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
