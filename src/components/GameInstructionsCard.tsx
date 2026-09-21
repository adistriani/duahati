import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Sparkles, Lightbulb, Users } from 'lucide-react';
import { CoupleProfile, GameModeId } from '../types';
import { GAME_INSTRUCTIONS } from '../data/gameInstructions';
import { useLanguage } from '../context/LanguageContext';
import { sound } from '../utils/audio';

interface GameInstructionsCardProps {
  mode: GameModeId;
  profile: CoupleProfile;
  onStart: () => void;
  onBackToLobby: () => void;
}

export const GameInstructionsCard: React.FC<GameInstructionsCardProps> = ({
  mode,
  profile,
  onStart,
  onBackToLobby
}) => {
  const { language } = useLanguage();
  const info = GAME_INSTRUCTIONS[mode] || (mode === ('tell-me-something' as any) ? GAME_INSTRUCTIONS['tell-me'] : undefined) || (mode === 'tell-me' ? GAME_INSTRUCTIONS['tell-me'] : undefined);

  if (!info) {
    return null;
  }

  const p1 = profile.player1 || (language === 'id' ? 'Kamu' : 'Partner 1');
  const p2 = profile.player2 || (language === 'id' ? 'Pasangan' : 'Partner 2');

  const handleStart = () => {
    sound.playSparkle();
    onStart();
  };

  return (
    <div className="min-h-[82vh] flex flex-col items-center justify-center max-w-2xl mx-auto px-4 py-6 sm:py-10 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full relative"
      >
        {/* Ambient Warm Glow */}
        <div className="absolute inset-0 bg-[#8E2435] rounded-[32px] blur-2xl opacity-5 pointer-events-none" />

        <div className="relative bg-white border border-[#2D2D2D]/10 rounded-[32px] p-6 sm:p-10 shadow-xl shadow-[#2D2D2D]/5 flex flex-col space-y-7">
          {/* Top Bar: Back & Badge */}
          <div className="flex items-center justify-between pb-4 border-b border-[#2D2D2D]/8">
            <button
              onClick={() => {
                sound.playTap();
                onBackToLobby();
              }}
              className="inline-flex items-center text-xs font-semibold text-[#2D2D2D]/70 hover:text-[#8E2435] transition-colors py-1 px-2 rounded-lg hover:bg-[#F0EBE3]"
            >
              <span>{language === 'id' ? 'Pilih game lain' : 'Change game'}</span>
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0EBE3] text-[#8E2435] text-[11px] font-bold">
              <span>{info.emoji}</span>
              <span>{info.badge[language]}</span>
            </div>
          </div>

          {/* Title & Tagline */}
          <div className="text-center space-y-2">
            <div className="text-xs font-semibold text-[#8E2435]">
              {language === 'id' ? 'Cara bermain' : 'How to play'}
            </div>
            <h1 className="font-serif italic text-3xl sm:text-4xl text-[#1a1a1a]">
              {info.title[language]}
            </h1>
            <p className="text-xs sm:text-sm text-[#2D2D2D]/70 max-w-md mx-auto leading-relaxed">
              {info.tagline[language]}
            </p>
          </div>

          {/* Partners Playing Indicator */}
          <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-2xl bg-[#F9F7F2] border border-[#2D2D2D]/8 max-w-sm mx-auto w-full">
            <Users className="w-3.5 h-3.5 text-[#8E2435]" />
            <span className="text-xs font-medium text-[#2D2D2D]">
              {language === 'id' ? 'Dimainkan berdua oleh:' : 'Played by:'}{' '}
              <strong className="text-[#8E2435] font-semibold">{p1}</strong> &{' '}
              <strong className="text-[#8E2435] font-semibold">{p2}</strong>
            </span>
          </div>

          {/* Steps List */}
          <div className="space-y-3 pt-1">
            {info.steps.map((step) => (
              <div
                key={step.number}
                className="flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-[#FAF8F5] border border-[#2D2D2D]/8 transition-colors hover:border-[#8E2435]/20"
              >
                <div className="w-6 h-6 rounded-full bg-[#8E2435] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-2xs">
                  {step.number}
                </div>
                <div className="space-y-0.5 text-left">
                  <div className="text-xs sm:text-sm font-bold text-[#2D2D2D]">
                    {step.title[language]}
                  </div>
                  <div className="text-xs text-[#2D2D2D]/70 leading-relaxed">
                    {step.desc(p1, p2, language)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Warm Tip Box */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-amber-900 flex items-start gap-3 text-left">
            <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <span className="font-semibold">{language === 'id' ? 'Tips santai: ' : 'Friendly tip: '}</span>
              <span>{info.tip[language]}</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              id="start-game-instructions-btn"
              onClick={handleStart}
              className="w-full py-4 px-6 rounded-2xl bg-[#8E2435] hover:bg-[#781E2C] text-white font-medium text-sm sm:text-base flex items-center justify-center shadow-sm active:scale-98 transition-all"
            >
              <span>{language === 'id' ? 'Mulai main sekarang' : 'Start playing now'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
