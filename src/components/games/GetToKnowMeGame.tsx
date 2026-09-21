import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { GetToKnowItem, CoupleProfile } from '../../types';
import { getGetToKnowItems, generateDynamicGetToKnow } from '../../data/questions';
import { sound } from '../../utils/audio';
import { ArrowRight, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../../context/LanguageContext';
import { useRealtime } from '../../context/RealtimeContext';
import { GameInstructionsCard } from '../GameInstructionsCard';

interface GetToKnowMeGameProps {
  profile: CoupleProfile;
  onBackToLobby: () => void;
  questionsExplored?: number;
  onIncrementExplored?: () => void;
}

export const GetToKnowMeGame: React.FC<GetToKnowMeGameProps> = ({
  profile,
  onBackToLobby,
  questionsExplored,
  onIncrementExplored
}) => {
  const { language, t } = useLanguage();
  const { isOnlineMode, myRole, myName, partnerName, sendGameAction, onGameSync } = useRealtime();

  const [showInstructions, setShowInstructions] = useState(true);
  const [items, setItems] = useState<GetToKnowItem[]>(() => getGetToKnowItems(language));
  const [index, setIndex] = useState(0);
  const [p1Choice, setP1Choice] = useState<'A' | 'B' | null>(null);
  const [p2Choice, setP2Choice] = useState<'A' | 'B' | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setItems(getGetToKnowItems(language));
  }, [language]);

  const currentItem = items[index % items.length];

  // Realtime Sync Subscription
  useEffect(() => {
    if (!isOnlineMode) return;

    const unsubscribe = onGameSync((data) => {
      if (data.gameKey !== 'get-to-know') return;

      if (data.action === 'CHOICE_UPDATED') {
        if (data.state.p1Choice !== undefined) setP1Choice(data.state.p1Choice);
        if (data.state.p2Choice !== undefined) setP2Choice(data.state.p2Choice);
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
      } else if (data.action === 'NEXT_QUESTION') {
        setP1Choice(null);
        setP2Choice(null);
        setRevealed(false);
        if (data.state.index !== undefined) setIndex(data.state.index);
        sound.playTap();
      }
    });

    return unsubscribe;
  }, [isOnlineMode, onGameSync]);

  const handleP1Pick = (choice: 'A' | 'B') => {
    sound.playTap();
    setP1Choice(choice);
    if (isOnlineMode) {
      sendGameAction('GET_TO_KNOW_SELECT', {
        gameKey: 'get-to-know',
        choice,
        index
      });
    }
  };

  const handleP2Pick = (choice: 'A' | 'B') => {
    sound.playTap();
    setP2Choice(choice);
    if (isOnlineMode) {
      sendGameAction('GET_TO_KNOW_SELECT', {
        gameKey: 'get-to-know',
        choice,
        index
      });
    }
  };

  const handleRevealOffline = () => {
    if (!p1Choice || !p2Choice) return;
    sound.playReveal();
    setRevealed(true);
  };

  const handleNext = () => {
    sound.playTap();
    onIncrementExplored?.();
    const nextIdx = index + 1;
    if (nextIdx >= items.length) {
      const dyn = generateDynamicGetToKnow(nextIdx + 2, language);
      setItems(prev => [...prev, dyn]);
    }

    if (isOnlineMode) {
      sendGameAction('GET_TO_KNOW_NEXT', {
        gameKey: 'get-to-know',
        nextIndex: nextIdx
      });
    } else {
      setP1Choice(null);
      setP2Choice(null);
      setRevealed(false);
      setIndex(nextIdx);
    }
  };

  if (showInstructions) {
    return (
      <GameInstructionsCard
        mode="get-to-know"
        profile={profile}
        onStart={() => setShowInstructions(false)}
        onBackToLobby={onBackToLobby}
      />
    );
  }

  const myChoice = myRole === 'player1' ? p1Choice : p2Choice;
  const partnerChoice = myRole === 'player1' ? p2Choice : p1Choice;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center max-w-2xl mx-auto px-4 py-8">
      <div className="w-full bg-white rounded-[32px] p-6 sm:p-10 border border-[#2D2D2D]/10 shadow-xl shadow-[#2D2D2D]/5 space-y-6">
        <div className="flex items-center justify-between text-xs text-[#6E6664] pb-3 border-b border-[#2D2D2D]/8">
          <span className="font-serif italic">{language === 'id' ? `Pernyataan #${index + 1}` : `Prompt #${index + 1}`}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInstructions(true)}
              className="text-[11px] text-[#2D2D2D]/60 hover:text-[#8E2435] flex items-center gap-1 transition-colors px-2 py-0.5 rounded-md hover:bg-[#F0EBE3]"
              title={language === 'id' ? 'Lihat petunjuk bermain' : 'View how to play'}
            >
              <HelpCircle className="w-3 h-3 text-[#8E2435]" />
              <span>{language === 'id' ? 'Cara bermain' : 'How to play'}</span>
            </button>
            <span className="font-semibold text-[#8E2435] bg-[#F0EBE3] px-2.5 py-0.5 rounded-full">{currentItem.category}</span>
          </div>
        </div>

        {/* Display the 2 statements */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#2D2D2D]/10 text-center">
            <span className="text-xs font-medium text-[#8E2435] block mb-1">
              {language === 'id' ? 'Pilihan A' : 'Option A'}
            </span>
            <p className="font-serif italic text-base sm:text-lg text-[#1a1a1a] leading-relaxed">
              “{currentItem.statementA}”
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#2D2D2D]/10 text-center">
            <span className="text-xs font-medium text-[#8E2435] block mb-1">
              {language === 'id' ? 'Pilihan B' : 'Option B'}
            </span>
            <p className="font-serif italic text-base sm:text-lg text-[#1a1a1a] leading-relaxed">
              “{currentItem.statementB}”
            </p>
          </div>
        </div>

        {/* Online vs Offline Selection */}
        {isOnlineMode ? (
          <div className="space-y-4">
            {!revealed ? (
              <div className="space-y-3">
                {!myChoice ? (
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-[#8E2435] text-center">
                      {language === 'id' ? `Pilih mana yang paling mirip kamu (${myName || 'Kamu'}):` : `Pick which one is more like you (${myName || 'You'}):`}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => (myRole === 'player1' ? handleP1Pick('A') : handleP2Pick('A'))}
                        className="py-3 px-4 rounded-xl text-xs font-semibold transition-all bg-[#FAF7F2] border border-[#2D2D2D]/15 hover:bg-[#F0EBE3] text-[#2D2D2D]"
                      >
                        {language === 'id' ? 'Mirip Opsi A' : 'More like Option A'}
                      </button>
                      <button
                        onClick={() => (myRole === 'player1' ? handleP1Pick('B') : handleP2Pick('B'))}
                        className="py-3 px-4 rounded-xl text-xs font-semibold transition-all bg-[#FAF7F2] border border-[#2D2D2D]/15 hover:bg-[#F0EBE3] text-[#2D2D2D]"
                      >
                        {language === 'id' ? 'Mirip Opsi B' : 'More like Option B'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#8E2435]/20 text-center space-y-2">
                    <span className="text-xs font-semibold text-emerald-700 block">✓ {language === 'id' ? 'Pilihanmu sudah tersimpan' : 'Your choice is locked'}</span>
                    <p className="font-serif italic text-sm text-[#2D2D2D]">
                      {language === 'id' ? `Kamu memilih: ${myChoice === 'A' ? 'Opsi A' : 'Opsi B'}` : `You picked: ${myChoice === 'A' ? 'Option A' : 'Option B'}`}
                    </p>
                    <p className="text-xs text-[#6E6664] italic">
                      {language === 'id' ? `Menunggu ${partnerName || 'pasanganmu'} memilih...` : `Waiting for ${partnerName || 'partner'}...`}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <span className="text-xs font-semibold text-[#8E2435] bg-[#FAF7F2] px-3 py-1 rounded-full border border-[#8E2435]/15">
                    {p1Choice === p2Choice
                      ? (language === 'id' ? '✨ Kalian Berdua Mirip!' : '✨ You Both Match!')
                      : (language === 'id' ? '💫 Unik & Saling Melengkapi!' : '💫 Unique & Complementary!')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Jawaban dari Namamu (Kamu) */}
                  <div className="p-5 rounded-2xl bg-white border-2 border-[#8E2435]/25 shadow-xs space-y-2 text-left">
                    <div className="flex items-center justify-between pb-1 border-b border-[#2D2D2D]/5">
                      <span className="text-xs font-bold text-[#8E2435] flex items-center gap-1.5">
                        <span>💬 {language === 'id' ? `Pilihan dari ${myName || profile.player1}` : `Choice from ${myName || profile.player1}`}</span>
                        <span className="text-[10px] bg-[#8E2435]/10 text-[#8E2435] px-2 py-0.5 rounded-full font-semibold">
                          {language === 'id' ? 'Kamu' : 'You'}
                        </span>
                      </span>
                      <span className="text-[10px] font-bold text-[#8E2435] bg-[#FAF7F2] px-2 py-0.5 rounded-full">
                        {myChoice === 'A' ? 'Opsi A' : 'Opsi B'}
                      </span>
                    </div>
                    <p className="font-serif italic text-sm sm:text-base text-[#1a1a1a] leading-relaxed pt-1">
                      "{myChoice === 'A' ? currentItem.statementA : currentItem.statementB}"
                    </p>
                  </div>

                  {/* Jawaban dari Nama Pasanganmu */}
                  <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#2D2D2D]/15 space-y-2 text-left">
                    <div className="flex items-center justify-between pb-1 border-b border-[#2D2D2D]/5">
                      <span className="text-xs font-bold text-[#2D2D2D] flex items-center gap-1.5">
                        <span>💌 {language === 'id' ? `Pilihan dari ${partnerName || profile.player2}` : `Choice from ${partnerName || profile.player2}`}</span>
                        <span className="text-[10px] bg-[#2D2D2D]/10 text-[#2D2D2D] px-2 py-0.5 rounded-full font-semibold">
                          {language === 'id' ? 'Pasangan' : 'Partner'}
                        </span>
                      </span>
                      <span className="text-[10px] font-bold text-[#2D2D2D] bg-white px-2 py-0.5 rounded-full border border-[#2D2D2D]/10">
                        {partnerChoice === 'A' ? 'Opsi A' : 'Opsi B'}
                      </span>
                    </div>
                    <p className="font-serif italic text-sm sm:text-base text-[#2D2D2D] leading-relaxed pt-1">
                      "{partnerChoice === 'A' ? currentItem.statementA : currentItem.statementB}"
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
      </div>

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
