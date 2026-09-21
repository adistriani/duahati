import React, { useState, useEffect } from 'react';
import { GameModeId, CoupleProfile, QuestionItem } from './types';
import { HeaderNav } from './components/HeaderNav';
import { WelcomeScreen } from './components/WelcomeScreen';
import { GameLobby } from './components/GameLobby';
import { RoomModal } from './components/RoomModal';
import { DeepTalkGame } from './components/games/DeepTalkGame';
import { ThisOrThatGame } from './components/games/ThisOrThatGame';
import { WishesAndHopesGame } from './components/games/WishesAndHopesGame';
import { GetToKnowMeGame } from './components/games/GetToKnowMeGame';
import { HowWellDoYouKnowMeGame } from './components/games/HowWellDoYouKnowMeGame';
import { LoveAndUsGame } from './components/games/LoveAndUsGame';
import { ChaosModeGame } from './components/games/ChaosModeGame';
import { TellMeSomethingGame } from './components/games/TellMeSomethingGame';
import { DailyDropGame } from './components/games/DailyDropGame';
import { QuestionLibraryView } from './components/games/QuestionLibraryView';
import { DAILY_QUESTIONS, getDailyQuestions } from './data/questions';
import { sound } from './utils/audio';
import { useRealtime } from './context/RealtimeContext';
import { useLanguage } from './context/LanguageContext';
import { incrementExploredCount, loadExploredCount } from './utils/streak';
import { normalizeRoomCode } from './utils/roomCode';

const STORAGE_KEYS = {
  PROFILE: 'aboutus_couple_profile'
};

const DEFAULT_PROFILE: CoupleProfile = {
  player1: 'Alex',
  player2: 'Sam',
  stage: 'knowing_each_other',
  meetingDate: '',
  passAndPlay: true,
  soundEnabled: true
};

