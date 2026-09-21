import React, { useState } from 'react';
import { GameModeId, CoupleProfile } from '../types';
import { Volume2, VolumeX, Sparkles, Shuffle, Home, Users, Radio, Globe } from 'lucide-react';
import { sound } from '../utils/audio';
import { useRealtime } from '../context/RealtimeContext';
import { useLanguage } from '../context/LanguageContext';

interface HeaderNavProps {
  currentMode: GameModeId;
  onNavigate: (mode: GameModeId) => void;
  profile: CoupleProfile;
  onUpdateProfile: (updated: Partial<CoupleProfile>) => void;
  memoryCount?: number;
  onRandomSurprise: () => void;
  onOpenRoomModal: () => void;
}

const STAGE_LABELS: Record<string, { id: string; en: string }> = {
  curiosity: { id: '🌱 Baru kenal', en: '🌱 Curious & dating' },
  getting_closer: { id: '🌸 Makin dekat', en: '🌸 Getting closer' },
  knowing_each_other: { id: '✨ Memahami lebih dalam', en: '✨ Knowing deeply' },
  building_something: { id: '🧱 Membangun bersama', en: '🧱 Building together' },
  imagining_forever: { id: '🏡 Masa depan berdua', en: '🏡 Imagining forever' }
};

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentMode,
  onNavigate,
  profile,
  onUpdateProfile,
  memoryCount,
  onRandomSurprise,
  onOpenRoomModal
}) => {
  const [editingNames, setEditingNames] = useState(false);
  const [p1, setP1] = useState(profile.player1);
  const [p2, setP2] = useState(profile.player2);

  const { isOnlineMode, roomId, partnerName, partnerStatus, isPartnerTyping } = useRealtime();
  const { language, setLanguage, t } = useLanguage();

  if (currentMode === 'welcome') return null;

  const handleSaveNames = (e: React.FormEvent) => {
    e.preventDefault();
    if (p1.trim() && p2.trim()) {
      onUpdateProfile({ player1: p1.trim(), player2: p2.trim() });
    }
    setEditingNames(false);
  };

  const toggleSound = () => {
    const next = !profile.soundEnabled;
    sound.setEnabled(next);
    onUpdateProfile({ soundEnabled: next });
    if (next) sound.playTap();
  };

  const toggleLanguage = () => {
    sound.playTap();
    const nextLang = language === 'id' ? 'en' : 'id';
    setLanguage(nextLang);
  };

  const stageObj = STAGE_LABELS[profile.stage] || { id: '✨ Memahami Lebih Dalam', en: '✨ Knowing Deeply' };
  const stageDisplay = stageObj[language];

  return (
    <header className="sticky top-0 z-40 bg-[#F9F7F2]/90 backdrop-blur-md border-b border-[#2D2D2D]/10 px-3 sm:px-6 md:px-10 py-3 transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Brand & Couple Names */}
        <div className="flex items-center gap-3">
          <button
            id="nav-brand-btn"
            onClick={() => {
              sound.playTap();
              onNavigate('lobby');
            }}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#2D2D2D]/30 bg-white flex items-center justify-center font-serif italic text-base sm:text-lg text-[#2D2D2D] shadow-2xs group-hover:border-[#8E2435] group-hover:text-[#8E2435] transition-colors">
              &
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-[#8E2435] leading-tight">
                Dua Hati
              </span>
              <span className="font-serif italic text-xs sm:text-sm text-[#2D2D2D] group-hover:text-[#8E2435] transition-colors line-clamp-1">
                {profile.player1} & {profile.player2}
              </span>
            </div>
          </button>
        </div>

        {/* Center: Online / Offline Mode Switcher & Typing Indicator */}
        <div className="flex items-center gap-2">
          {isPartnerTyping && (
            <div className="animate-pulse inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8E2435]/10 border border-[#8E2435]/20 text-[10px] sm:text-xs font-serif italic text-[#8E2435]">
              <span>{partnerName} {t('isTyping')}</span>
            </div>
          )}

          {/* Mode Switcher Pill */}
          <div className="flex items-center bg-white/80 border border-[#2D2D2D]/15 rounded-full p-0.5 shadow-2xs">
            <button
              onClick={() => {
                if (isOnlineMode) {
                  sound.playTap();
                  onOpenRoomModal();
                } else {
                  sound.playTap();
                }
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                !isOnlineMode
                  ? 'bg-[#2D2D2D] text-white shadow-2xs'
                  : 'text-[#2D2D2D]/60 hover:text-[#2D2D2D]'
              }`}
              title={language === 'id' ? 'Mode offline (1 layar)' : 'Offline mode (1 screen)'}
            >
              <span>🗣️</span>
              <span className="hidden sm:inline">{language === 'id' ? 'Mode offline' : 'Offline'}</span>
              <span className="sm:hidden">{language === 'id' ? 'Offline' : 'Offline'}</span>
            </button>

            <button
              onClick={() => {
                sound.playTap();
                onOpenRoomModal();
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                isOnlineMode
                  ? 'bg-[#8E2435] text-white shadow-2xs'
                  : 'text-[#2D2D2D]/60 hover:text-[#8E2435]'
              }`}
              title={language === 'id' ? 'Mode online (2 HP)' : 'Online mode (2 phones)'}
            >
              {isOnlineMode ? (
                <>
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      partnerStatus.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  <span className="font-mono text-[10px]">{roomId}</span>
                  <span className="hidden md:inline text-[9px] opacity-80">
                    ({partnerStatus.connected ? (language === 'id' ? 'Online' : 'Connected') : (language === 'id' ? 'Menunggu' : 'Waiting')})
                  </span>
                </>
              ) : (
                <>
                  <Radio className="w-3 h-3 text-[#8E2435]" />
                  <span className="hidden sm:inline">{language === 'id' ? 'Online (2 HP)' : 'Online (2 phones)'}</span>
                  <span className="sm:hidden">Online</span>
                </>
              )}
            </button>
          </div>

          {editingNames ? (
            <form onSubmit={handleSaveNames} className="hidden md:flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-[#8E2435]/40 shadow-xs">
              <input
                type="text"
                value={p1}
                onChange={(e) => setP1(e.target.value)}
                className="w-16 sm:w-20 text-xs px-1 py-0.5 border-b border-[#8E2435]/50 focus:outline-hidden text-center text-[#8E2435] font-medium"
                placeholder="P1"
              />
              <span className="text-xs text-[#8E2435]">&</span>
              <input
                type="text"
                value={p2}
                onChange={(e) => setP2(e.target.value)}
                className="w-16 sm:w-20 text-xs px-1 py-0.5 border-b border-[#8E2435]/50 focus:outline-hidden text-center text-[#8E2435] font-medium"
                placeholder="P2"
              />
              <button
                type="submit"
                className="text-[10px] bg-[#2D2D2D] text-white px-2.5 py-0.5 rounded-full hover:bg-black transition-colors font-semibold"
              >
                {t('save')}
              </button>
            </form>
          ) : (
            <button
              id="couple-name-badge"
              onClick={() => {
                setP1(profile.player1);
                setP2(profile.player2);
                setEditingNames(true);
              }}
              title={language === 'id' ? 'Klik untuk ubah nama pasangan' : 'Click to edit partner names'}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#2D2D2D]/20 bg-white/60 text-[11px] font-medium text-[#2D2D2D] hover:border-[#8E2435] hover:text-[#8E2435] transition-all shadow-2xs"
            >
              <Users className="w-3.5 h-3.5 text-[#8E2435]" />
              <span>{profile.player1} & {profile.player2}</span>
            </button>
          )}
        </div>

        {/* Right Navigation, Language Switcher & Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 text-xs font-medium tracking-wide">
          {/* Language Switcher Pill */}
          <button
            id="lang-toggle-btn"
            onClick={toggleLanguage}
            title={language === 'id' ? 'Ganti ke Bahasa Inggris' : 'Switch to Indonesian'}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-[#2D2D2D]/20 bg-white hover:border-[#8E2435] transition-all text-[11px] font-bold shadow-2xs text-[#2D2D2D]"
          >
            <Globe className="w-3 h-3 text-[#8E2435]" />
            <span className={language === 'id' ? 'text-[#8E2435] font-black' : 'text-[#2D2D2D]/50'}>ID</span>
            <span className="text-[#2D2D2D]/30">|</span>
            <span className={language === 'en' ? 'text-[#8E2435] font-black' : 'text-[#2D2D2D]/50'}>EN</span>
          </button>

          {currentMode !== 'lobby' && (
            <button
              id="nav-lobby-btn"
              onClick={() => {
                sound.playTap();
                onNavigate('lobby');
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#2D2D2D]/10 bg-white/50 text-[#2D2D2D] hover:text-[#8E2435] hover:border-[#8E2435]/30 transition-all text-xs font-semibold"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t('lobby')}</span>
            </button>
          )}

          <button
            id="nav-surprise-btn"
            onClick={onRandomSurprise}
            title={language === 'id' ? 'Pilihkan game secara acak' : 'Surprise us with a random game'}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[#8E2435] hover:bg-[#8E2435]/5 transition-colors font-semibold text-xs"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{t('surprise')}</span>
          </button>

          {/* Sound Toggle */}
          <button
            id="nav-sound-btn"
            onClick={toggleSound}
            title={profile.soundEnabled ? t('soundOff') : t('soundOn')}
            className="p-1.5 rounded-full border border-[#2D2D2D]/15 bg-white/50 text-[#2D2D2D]/70 hover:text-[#8E2435] hover:border-[#8E2435] transition-colors"
          >
            {profile.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 opacity-40" />}
          </button>
        </div>
      </div>
    </header>
  );
};

