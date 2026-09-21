import React from 'react';
import { motion } from 'motion/react';
import { GameModeId, CoupleProfile } from '../types';
import { sound } from '../utils/audio';
import { useRealtime } from '../context/RealtimeContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Sparkles, 
  Shuffle, 
  Heart, 
  MessageSquare, 
  Flame, 
  Zap, 
  Moon, 
  Smile, 
  ArrowRight,
  Clock,
  Radio
} from 'lucide-react';

interface GameLobbyProps {
  onSelectGame: (mode: GameModeId) => void;
  profile: CoupleProfile;
  onRandomSurprise: () => void;
  dailyQuestionPreview: string;
  onOpenRoomModal: () => void;
}

interface GameCardMeta {
  id: GameModeId;
  title: { id: string; en: string };
  icon: string;
  tagline: { id: string; en: string };
  badge?: { id: string; en: string };
}

export const GameLobby: React.FC<GameLobbyProps> = ({
  onSelectGame,
  profile,
  onRandomSurprise,
  dailyQuestionPreview,
  onOpenRoomModal
}) => {
  const { isOnlineMode, roomId, partnerName, partnerStatus } = useRealtime();
  const { language, t } = useLanguage();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (language === 'id') {
      if (hour < 11) return 'Selamat pagi';
      if (hour < 15) return 'Selamat siang';
      if (hour < 19) return 'Selamat sore';
      return 'Selamat malam';
    }
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const GAME_CARDS: GameCardMeta[] = [
    {
      id: 'daily-drop',
      title: { id: 'Obrolan harian', en: 'Daily drop' },
      icon: '✨',
      tagline: { id: 'Satu obrolan hangat hari ini', en: 'A quiet daily connection' },
      badge: { id: 'Harian', en: 'Daily' }
    },
    {
      id: 'deep-talk',
      title: { id: 'Deep talk', en: 'Deep talk' },
      icon: '💭',
      tagline: { id: 'Obrolan jujur & mendalam', en: 'Honest & deep conversations' },
      badge: { id: 'Intim', en: 'Intimate' }
    },
    {
      id: 'this-or-that',
      title: { id: 'This or that', en: 'This or that' },
      icon: '⚡',
      tagline: { id: 'Pilih cepat 1..2..3', en: 'Fast synchronized picks' },
      badge: { id: 'Cepat & seru', en: 'Rapid' }
    },
    {
      id: 'wishes',
      title: { id: 'Harapan & impian', en: 'Wishes & hopes' },
      icon: '🌙',
      tagline: { id: 'Masa depan & impian berdua', en: 'Dreaming of our future' },
      badge: { id: 'Impian', en: 'Visionary' }
    },
    {
      id: 'get-to-know',
      title: { id: 'Kenali diriku', en: 'Get to know me' },
      icon: '🫶',
      tagline: { id: 'Nuansa & bahasa cinta', en: 'Little nuances & habits' },
      badge: { id: 'Karakter', en: 'Identity' }
    },
    {
      id: 'chaos',
      title: { id: 'Chaos mode', en: 'Chaos mode' },
      icon: '😂',
      tagline: { id: 'Debat lucu tanpa filter', en: 'Zero serious debate' },
      badge: { id: 'Kocak', en: 'Wild' }
    },
    {
      id: 'love-us',
      title: { id: 'Cinta & kita', en: 'Love & us' },
      icon: '❤️',
      tagline: { id: 'Alasan kita saling cinta', en: 'The way we connect' },
      badge: { id: 'Romantis', en: 'Romance' }
    },
    {
      id: 'how-well',
      title: { id: 'Seberapa paham?', en: 'How well do you know me?' },
      icon: '🔥',
      tagline: { id: 'Tebak rahasia pasanganmu', en: 'Guess your partner’s choice' },
      badge: { id: 'Tebakan', en: 'Prediction' }
    },
    {
      id: 'tell-me',
      title: { id: 'Katakan sesuatu', en: 'Tell me something' },
      icon: '💌',
      tagline: { id: 'Kejujuran manis tanpa ragu', en: 'Easier to write than say' },
      badge: { id: 'Surat hati', en: 'Letter deck' }
    }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12 space-y-12 z-10 relative">
      {/* Home Greeting Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-3"
      >
        <div className="text-center space-y-1">
          <h2 className="text-xs font-semibold tracking-wide text-[#8E2435]">
            {language === 'id' ? 'Dua Hati' : 'Dua Hati'}
          </h2>
          <p className="font-serif text-3xl sm:text-4xl italic text-[#8E2435]">
            {getGreeting()},{' '}
            <span className="text-[#2D2D2D] not-italic font-normal">
              {profile.player1} & {profile.player2}
            </span>
          </p>
        </div>

        {/* Mode Selector Pill / Banner */}
        <div className="inline-flex items-center p-1 bg-white border border-[#2D2D2D]/15 rounded-2xl shadow-2xs">
          <button
            onClick={() => {
              if (isOnlineMode) {
                sound.playTap();
                onOpenRoomModal();
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              !isOnlineMode
                ? 'bg-[#2D2D2D] text-white shadow-2xs'
                : 'text-[#2D2D2D]/70 hover:text-[#2D2D2D] hover:bg-black/5'
            }`}
          >
            <span>🗣️</span>
            <span>{language === 'id' ? 'Mode offline (1 layar)' : 'Offline mode (1 screen)'}</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              onOpenRoomModal();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              isOnlineMode
                ? 'bg-[#8E2435] text-white shadow-2xs'
                : 'text-[#2D2D2D]/70 hover:text-[#8E2435] hover:bg-[#8E2435]/5'
            }`}
          >
            <span>📱</span>
            <span>{language === 'id' ? 'Mode online (2 HP)' : 'Online mode (2 phones)'}</span>
            {isOnlineMode && (
              <span className="ml-1 px-2 py-0.2 rounded-full bg-white/20 text-[10px] font-mono">
                {roomId}
              </span>
            )}
          </button>
        </div>
      </motion.div>

      {/* Main Game Grid Section (Including Date Night, LDR, and all decks) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs sm:text-sm font-semibold opacity-70 text-[#2D2D2D]">
              {language === 'id' ? 'Pilih deck permainan' : 'Choose a game deck'}
            </h3>
            <p className="text-[11px] text-[#6E6664] font-serif italic">
              {language === 'id' ? 'Semua deck interaktif & panduan kencan berdua' : 'Interactive card decks & date guides'}
            </p>
          </div>
          <button
            id="lobby-surprise-us-btn"
            onClick={onRandomSurprise}
            className="text-xs font-medium underline underline-offset-4 text-[#8E2435]/80 hover:text-[#8E2435] transition-colors"
          >
            {language === 'id' ? 'Acak untuk kami' : 'Surprise us'}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {GAME_CARDS.map((card, idx) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.02 }}
              whileHover={{ y: -3 }}
              onClick={() => {
                sound.playTap();
                onSelectGame(card.id);
              }}
              className="bg-white/70 hover:bg-white border border-[#2D2D2D]/8 hover:border-[#8E2435]/30 p-5 rounded-2xl flex flex-col items-center text-center group cursor-pointer hover:shadow-md transition-all relative"
            >
              {card.badge && (
                <span className="absolute top-3 right-3 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[#2D2D2D]/5 text-[#6E6664] group-hover:text-[#8E2435] group-hover:bg-[#8E2435]/10 transition-colors">
                  {card.badge[language]}
                </span>
              )}
              <div className="w-12 h-12 bg-[#F0EBE3] rounded-full mb-3 flex items-center justify-center text-xl shadow-2xs group-hover:scale-105 transition-transform">
                {card.icon}
              </div>
              <span className="text-xs sm:text-sm font-semibold mb-1 text-[#2D2D2D] group-hover:text-[#8E2435] transition-colors">
                {card.title[language]}
              </span>
              <span className="text-[11px] opacity-60 font-serif italic line-clamp-1 text-[#2D2D2D]">
                {card.tagline[language]}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