export default function App() {
  const [currentMode, setCurrentMode] = useState<GameModeId>('welcome');
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [roomModalInitialCode, setRoomModalInitialCode] = useState('');

  const { isOnlineMode, roomState, navigateGame, socket } = useRealtime();
  const { language } = useLanguage();

  const [questionsExplored, setQuestionsExplored] = useState<number>(() => loadExploredCount());

  // Dynamic daily question on page reload/mount
  const [dailyQuestionPreview, setDailyQuestionPreview] = useState<string>(() => {
    const dailyPool = getDailyQuestions('id');
    const randomIdx = Math.floor(Math.random() * dailyPool.length);
    return dailyPool[randomIdx] || DAILY_QUESTIONS[0];
  });

  const [profile, setProfile] = useState<CoupleProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  const handleIncrementExplored = () => {
    const nextCount = incrementExploredCount();
    setQuestionsExplored(nextCount);
  };

  // Auto-detect room code from URL (e.g. ?room=US-XXXX or #room=US-XXXX)
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      let roomCode = searchParams.get('room') || searchParams.get('code') || '';

      if (!roomCode && window.location.hash) {
        const hashStr = window.location.hash.replace(/^#/, '');
        const hashParams = new URLSearchParams(hashStr);
        roomCode = hashParams.get('room') || hashParams.get('code') || '';
        if (!roomCode && hashStr.toUpperCase().startsWith('US-')) {
          roomCode = hashStr.toUpperCase();
        }
      }

      if (roomCode) {
        const cleanCode = normalizeRoomCode(roomCode);
        setRoomModalInitialCode(cleanCode);
        setIsRoomModalOpen(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // Synchronize player names when connected to an online room
  useEffect(() => {
    if (isOnlineMode && roomState) {
      const p1Name = roomState.player1?.name;
      const p2Name = roomState.player2?.name;
      if (p1Name && p2Name) {
        setProfile((prev) => {
          if (prev.player1 === p1Name && prev.player2 === p2Name) return prev;
          return { ...prev, player1: p1Name, player2: p2Name };
        });
      }
    }
  }, [isOnlineMode, roomState]);

  // Synchronize game navigation across online players
  useEffect(() => {
    if (!socket) return;
    const handleNav = (data: { mode: GameModeId }) => {
      if (data.mode) {
        setCurrentMode(data.mode);
        sound.playTap();
      }
    };
    socket.on('game:navigated', handleNav);
    return () => {
      socket.off('game:navigated', handleNav);
    };
  }, [socket]);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch {
      // ignore
    }
  }, [profile]);

  const handleNavigateMode = (mode: GameModeId) => {
    setCurrentMode(mode);
    if (isOnlineMode) {
      navigateGame(mode);
    }
  };

  const handleUpdateProfile = (updated: Partial<CoupleProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
  };

  const handleStartFromWelcome = (p1: string, p2: string) => {
    setProfile((prev) => ({ ...prev, player1: p1, player2: p2 }));
    handleNavigateMode('lobby');
  };

  const handleRandomSurprise = () => {
    sound.playSparkle();
    const playableModes: GameModeId[] = [
      'deep-talk',
      'this-or-that',
      'wishes',
      'get-to-know',
      'how-well',
      'love-us',
      'chaos',
      'tell-me',
      'daily-drop'
    ];
    const pick = playableModes[Math.floor(Math.random() * playableModes.length)];
    handleNavigateMode(pick);
  };

  const handlePlayDirectCard = (q: QuestionItem) => {
    sound.playReveal();
    // Navigate directly into Deep Talk or corresponding category
    if (q.category === 'Chaos') {
      handleNavigateMode('chaos');
    } else if (q.category === 'Love') {
      handleNavigateMode('love-us');
    } else {
      handleNavigateMode('deep-talk');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F7F2] text-[#2D2D2D] selection:bg-[#8E2435]/15 selection:text-[#8E2435] relative">
      {/* Sleek Dot Grid Overlay */}
      <div className="fixed inset-0 opacity-15 pointer-events-none bg-sleek-dots z-0" />

      {/* Global Header Navigation */}
      <HeaderNav
        currentMode={currentMode}
        onNavigate={handleNavigateMode}
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
        onRandomSurprise={handleRandomSurprise}
        onOpenRoomModal={() => {
          setRoomModalInitialCode('');
          setIsRoomModalOpen(true);
        }}
      />

      {/* Main Screen Views */}
      <main className="flex-1 w-full relative z-10">
        {currentMode === 'welcome' && (
          <WelcomeScreen
            profile={profile}
            onStart={handleStartFromWelcome}
            onOpenRoomModal={(code?: string) => {
              setRoomModalInitialCode(code || '');
              setIsRoomModalOpen(true);
            }}
          />
        )}

        {currentMode === 'lobby' && (
          <GameLobby
            profile={profile}
            onSelectGame={handleNavigateMode}
            onRandomSurprise={handleRandomSurprise}
            dailyQuestionPreview={dailyQuestionPreview}
            onOpenRoomModal={() => {
              setRoomModalInitialCode('');
              setIsRoomModalOpen(true);
            }}
          />
        )}

        {currentMode === 'deep-talk' && (
          <DeepTalkGame
            profile={profile}
            onBackToLobby={() => handleNavigateMode('lobby')}
            questionsExplored={questionsExplored}
            onIncrementExplored={handleIncrementExplored}
          />
        )}

        {currentMode === 'this-or-that' && (
          <ThisOrThatGame
            profile={profile}
            onBackToLobby={() => handleNavigateMode('lobby')}
            questionsExplored={questionsExplored}
            onIncrementExplored={handleIncrementExplored}
          />
        )}

        {currentMode === 'wishes' && (
          <WishesAndHopesGame
            profile={profile}
            onBackToLobby={() => handleNavigateMode('lobby')}
            questionsExplored={questionsExplored}
            onIncrementExplored={handleIncrementExplored}
          />
        )}

        {currentMode === 'get-to-know' && (
          <GetToKnowMeGame
            profile={profile}
            onBackToLobby={() => handleNavigateMode('lobby')}
            questionsExplored={questionsExplored}
            onIncrementExplored={handleIncrementExplored}
          />
        )}

        {currentMode === 'how-well' && (
          <HowWellDoYouKnowMeGame
            profile={profile}
            onBackToLobby={() => handleNavigateMode('lobby')}
            questionsExplored={questionsExplored}
            onIncrementExplored={handleIncrementExplored}
          />
        )}

        {currentMode === 'love-us' && (
          <LoveAndUsGame
            profile={profile}
            onBackToLobby={() => handleNavigateMode('lobby')}
            questionsExplored={questionsExplored}
            onIncrementExplored={handleIncrementExplored}
          />
        )}

        {currentMode === 'chaos' && (
          <ChaosModeGame
            profile={profile}
            onBackToLobby={() => handleNavigateMode('lobby')}
            questionsExplored={questionsExplored}
            onIncrementExplored={handleIncrementExplored}
          />
        )}

        {currentMode === 'tell-me' && (
          <TellMeSomethingGame
            profile={profile}
            onBackToLobby={() => handleNavigateMode('lobby')}
            questionsExplored={questionsExplored}
            onIncrementExplored={handleIncrementExplored}
          />
        )}

        {currentMode === 'daily-drop' && (
          <DailyDropGame
            profile={profile}
            onBackToLobby={() => handleNavigateMode('lobby')}
            questionsExplored={questionsExplored}
            onIncrementExplored={handleIncrementExplored}
          />
        )}

        {currentMode === 'library' && (
          <QuestionLibraryView
            onPlayQuestion={handlePlayDirectCard}
            onBackToLobby={() => handleNavigateMode('lobby')}
          />
        )}
      </main>

      {/* Real-time 2-Player Room Connection Modal */}
      <RoomModal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        initialCode={roomModalInitialCode}
        defaultName={profile.player1}
        onSuccess={() => {
          if (currentMode === 'welcome') {
            setCurrentMode('lobby');
          }
        }}
      />

      {/* Footer */}
      {currentMode !== 'welcome' && (
        <footer className="w-full py-4 text-center border-t border-[#2D2D2D]/8 bg-[#F4F1EA]/80 backdrop-blur-xs z-20">
          <p className="text-xs text-[#2D2D2D]/70 font-medium tracking-wide">
            Made by Gusti Adistriani | 2026
          </p>
        </footer>
      )}
    </div>
  );
}

