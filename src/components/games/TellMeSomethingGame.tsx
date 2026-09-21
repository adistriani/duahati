import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CoupleProfile, MemoryKeepsake } from '../../types';
import { getTellMePrompts, generateDynamicTellMe } from '../../data/questions';
import { sound } from '../../utils/audio';
import { ArrowRight, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useRealtime } from '../../context/RealtimeContext';
import { useLanguage } from '../../context/LanguageContext';
import { GameInstructionsCard } from '../GameInstructionsCard';

interface TellMeSomethingGameProps {
  profile: CoupleProfile;
  onBackToLobby: () => void;
  questionsExplored?: number;
  onIncrementExplored?: () => void;
}

export const TellMeSomethingGame: React.FC<TellMeSomethingGameProps> = ({
  profile,
  onBackToLobby,
  questionsExplored,
  onIncrementExplored
}) => {
  const { isOnlineMode, myRole, myName, partnerName, isPartnerTyping, sendTyping, sendGameAction, onGameSync } = useRealtime();
  const { language, t } = useLanguage();

  const [showInstructions, setShowInstructions] = useState(true);
  const [prompts, setPrompts] = useState<string[]>(() => getTellMePrompts(language));
  const [index, setIndex] = useState(0);
  const [speakerIsP1, setSpeakerIsP1] = useState(true);
  const [writtenAnswer, setWrittenAnswer] = useState('');
  const [partnerAnswer, setPartnerAnswer] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    setPrompts(getTellMePrompts(language));
  }, [language]);

  const currentPrompt = prompts[index % prompts.length];
  const speaker = speakerIsP1 ? profile.player1 : profile.player2;
  const listener = speakerIsP1 ? profile.player2 : profile.player1;

  const isCurrentSpeaker = isOnlineMode
    ? (speakerIsP1 ? myRole === 'player1' : myRole === 'player2')
    : true;

  // Realtime Sync Subscription
  useEffect(() => {
    if (!isOnlineMode) return;

    const unsubscribe = onGameSync((data) => {
      if (data.gameKey !== 'tell-me-something') return;

      if (data.action === 'PROMPT_NEXT') {
        if (data.state.index !== undefined) setIndex(data.state.index);
        if (data.state.speakerIsP1 !== undefined) setSpeakerIsP1(data.state.speakerIsP1);
        setWrittenAnswer('');
        setPartnerAnswer('');
        setHasSubmitted(false);
        sound.playTap();
      } else if (data.action === 'ANSWER_SHARED') {
        setPartnerAnswer(data.answer);
        sound.playReveal();
      }
    });

    return unsubscribe;
  }, [isOnlineMode, onGameSync]);

  const handleTypingChange = (val: string) => {
    setWrittenAnswer(val);
    if (isOnlineMode) {
      sendTyping(val.length > 0);
    }
  };

  const handleNext = () => {
    sound.playTap();
    onIncrementExplored?.();
    const nextIdx = index + 1;
    const nextSpeakerIsP1 = !speakerIsP1;

    if (nextIdx >= prompts.length) {
      const dyn = generateDynamicTellMe(nextIdx + 3, language);
      setPrompts(prev => [...prev, dyn]);
    }

    if (isOnlineMode) {
      sendGameAction('TELL_ME_NEXT', {
        gameKey: 'tell-me-something',
        nextIndex: nextIdx,
        speakerIsP1: nextSpeakerIsP1
      });
    } else {
      setWrittenAnswer('');
      setPartnerAnswer('');
      setHasSubmitted(false);
      setSpeakerIsP1(nextSpeakerIsP1);
      setIndex(nextIdx);
    }
  };

  const handleShareToPartner = () => {
    if (!writtenAnswer.trim()) return;
    sound.playReveal();
    setHasSubmitted(true);
    if (isOnlineMode) {
      sendGameAction('TELL_ME_SHARE', {
        gameKey: 'tell-me-something',
        answer: writtenAnswer.trim(),
        index
      });
    }
  };

  if (showInstructions) {
    return (
      <GameInstructionsCard
        mode="tell-me"
        profile={profile}
        onStart={() => setShowInstructions(false)}
        onBackToLobby={onBackToLobby}
      />
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center max-w-3xl mx-auto px-4 py-8 relative z-10">
      <motion.div
        key={currentPrompt}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full bg-white rounded-[32px] p-6 sm:p-10 border border-[#2D2D2D]/10 shadow-xl shadow-[#2D2D2D]/5 space-y-8"
      >
        {/* Meta Top */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2D2D2D]/8">
          <span className="text-xs font-serif text-[#2D2D2D]/60 italic">
            {language === 'id' ? `Prompt #${index + 1}` : `Prompt #${index + 1}`}
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
              {speaker} ➔ {listener}
            </span>
          </div>
        </div>

        {/* Prompt Card */}
        <div className="text-center space-y-3 py-2">
          <span className="text-xs text-[#8E2435] font-medium block">
            {language === 'id' ? 'Ceritakan tentang:' : 'Tell me about:'}
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#1a1a1a] leading-relaxed italic">
            “{currentPrompt}”
          </h2>
        </div>

        {/* Online Interaction Area */}
        {isOnlineMode && (
          <div className="space-y-4">
            {isCurrentSpeaker ? (
              <div className="space-y-4">
                {!hasSubmitted ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-[#8E2435] font-semibold">
                      <span>{language === 'id' ? `Jawaban dari ${myName || speaker} (Kamu):` : `Your answer (${myName || speaker}):`}</span>
                      <span className="text-[11px] text-[#2D2D2D]/50 font-normal">{language === 'id' ? 'Tuliskan dari hati' : 'From the heart'}</span>
                    </div>
                    <textarea
                      rows={3}
                      value={writtenAnswer}
                      onChange={(e) => handleTypingChange(e.target.value)}
                      placeholder={language === 'id' ? 'Tuliskan untuk pasanganmu...' : 'Write for your partner...'}
                      className="w-full p-4 rounded-2xl border border-[#2D2D2D]/15 focus:border-[#8E2435] bg-[#F9F7F2]/60 text-xs sm:text-sm text-[#2D2D2D] focus:outline-hidden"
                    />
                    <button
                      onClick={handleShareToPartner}
                      disabled={!writtenAnswer.trim()}
                      className="w-full py-3.5 rounded-xl bg-[#8E2435] disabled:opacity-40 hover:bg-[#781E2C] text-white text-xs font-semibold shadow-xs"
                    >
                      {language === 'id' ? 'Kirim ke HP pasangan' : 'Send to partner’s phone'}
                    </button>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-white border-2 border-[#8E2435]/25 shadow-xs space-y-2 text-left">
                    <div className="flex items-center justify-between pb-1 border-b border-[#2D2D2D]/5">
                      <span className="text-xs font-bold text-[#8E2435] flex items-center gap-1.5">
                        <span>💬 {language === 'id' ? `Jawaban dari ${myName || speaker}` : `Answer from ${myName || speaker}`}</span>
                        <span className="text-[10px] bg-[#8E2435]/10 text-[#8E2435] px-2 py-0.5 rounded-full font-semibold">
                          {language === 'id' ? 'Kamu' : 'You'}
                        </span>
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                        ✓ {language === 'id' ? 'Terkirim' : 'Sent'}
                      </span>
                    </div>
                    <p className="font-serif italic text-sm sm:text-base text-[#1a1a1a] leading-relaxed pt-1">
                      "{writtenAnswer}"
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {partnerAnswer ? (
                  <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#2D2D2D]/15 space-y-2 text-left">
                    <div className="flex items-center justify-between pb-1 border-b border-[#2D2D2D]/5">
                      <span className="text-xs font-bold text-[#2D2D2D] flex items-center gap-1.5">
                        <span>💌 {language === 'id' ? `Jawaban dari ${partnerName || speaker}` : `Answer from ${partnerName || speaker}`}</span>
                        <span className="text-[10px] bg-[#2D2D2D]/10 text-[#2D2D2D] px-2 py-0.5 rounded-full font-semibold">
                          {language === 'id' ? 'Pasangan' : 'Partner'}
                        </span>
                      </span>
                      <span className="text-[10px] bg-rose-100 text-[#8E2435] font-semibold px-2 py-0.5 rounded-full">
                        {language === 'id' ? 'Baru saja diterima' : 'Just received'}
                      </span>
                    </div>
                    <p className="font-serif italic text-sm sm:text-base text-[#2D2D2D] leading-relaxed pt-1">
                      "{partnerAnswer}"
                    </p>
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl bg-[#FAF7F2] border border-[#8E2435]/20 text-center space-y-2">
                    <span className="text-xl block animate-pulse">✍️</span>
                    <span className="text-xs text-[#6E6664] italic">
                      {partnerName || speaker} {language === 'id' ? 'sedang menulis ceritanya untukmu...' : 'is writing their story for you...'}
                    </span>
                  </div>
                )}
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
