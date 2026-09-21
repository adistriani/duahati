import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { HowWellItem, CoupleProfile, MemoryKeepsake } from '../../types';
import { getHowWellItems, generateDynamicHowWell } from '../../data/questions';
import { sound } from '../../utils/audio';
import { Flame, Sparkles, ArrowRight, RefreshCw, Radio, CheckCircle2, Lock, MessageCircle, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useRealtime } from '../../context/RealtimeContext';
import { useLanguage } from '../../context/LanguageContext';
import { GameInstructionsCard } from '../GameInstructionsCard';

interface HowWellGameProps {
  profile: CoupleProfile;
  onBackToLobby: () => void;
  questionsExplored?: number;
  onIncrementExplored?: () => void;
}

export const HowWellDoYouKnowMeGame: React.FC<HowWellGameProps> = ({
  profile,
  onBackToLobby,
  questionsExplored,
  onIncrementExplored
}) => {
  const { isOnlineMode, myRole, myName, partnerName, sendGameAction, onGameSync } = useRealtime();
  const { language, t } = useLanguage();

  const [showInstructions, setShowInstructions] = useState(true);
  const [items, setItems] = useState<HowWellItem[]>(() => getHowWellItems(language));
  const [index, setIndex] = useState(0);
  const [guesserIsP1, setGuesserIsP1] = useState(true);
  const [step, setStep] = useState<'secret_actual' | 'guess' | 'reveal'>('secret_actual');
  const [actualAnswerIndex, setActualAnswerIndex] = useState<number | null>(null);
  const [guessedIndex, setGuessedIndex] = useState<number | null>(null);
  const [points, setPoints] = useState(0);
  const [offlineFeedback, setOfflineFeedback] = useState<'correct' | 'learned' | null>(null);
  const [showExplanationSpark, setShowExplanationSpark] = useState(false);

  useEffect(() => {
    setItems(getHowWellItems(language));
  }, [language]);

  const currentItem = items[index] || generateDynamicHowWell(index, language);

  const targetPerson = guesserIsP1 ? profile.player2 : profile.player1;
  const guesserPerson = guesserIsP1 ? profile.player1 : profile.player2;

  // Realtime Sync Subscription
  useEffect(() => {
    if (!isOnlineMode) return;

    const unsubscribe = onGameSync((data) => {
      if (data.gameKey !== 'how-well') return;

      if (data.action === 'ACTUAL_SELECTED') {
        if (data.state.actualIndex !== undefined) setActualAnswerIndex(data.state.actualIndex);
        setStep('guess');
        sound.playLockIn();
      } else if (data.action === 'GUESS_REVEALED') {
        if (data.state.guessedIndex !== undefined) setGuessedIndex(data.state.guessedIndex);
        if (data.state.actualIndex !== undefined) setActualAnswerIndex(data.state.actualIndex);
        setStep('reveal');
        sound.playReveal();

        if (data.state.guessedIndex === data.state.actualIndex) {
          setPoints((prev) => prev + 1);
          confetti({
            particleCount: 30,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#D8A499', '#8E2435', '#FAF7F2']
          });
        }
      } else if (data.action === 'NEXT_ROUND') {
        setActualAnswerIndex(null);
        setGuessedIndex(null);
        setStep('secret_actual');
        setOfflineFeedback(null);
        setShowExplanationSpark(false);
        if (data.state.guesserIsP1 !== undefined) setGuesserIsP1(data.state.guesserIsP1);
        if (data.state.index !== undefined) setIndex(data.state.index);
        sound.playTap();
      }
    });

    return unsubscribe;
  }, [isOnlineMode, onGameSync]);

  const isTarget = isOnlineMode
    ? (guesserIsP1 ? myRole === 'player2' : myRole === 'player1')
    : true;

  const isGuesser = isOnlineMode
    ? (guesserIsP1 ? myRole === 'player1' : myRole === 'player2')
    : true;

  const handleSelectActual = (idx: number) => {
    sound.playLockIn();
    setActualAnswerIndex(idx);
    setStep('guess');
    if (isOnlineMode) {
      sendGameAction('HOW_WELL_ACTUAL_SELECT', {
        gameKey: 'how-well',
        actualIndex: idx,
        index
      });
    }
  };

  const handleSelectGuess = (idx: number) => {
    sound.playReveal();
    setGuessedIndex(idx);
    setStep('reveal');

    if (isOnlineMode) {
      sendGameAction('HOW_WELL_GUESS_SUBMIT', {
        gameKey: 'how-well',
        guessedIndex: idx,
        actualIndex: actualAnswerIndex,
        index
      });
    }

    if (idx === actualAnswerIndex) {
      setPoints((prev) => prev + 1);
      confetti({
        particleCount: 25,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#D8A499', '#8E2435', '#FAF7F2']
      });
    }
  };

  const handleNext = () => {
    sound.playTap();
    onIncrementExplored?.();
    const nextIdx = index + 1;
    const nextGuesserIsP1 = !guesserIsP1;

    if (nextIdx >= items.length) {
      const dyn = generateDynamicHowWell(nextIdx + 5, language);
      setItems(prev => [...prev, dyn]);
    }

    if (isOnlineMode) {
      sendGameAction('HOW_WELL_NEXT', {
        gameKey: 'how-well',
        nextIndex: nextIdx,
        guesserIsP1: nextGuesserIsP1
      });
    } else {
      setActualAnswerIndex(null);
      setGuessedIndex(null);
      setStep('secret_actual');
      setOfflineFeedback(null);
      setShowExplanationSpark(false);
      setGuesserIsP1(nextGuesserIsP1);
      setIndex(nextIdx);
    }
  };

  if (showInstructions) {
    return (
      <GameInstructionsCard
        mode="how-well"
        profile={profile}
        onStart={() => setShowInstructions(false)}
        onBackToLobby={onBackToLobby}
      />
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center max-w-3xl mx-auto px-4 py-8 relative z-10">
      <motion.div
        key={currentItem.id}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full bg-white rounded-[32px] p-6 sm:p-10 border border-[#2D2D2D]/10 shadow-xl shadow-[#2D2D2D]/5 space-y-8"
      >
        {/* Meta Top */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2D2D2D]/8">
          <div className="flex items-center gap-2">
            <span className="text-xs font-serif text-[#2D2D2D]/60 italic">
              {language === 'id' ? `Pertanyaan #${index + 1}` : `Question #${index + 1}`}
            </span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#8E2435]/10 text-[#8E2435] font-semibold">
              {guesserPerson} ➔ {targetPerson}
            </span>
          </div>
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
              {targetPerson} ({language === 'id' ? 'Target' : 'Target'})
            </span>
          </div>
        </div>

        {/* Question Prompt */}
        <div className="text-center space-y-3">
          <h2 className="font-serif text-2xl sm:text-3xl text-[#1a1a1a] leading-relaxed italic">
            “{currentItem.question}”
          </h2>
        </div>

        {/* 4 Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {currentItem.options.map((opt, i) => {
            const isActual = actualAnswerIndex === i;
            const isGuessed = guessedIndex === i;

            let cardStyle = 'bg-[#FAF7F2]/60 border-[#2D2D2D]/10 hover:bg-[#F9F7F2] text-[#2D2D2D]';
            if (step === 'reveal') {
              if (isActual) {
                cardStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold shadow-xs';
              } else if (isGuessed && !isActual) {
                cardStyle = 'bg-rose-50 border-rose-300 text-rose-800 opacity-70';
              }
            } else if (step === 'guess' && isActual && !isOnlineMode) {
              cardStyle = 'bg-[#8E2435]/10 border-[#8E2435] text-[#8E2435] font-semibold';
            }

            return (
              <button
                key={i}
                onClick={() => {
                  if (step === 'secret_actual' && (!isOnlineMode || isTarget)) {
                    handleSelectActual(i);
                  } else if (step === 'guess' && (!isOnlineMode || isGuesser)) {
                    handleSelectGuess(i);
                  }
                }}
                className={`p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all leading-relaxed ${cardStyle}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span>{opt}</span>
                  {step === 'reveal' && isActual && (
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                      ✓ {language === 'id' ? 'Jawaban asli' : 'Actual'}
                    </span>
                  )}
                  {step === 'reveal' && isGuessed && !isActual && (
                    <span className="text-[10px] text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                      ✗ {language === 'id' ? 'Tebakan' : 'Guessed'}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Revealed comparison cards */}
        {step === 'reveal' && actualAnswerIndex !== null && guessedIndex !== null && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {/* Card 1: Jawaban Asli */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border-2 border-emerald-500/30 space-y-1.5">
                <div className="flex items-center justify-between pb-1 border-b border-emerald-900/10">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <span>✨ {language === 'id' ? `Jawaban asli dari ${targetPerson}` : `Actual answer from ${targetPerson}`}</span>
                    {((isTarget && isOnlineMode) || (!isOnlineMode && !guesserIsP1)) && (
                      <span className="text-[10px] bg-emerald-200/70 text-emerald-900 px-2 py-0.2 rounded-full font-semibold">
                        {language === 'id' ? 'Kamu' : 'You'}
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {language === 'id' ? 'Kebenaran' : 'Truth'}
                  </span>
                </div>
                <p className="font-serif italic text-sm sm:text-base font-semibold text-emerald-950 pt-1 leading-relaxed">
                  "{currentItem.options[actualAnswerIndex]}"
                </p>
              </div>

              {/* Card 2: Tebakan Pasangan */}
              <div className={`p-4 rounded-2xl border-2 space-y-1.5 ${
                guessedIndex === actualAnswerIndex
                  ? 'bg-white border-emerald-500/30'
                  : 'bg-rose-50/70 border-rose-300'
              }`}>
                <div className="flex items-center justify-between pb-1 border-b border-[#2D2D2D]/5">
                  <span className={`text-xs font-bold flex items-center gap-1.5 ${
                    guessedIndex === actualAnswerIndex ? 'text-emerald-900' : 'text-rose-900'
                  }`}>
                    <span>🎯 {language === 'id' ? `Tebakan dari ${guesserPerson}` : `Guess from ${guesserPerson}`}</span>
                    {((isGuesser && isOnlineMode) || (!isOnlineMode && guesserIsP1)) && (
                      <span className="text-[10px] bg-rose-200/70 text-rose-900 px-2 py-0.2 rounded-full font-semibold">
                        {language === 'id' ? 'Kamu' : 'You'}
                      </span>
                    )}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    guessedIndex === actualAnswerIndex ? 'text-emerald-800 bg-emerald-100' : 'text-rose-700 bg-rose-100'
                  }`}>
                    {guessedIndex === actualAnswerIndex ? '✓ Tepat!' : '✗ Meleset'}
                  </span>
                </div>
                <p className={`font-serif italic text-sm sm:text-base font-semibold pt-1 leading-relaxed ${
                  guessedIndex === actualAnswerIndex ? 'text-emerald-950' : 'text-rose-950'
                }`}>
                  "{currentItem.options[guessedIndex]}"
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step Guide Hint */}
        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#8E2435]/15 text-center text-xs text-[#2D2D2D]/80 font-serif italic">
          {step === 'secret_actual' && (
            <span>
              {isOnlineMode && !isTarget ? (
                <span>⏳ {language === 'id' ? `Menunggu ${targetPerson} memilih jawaban aslinya di HP-nya...` : `Waiting for ${targetPerson} to pick...`}</span>
              ) : (
                <span>👉 <strong>{targetPerson}</strong>: {language === 'id' ? 'Klik opsi jawaban yang paling menggambarkan dirimu.' : 'Tap the option that truly describes you.'}</span>
              )}
            </span>
          )}
          {step === 'guess' && (
            <span>
              {isOnlineMode && !isGuesser ? (
                <span>✓ {language === 'id' ? `Kamu sudah memilih! Sekarang giliran ${guesserPerson} menebak pilihanmu...` : `Locked! Waiting for ${guesserPerson} to guess...`}</span>
              ) : (
                <span>👉 <strong>{guesserPerson}</strong>: {language === 'id' ? 'Tebak opsi mana yang tadi dipilih oleh' : 'Guess which option was chosen by'} {targetPerson}!</span>
              )}
            </span>
          )}
          {step === 'reveal' && (
            <span>
              {guessedIndex === actualAnswerIndex
                ? (language === 'id' ? '🎉 Tebakan tepat sekali! Kamu perhatian banget sama pasanganmu.' : '🎉 Spot on! You know your partner so well.')
                : (language === 'id' ? '💡 Jawaban sedikit berbeda! Saat yang pas buat dengar ceritanya.' : '💡 A little surprise! A great moment to hear their perspective.')}
            </span>
          )}
        </div>

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
