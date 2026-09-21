import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BaseQuestion, CoupleProfile } from '../../types';
import { getBaseQuestions, getNextBaseQuestion, ConversationDepth } from '../../data/questions';
import { sound } from '../../utils/audio';
import { ArrowRight, CheckCircle2, HelpCircle } from 'lucide-react';
import { useRealtime } from '../../context/RealtimeContext';
import { useLanguage } from '../../context/LanguageContext';
import { GameInstructionsCard } from '../GameInstructionsCard';

interface DeepTalkGameProps {
  profile: CoupleProfile;
  onBackToLobby: () => void;
  questionsExplored?: number;
  onIncrementExplored?: () => void;
}

export const DeepTalkGame: React.FC<DeepTalkGameProps> = ({
  profile,
  onBackToLobby,
  questionsExplored,
  onIncrementExplored
}) => {
  const { isOnlineMode, myRole, myName, partnerName, partnerStatus, isPartnerTyping, sendTyping, sendGameAction, onGameSync } = useRealtime();
  const { language, t } = useLanguage();

  const [showInstructions, setShowInstructions] = useState(true);
  const [questionList, setQuestionList] = useState<BaseQuestion[]>(() => {
    return getBaseQuestions(language).filter(q => q.category === 'Deep Talk');
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedDepth, setSelectedDepth] = useState<ConversationDepth>('personal');

  // Update question list on language change
  useEffect(() => {
    setQuestionList(getBaseQuestions(language).filter(q => q.category === 'Deep Talk'));
  }, [language]);

  // Online Mode state
  const [onlineStep, setOnlineStep] = useState<'answering' | 'revealed'>('answering');
  const [ans1, setAns1] = useState('');
  const [ans2, setAns2] = useState('');
  const [myAnswer, setMyAnswer] = useState('');
  const [myLocked, setMyLocked] = useState(false);
  const [partnerLocked, setPartnerLocked] = useState(false);
  const [bothReadyToReveal, setBothReadyToReveal] = useState(false);

  // Ensure current question is always present, generating dynamically if index goes beyond list
  const currentQ = questionList[currentIndex] || getNextBaseQuestion('Deep Talk', selectedDepth, questionList.map(q => q.id), language, profile.player1, profile.player2);

  // Subscribe to Realtime Game Sync
  useEffect(() => {
    if (!isOnlineMode) return;

    const unsubscribe = onGameSync((data) => {
      if (data.gameKey !== 'deep-talk') return;

      if (data.action === 'ANSWER_LOCKED') {
        const state = data.state;
        if (state.index !== undefined) setCurrentIndex(state.index);

        if (state.p1Answer !== undefined && state.p1Answer !== '') setAns1(state.p1Answer);
        if (state.p2Answer !== undefined && state.p2Answer !== '') setAns2(state.p2Answer);

        if (myRole === 'player1') {
          if (state.p2Locked) setPartnerLocked(true);
        } else {
          if (state.p1Locked) setPartnerLocked(true);
        }

        if (data.bothReady || (state.p1Locked && state.p2Locked) || state.revealed) {
          setBothReadyToReveal(true);
          sound.playLockIn();
          setTimeout(() => {
            setOnlineStep('revealed');
            sound.playReveal();
          }, 600);
        }
      } else if (data.action === 'ANSWERS_REVEALED') {
        if (data.state.p1Answer) setAns1(data.state.p1Answer);
        if (data.state.p2Answer) setAns2(data.state.p2Answer);
        setOnlineStep('revealed');
        sound.playReveal();
      } else if (data.action === 'ROUND_RESET') {
        setCurrentIndex(data.state.index || 0);
        setMyAnswer('');
        setMyLocked(false);
        setPartnerLocked(false);
        setBothReadyToReveal(false);
        setAns1('');
        setAns2('');
        setOnlineStep('answering');
        sound.playTap();
      }
    });

    return unsubscribe;
  }, [isOnlineMode, myRole, onGameSync]);

  const handleTypingChange = (val: string) => {
    setMyAnswer(val);
    if (isOnlineMode) {
      sendTyping(val.length > 0);
    }
  };

  const handleOnlineSubmit = () => {
    if (!myAnswer.trim()) return;
    sound.playLockIn();
    setMyLocked(true);
    if (myRole === 'player1') setAns1(myAnswer.trim());
    else setAns2(myAnswer.trim());

    sendGameAction('ANSWER_SUBMIT', {
      gameKey: 'deep-talk',
      answer: myAnswer.trim(),
      index: currentIndex
    });
  };

  const handleNextQuestion = () => {
    sound.playTap();
    onIncrementExplored?.();
    const nextIdx = currentIndex + 1;

    // Dynamically append new question if we approach end of current list
    if (nextIdx >= questionList.length) {
      const newQ = getNextBaseQuestion('Deep Talk', selectedDepth, questionList.map(q => q.id), language, profile.player1, profile.player2);
      setQuestionList(prev => [...prev, newQ]);
    }

    if (isOnlineMode) {
      sendGameAction('NEXT_ROUND', {
        gameKey: 'deep-talk',
        nextIndex: nextIdx
      });
    } else {
      setCurrentIndex(nextIdx);
    }
  };

  if (showInstructions) {
    return (
      <GameInstructionsCard
        mode="deep-talk"
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
          key={currentQ.id + (isOnlineMode ? onlineStep : 'offline')}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4 }}
          className="w-full relative group"
        >
          {/* Ambient crimson blur */}
          <div className="absolute inset-0 bg-[#8E2435] rounded-[32px] blur-2xl opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none" />

          {/* The Main Question Card */}
          <div className="relative bg-white rounded-[32px] p-6 sm:p-10 border border-[#2D2D2D]/10 shadow-xl shadow-[#2D2D2D]/5 space-y-8">
            {/* Card Meta Top */}
            <div className="flex items-center justify-between pb-4 border-b border-[#2D2D2D]/8">
              <span className="text-xs font-serif text-[#2D2D2D]/60 italic">
                {language === 'id' ? `Pertanyaan #${currentIndex + 1}` : `Question #${currentIndex + 1}`}
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
                  {currentQ.difficulty || '🌙 Mendalam'}
                </span>
              </div>
            </div>

            {/* Question Text */}
            <div className="text-center space-y-3 py-2">
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#1a1a1a] leading-relaxed italic">
                “{currentQ.text}”
              </h2>
            </div>

            {/* Online 2-Phone Mode Interactive Inputs */}
            {isOnlineMode && (
              <div className="space-y-6">
                {onlineStep !== 'revealed' ? (
                  <div className="space-y-6 max-w-xl mx-auto">
                    {/* Partner Live Status Bar */}
                    <div className="p-4 rounded-2xl bg-[#F9F7F2] border border-[#2D2D2D]/10 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold text-[#2D2D2D]">{partnerName}</span>
                      </div>

                      <div className="text-xs">
                        {partnerLocked ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" /> {language === 'id' ? 'Jawaban terkunci' : 'Answer locked'}
                          </span>
                        ) : isPartnerTyping ? (
                          <span className="text-[#8E2435] italic font-serif animate-pulse">
                            ✍️ {partnerName} {t('isTyping')}
                          </span>
                        ) : (
                          <span className="text-[#2D2D2D]/60 italic font-serif">
                            {language === 'id' ? 'Sedang memikirkan jawaban...' : 'Thinking of an answer...'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* My Input Area */}
                    {!myLocked ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs text-[#8E2435] font-semibold">
                          <span>{language === 'id' ? `Jawaban jujurmu (${myName}):` : `Your answer (${myName}):`}</span>
                          <span className="text-[#2D2D2D]/50 text-[11px]">{language === 'id' ? 'Ketik santai' : 'Take your time'}</span>
                        </div>

                        <textarea
                          rows={4}
                          value={myAnswer}
                          onChange={(e) => handleTypingChange(e.target.value)}
                          placeholder={language === 'id' ? 'Ceritakan dari hati yang paling jujur...' : 'Write openly from the heart...'}
                          className="w-full p-4 rounded-2xl border border-[#2D2D2D]/15 focus:border-[#8E2435] bg-[#F9F7F2]/60 text-sm text-[#2D2D2D] focus:outline-hidden leading-relaxed custom-scrollbar"
                        />

                        <button
                          id="deep-talk-lock-btn"
                          onClick={handleOnlineSubmit}
                          disabled={!myAnswer.trim()}
                          className="w-full py-3.5 rounded-xl bg-[#8E2435] hover:bg-[#781E2C] text-white text-xs sm:text-sm font-semibold transition-all disabled:opacity-40 shadow-xs"
                        >
                          {language === 'id' ? 'Kunci jawaban saya' : 'Lock my answer'}
                        </button>
                      </div>
                    ) : (
                      <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#8E2435]/20 text-center space-y-3">
                        <span className="text-xs font-semibold text-emerald-700 block">✓ {language === 'id' ? 'Jawabanmu sudah terkunci' : 'Your answer is locked'}</span>
                        <p className="font-serif italic text-sm text-[#2D2D2D]">"{myAnswer}"</p>
                        <p className="text-xs text-[#6E6664] italic">
                          {partnerLocked ? (language === 'id' ? 'Membuka jawaban bersama...' : 'Revealing answers...') : (language === 'id' ? `Menunggu ${partnerName} mengunci jawaban...` : `Waiting for ${partnerName}...`)}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center">
                      <span className="text-xs font-semibold text-[#8E2435] bg-[#FAF7F2] px-3 py-1 rounded-full border border-[#8E2435]/15">
                        {language === 'id' ? '✨ Jawaban Terbuka Bersama' : '✨ Answers Revealed Together'}
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
            )}

            {/* Action Bar - Clean Kartu Berikutnya button */}
            <div className="flex items-center justify-end pt-4 border-t border-[#2D2D2D]/8">
              <button
                id="deep-talk-next-btn"
                onClick={handleNextQuestion}
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
