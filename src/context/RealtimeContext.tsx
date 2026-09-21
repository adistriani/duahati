import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { RoomStatePayload, OnlinePlayerStatus, GameModeId, MemoryKeepsake } from '../types';
import { sound } from '../utils/audio';
import { normalizeRoomCode } from '../utils/roomCode';

interface RealtimeContextType {
  socket: Socket | null;
  isConnected: boolean;
  isOnlineMode: boolean;
  roomId: string | null;
  myRole: 'player1' | 'player2' | null;
  myName: string;
  partnerName: string;
  partnerStatus: OnlinePlayerStatus;
  roomState: RoomStatePayload | null;
  isPartnerTyping: boolean;
  createRoom: (name: string) => Promise<{ success: boolean; roomId?: string; error?: string }>;
  joinRoom: (code: string, name: string) => Promise<{ success: boolean; error?: string }>;
  leaveRoom: () => void;
  sendTyping: (isTyping: boolean) => void;
  navigateGame: (mode: GameModeId) => void;
  sendGameAction: (type: string, payload: any) => void;
  onGameSync: (callback: (data: { gameKey: string; state: any; action: string; senderRole?: string; bothReady?: boolean; payload?: any }) => void) => () => void;
  shareRoomLink: () => string;
}

const RealtimeContext = createContext<RealtimeContextType | null>(null);

const STORAGE_KEY_ROOM = 'aboutus_active_room_session';

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [myRole, setMyRole] = useState<'player1' | 'player2' | null>(null);
  const [myName, setMyName] = useState<string>('');
  const [roomState, setRoomState] = useState<RoomStatePayload | null>(null);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);

  const syncCallbacksRef = useRef<Set<(data: any) => void>>(new Set());
  const typingTimeoutRef = useRef<any>(null);

  // Initialize socket connection
  useEffect(() => {
    // In browser, connect to current host:port
    const newSocket = io({
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      // Check if we had an active session to reconnect
      try {
        const saved = sessionStorage.getItem(STORAGE_KEY_ROOM);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.roomId && parsed.name) {
            newSocket.emit('room:join', { roomId: parsed.roomId, playerName: parsed.name }, (res: any) => {
              if (res.success) {
                setRoomId(res.roomId);
                setMyRole(res.role);
                setMyName(parsed.name);
                setRoomState(res.state);
              }
            });
          }
        }
      } catch {
        // ignore
      }
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('room:updated', (state: RoomStatePayload) => {
      setRoomState(state);
    });

    newSocket.on('player:joined', (data: { role: string; name: string }) => {
      sound.playSparkle();
    });

    newSocket.on('player:typing', ({ isTyping }: { role: string; isTyping: boolean }) => {
      setIsPartnerTyping(isTyping);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (isTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          setIsPartnerTyping(false);
        }, 3500);
      }
    });

    newSocket.on('game:sync', (data: any) => {
      syncCallbacksRef.current.forEach((cb) => cb(data));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Create room
  const createRoom = useCallback(async (name: string): Promise<{ success: boolean; roomId?: string; error?: string }> => {
    if (!socket) return { success: false, error: 'Socket not connected' };
    return new Promise((resolve) => {
      socket.emit('room:create', { playerName: name }, (res: any) => {
        if (res.success) {
          setRoomId(res.roomId);
          setMyRole('player1');
          setMyName(name);
          setRoomState(res.state);
          sessionStorage.setItem(STORAGE_KEY_ROOM, JSON.stringify({ roomId: res.roomId, name, role: 'player1' }));
          sound.playReveal();
          resolve({ success: true, roomId: res.roomId });
        } else {
          resolve({ success: false, error: res.error });
        }
      });
    });
  }, [socket]);

  // Join room
  const joinRoom = useCallback(async (code: string, name: string): Promise<{ success: boolean; error?: string }> => {
    if (!socket) return { success: false, error: 'Socket not connected' };
    const cleanCode = normalizeRoomCode(code);
    return new Promise((resolve) => {
      socket.emit('room:join', { roomId: cleanCode, playerName: name }, (res: any) => {
        if (res.success) {
          setRoomId(res.roomId);
          setMyRole(res.role);
          setMyName(name);
          setRoomState(res.state);
          sessionStorage.setItem(STORAGE_KEY_ROOM, JSON.stringify({ roomId: res.roomId, name, role: res.role }));
          sound.playReveal();
          resolve({ success: true });
        } else {
          resolve({ success: false, error: res.error });
        }
      });
    });
  }, [socket]);

  // Leave room
  const leaveRoom = useCallback(() => {
    setRoomId(null);
    setMyRole(null);
    setRoomState(null);
    sessionStorage.removeItem(STORAGE_KEY_ROOM);
    sound.playTap();
  }, []);

  // Typing emitter (debounced)
  const sendTyping = useCallback((isTyping: boolean) => {
    if (socket && roomId) {
      socket.emit('player:typing', { isTyping });
    }
  }, [socket, roomId]);

  // Navigate game mode for room
  const navigateGame = useCallback((mode: GameModeId) => {
    if (socket && roomId) {
      socket.emit('game:navigate', { mode });
    }
  }, [socket, roomId]);

  // Send game action
  const sendGameAction = useCallback((type: string, payload: any) => {
    if (socket && roomId) {
      socket.emit('game:action', { type, payload });
    }
  }, [socket, roomId]);

  // Subscribe to game actions
  const onGameSync = useCallback((callback: (data: any) => void) => {
    syncCallbacksRef.current.add(callback);
    return () => {
      syncCallbacksRef.current.delete(callback);
    };
  }, []);

  // Partner info helper
  const partnerStatus: OnlinePlayerStatus = {
    name: myRole === 'player1' ? (roomState?.player2?.name || 'Partner') : (roomState?.player1?.name || 'Partner'),
    connected: myRole === 'player1' ? (roomState?.player2?.connected || false) : (roomState?.player1?.connected || false),
    isTyping: isPartnerTyping,
    present: myRole === 'player1' ? (roomState?.player2?.present || false) : (roomState?.player1?.present || false),
  };

  const partnerName = partnerStatus.name;

  const shareRoomLink = useCallback(() => {
    if (!roomId) return window.location.href;
    try {
      const url = new URL(window.location.origin + window.location.pathname);
      url.searchParams.set('room', roomId);
      return url.toString();
    } catch {
      return `${window.location.origin}?room=${roomId}`;
    }
  }, [roomId]);

  return (
    <RealtimeContext.Provider
      value={{
        socket,
        isConnected,
        isOnlineMode: !!roomId,
        roomId,
        myRole,
        myName,
        partnerName,
        partnerStatus,
        roomState,
        isPartnerTyping,
        createRoom,
        joinRoom,
        leaveRoom,
        sendTyping,
        navigateGame,
        sendGameAction,
        onGameSync,
        shareRoomLink,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  const ctx = useContext(RealtimeContext);
  if (!ctx) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return ctx;
};
