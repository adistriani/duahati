import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChaosItem, CoupleProfile } from '../../types';
import { getChaosItems, generateDynamicChaos } from '../../data/questions';
import { sound } from '../../utils/audio';
import { Laugh, ArrowRight, Zap, Radio, Users, CheckCircle2, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useRealtime } from '../../context/RealtimeContext';
import { useLanguage } from '../../context/LanguageContext';
import { GameInstructionsCard } from '../GameInstructionsCard';

interface ChaosModeGameProps {
  profile: CoupleProfile;
  onBackToLobby: () => void;
  questionsExplored?: number;
  onIncrementExplored?: () => void;
}

export const ChaosModeGame: React.FC<ChaosModeGameProps> = ({
  profile,
  onBackToLobby,
  questionsExplored,
  onIncrementExplored
}) => {
  const { isOnlineMode, myRole, myName, partnerName, sendGameAction, onGameSync } = useRealtime();
  const { language, t } = useLanguage();

  const [showInstructions, setShowInstructions] = useState(true);
  const [items, setItems] = useState<ChaosItem[]>(() => getChaosItems(language));
  const [index, setIndex] = useState(0);
  const [p1Vote, setP1Vote] = useState<string | null>(null);
  const [p2Vote, setP2Vote] = useState<string | null>(null);
  const [offlineVerdict, setOfflineVerdict] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setItems(getChaosItems(language));
  }, [language]);

  const currentItem = items[index] || generateDynamicChaos(index, language);

  // Realtime Sync Subscription
  useEffect(() => {
    if (!isOnlineMode) return;

    const unsubscribe = onGameSync((data) => {
      if (data.gameKey !== 'chaos-mode') return;

      if (data.action === 'CHAOS_NEXT') {
        if (data.state.index !== undefined) setIndex(data.state.index);
        setP1Vote(null);
        setP2Vote(null);
        setRevealed(false);
        sound.playTap();
      } else if (data.action === 'VOTE_CAST') {
        if (data.state.p1Vote !== undefined) setP1Vote(data.state.p1Vote);
        if (data.state.p2Vote !== undefined) setP2Vote(data.state.p2Vote);
        if (data.bothVoted) {
          setRevealed(true);
          sound.playReveal();
          if (data.state.p1Vote === data.state.p2Vote) {
            confetti({
              particleCount: 35,
              spread: 60,
              origin: { y: 0.7 },
              colors: ['#D8A499', '#8E2435', '#FAF7F2']
            });
          }
        }
      }
    });

    return unsubscribe;
  }, [isOnlineMode, onGameSync]);

  const handleNext = () => {
    sound.playTap();
    onIncrementExplored?.();
    const nextIdx = index + 1;
    if (nextIdx >= items.length) {
      const dyn = generateDynamicChaos(nextIdx + 10, language);
      setItems(prev => [...prev, dyn]);
    }

    if (isOnlineMode) {
      sendGameAction('CHAOS_NEXT', {
        gameKey: 'chaos-mode',
        nextIndex: nextIdx
      });
    } else {
      setP1Vote(null);
      setP2Vote(null);
      setOfflineVerdict(null);
      setRevealed(false);
      setIndex(nextIdx);
    }
  };

  const handleOfflineVote = (winner: string) => {
    sound.playTap();
    setOfflineVerdict(winner);
    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#D8A499', '#8E2435', '#FAF7F2']
    });
  };

  const handleOnlineVote = (votedFor: string) => {
    sound.playTap();
    if (myRole === 'player1') {
      setP1Vote(votedFor);
      sendGameAction('VOTE_CAST', {
        gameKey: 'chaos-mode',
        vote: votedFor,
        p1Vote: votedFor,
        index
      });
      if (p2Vote) setRevealed(true);
    } else {
      setP2Vote(votedFor);
      sendGameAction('VOTE_CAST', {
        gameKey: 'chaos-mode',
        vote: votedFor,
        p2Vote: votedFor,
        index
      });
      if (p1Vote) setRevealed(true);
    }
  };

  if (showInstructions) {
    return (
      <GameInstructionsCard
        mode="chaos"
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
                {language === 'id' ? `Tantangan #${index + 1}` : `Prompt #${index + 1}`}
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
                <span className="text-[11px] px-3 py-1 rounded-full bg-amber-50 text-amber-800 font-semibold flex items-center gap-1">
                  <Laugh className="w-3 h-3" /> {language === 'id' ? 'Tawa spontan' : 'Playful'}
                </span>
              </div>
            </div>

            {/* Prompt Text */}
            <div className="text-center space-y-3 py-4">
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#1a1a1a] leading-relaxed italic">
                “{currentItem.prompt}”
              </h2>
            </div>

            {/* Voting Section */}
            {!isOnlineMode ? (
              /* Offline 1-Screen Mode */
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-[#F9F7F2] border border-[#2D2D2D]/10 text-center space-y-3">
                  <div className="text-xs font-semibold text-[#8E2435]">
                    {language === 'id' ? 'Siapa nih yang paling cocok sama tuduhan di atas?' : 'Who is the culprit for this one?'}
                  </div>
                  <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                    <button
                      onClick={() => handleOfflineVote(profile.player1)}
                      className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                        offlineVerdict === profile.player1
                          ? 'bg-[#8E2435] text-white shadow-xs'
                          : 'bg-white border border-[#2D2D2D]/15 text-[#2D2D2D] hover:bg-[#F0EBE3]'
                      }`}
                    >
                      👈 {profile.player1}
                    </button>
                    <button
                      onClick={() => handleOfflineVote(profile.player2)}
                      className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                        offlineVerdict === profile.player2
                          ? 'bg-[#8E2435] text-white shadow-xs'
                          : 'bg-white border border-[#2D2D2D]/15 text-[#2D2D2D] hover:bg-[#F0EBE3]'
                      }`}
                    >
                      👉 {profile.player2}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Online 2-Phone Mode */
              <div className="space-y-6">
                {!revealed ? (
                  <div className="space-y-4 max-w-sm mx-auto text-center">
                    {!(myRole === 'player1' ? p1Vote : p2Vote) ? (
                      <>
                        <div className="text-xs font-semibold text-[#8E2435]">
                          {language === 'id' ? 'Pilih siapa menurutmu:' : 'Vote for who:'}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => handleOnlineVote(profile.player1)}
                            className="p-4 rounded-2xl text-xs sm:text-sm font-semibold transition-all bg-[#FAF7F2] border border-[#2D2D2D]/15 text-[#2D2D2D] hover:bg-[#F0EBE3]"
                          >
                            👈 {profile.player1}
                          </button>
                          <button
                            onClick={() => handleOnlineVote(profile.player2)}
                            className="p-4 rounded-2xl text-xs sm:text-sm font-semibold transition-all bg-[#FAF7F2] border border-[#2D2D2D]/15 text-[#2D2D2D] hover:bg-[#F0EBE3]"
                          >
                            👉 {profile.player2}
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#8E2435]/20 text-center space-y-2">
                        <span className="text-xs font-semibold text-emerald-700 block">✓ {language === 'id' ? 'Pilihanmu sudah terkunci' : 'Your vote is locked'}</span>
                        <p className="font-serif italic text-sm text-[#2D2D2D]">
                          {language === 'id' ? `Kamu memilih: ${myRole === 'player1' ? p1Vote : p2Vote}` : `You voted for: ${myRole === 'player1' ? p1Vote : p2Vote}`}
                        </p>
                        <p className="text-xs text-[#6E6664] italic">
                          {language === 'id' ? `Menunggu ${partnerName || 'pasanganmu'} memilih...` : `Waiting for ${partnerName || 'partner'}...`}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#8E2435]/20 text-center space-y-2">
                      <h3 className="font-serif italic text-base sm:text-lg text-[#1a1a1a]">
                        {p1Vote === p2Vote
                          ? (language === 'id' ? `🎉 Kalian berdua sepakat: ${p1Vote} juaranya! 😂` : `🎉 You both agree: ${p1Vote} takes the crown! 😂`)
                          : (language === 'id' ? `🤣 Saling tuduh! Pilihan kalian berbeda!` : `🤣 Plot twist! Different votes!`)}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Pilihan dari Namamu (Kamu) */}
                      <div className="p-5 rounded-2xl bg-white border-2 border-[#8E2435]/25 shadow-xs space-y-2 text-left">
                        <div className="flex items-center justify-between pb-1 border-b border-[#2D2D2D]/5">
                          <span className="text-xs font-bold text-[#8E2435] flex items-center gap-1.5">
                            <span>💬 {language === 'id' ? `Pilihan dari ${myName || (myRole === 'player1' ? profile.player1 : profile.player2)}` : `Vote from ${myName || (myRole === 'player1' ? profile.player1 : profile.player2)}`}</span>
                            <span className="text-[10px] bg-[#8E2435]/10 text-[#8E2435] px-2 py-0.5 rounded-full font-semibold">
                              {language === 'id' ? 'Kamu' : 'You'}
                            </span>
                          </span>
                        </div>
                        <p className="font-serif italic text-base font-semibold text-[#1a1a1a] pt-1">
                          👉 Menunjuk: <span className="text-[#8E2435]">{myRole === 'player1' ? p1Vote : p2Vote}</span>
                        </p>
                      </div>

                      {/* Pilihan dari Nama Pasanganmu */}
                      <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#2D2D2D]/15 space-y-2 text-left">
                        <div className="flex items-center justify-between pb-1 border-b border-[#2D2D2D]/5">
                          <span className="text-xs font-bold text-[#2D2D2D] flex items-center gap-1.5">
                            <span>💌 {language === 'id' ? `Pilihan dari ${partnerName || (myRole === 'player1' ? profile.player2 : profile.player1)}` : `Vote from ${partnerName || (myRole === 'player1' ? profile.player2 : profile.player1)}`}</span>
                            <span className="text-[10px] bg-[#2D2D2D]/10 text-[#2D2D2D] px-2 py-0.5 rounded-full font-semibold">
                              {language === 'id' ? 'Pasangan' : 'Partner'}
                            </span>
                          </span>
                        </div>
                        <p className="font-serif italic text-base font-semibold text-[#2D2D2D] pt-1">
                          👉 Menunjuk: <span className="text-[#8E2435]">{myRole === 'player1' ? p2Vote : p1Vote}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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
