import express from "express";
import http from "http";
import path from "path";
import { Server as SocketIOServer, Socket } from "socket.io";
import { createServer as createViteServer } from "vite";

interface RoomPlayer {
  socketId: string;
  role: "player1" | "player2";
  name: string;
  connected: boolean;
  isTyping: boolean;
  lastActive: number;
}

interface RoomState {
  roomId: string;
  createdAt: number;
  gameMode: string;
  player1Name: string;
  player2Name: string;
  players: { [socketId: string]: RoomPlayer };
  gameData: Record<string, any>;
  memories: any[];
}

const rooms: Map<string, RoomState> = new Map();

// Helper to generate clean, memorable 6-character room codes (e.g. US-4921 or 6-digit)
function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const digits = Math.floor(10 + Math.random() * 90);
  return `US-${code}${digits}`;
}

// Normalize codes to prevent mismatch from mobile keyboards (en-dash, em-dash, spaces, or missing US- prefix)
function normalizeCode(raw: string): string {
  if (!raw) return "";
  let str = raw.trim();
  str = str.replace(/^(kode|room)\s*(ruang|code)?\s*[:=-]?\s*/i, "");
  str = str.replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212\u002D]/g, "-");
  str = str.replace(/\s+/g, "").toUpperCase();
  if (str.startsWith("US") && !str.startsWith("US-")) {
    str = "US-" + str.slice(2);
  }
  if (!str.startsWith("US-") && str.length >= 4) {
    str = "US-" + str;
  }
  return str;
}

function findRoom(rawCode: string): RoomState | undefined {
  if (!rawCode) return undefined;
  const normalized = normalizeCode(rawCode);
  if (rooms.has(normalized)) return rooms.get(normalized);

  const rawUpper = rawCode.trim().toUpperCase();
  if (rooms.has(rawUpper)) return rooms.get(rawUpper);

  // Fallback: match by alphanumeric characters only (ignoring all punctuation, spaces, and prefixes)
  const alphaRaw = rawCode.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  for (const [key, room] of rooms.entries()) {
    const alphaKey = key.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    if (alphaKey === alphaRaw || alphaKey.endsWith(alphaRaw) || (alphaRaw.length >= 4 && alphaKey.includes(alphaRaw))) {
      return room;
    }
  }
  return undefined;
}

function getSanitizedRoomState(room: RoomState) {
  const pList = Object.values(room.players);
  const p1 = pList.find((p) => p.role === "player1");
  const p2 = pList.find((p) => p.role === "player2");

  return {
    roomId: room.roomId,
    gameMode: room.gameMode,
    player1: {
      name: p1 ? p1.name : room.player1Name,
      connected: p1 ? p1.connected : false,
      isTyping: p1 ? p1.isTyping : false,
      present: !!p1,
    },
    player2: {
      name: p2 ? p2.name : room.player2Name,
      connected: p2 ? p2.connected : false,
      isTyping: p2 ? p2.isTyping : false,
      present: !!p2,
    },
    gameData: room.gameData,
    memories: room.memories,
    updatedAt: Date.now(),
  };
}

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = 3000;

  app.use(express.json());

  // API endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", activeRooms: rooms.size });
  });

  app.get("/api/room/:code", (req, res) => {
    const room = findRoom(req.params.code);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    return res.json(getSanitizedRoomState(room));
  });

  // Socket.io initialization
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    pingInterval: 10000,
    pingTimeout: 5000,
  });

  io.on("connection", (socket: Socket) => {
    let currentRoomId: string | null = null;
    let currentRole: "player1" | "player2" | null = null;

    // 1. Create Room
    socket.on("room:create", ({ playerName }: { playerName: string }, callback) => {
      try {
        let code = generateRoomCode();
        while (rooms.has(code)) {
          code = generateRoomCode();
        }

        const newRoom: RoomState = {
          roomId: code,
          createdAt: Date.now(),
          gameMode: "lobby",
          player1Name: playerName || "Maya",
          player2Name: "Partner",
          players: {
            [socket.id]: {
              socketId: socket.id,
              role: "player1",
              name: playerName || "Maya",
              connected: true,
              isTyping: false,
              lastActive: Date.now(),
            },
          },
          gameData: {},
          memories: [],
        };

        rooms.set(code, newRoom);
        currentRoomId = code;
        currentRole = "player1";
        socket.join(code);

        const state = getSanitizedRoomState(newRoom);
        callback({ success: true, roomId: code, role: "player1", state });
      } catch (err: any) {
        callback({ success: false, error: err.message || "Failed to create room" });
      }
    });

    // 2. Join Room
    socket.on("room:join", ({ roomId, playerName }: { roomId: string; playerName: string }, callback) => {
      try {
        const room = findRoom(roomId);

        if (!room) {
          return callback({
            success: false,
            error: "Kode ruang tidak ditemukan. Pastikan kodenya sudah sesuai atau buat ruang baru ya."
          });
        }

        const code = room.roomId;
        const existingPlayers = Object.values(room.players);
        const p1 = existingPlayers.find((p) => p.role === "player1");
        const p2 = existingPlayers.find((p) => p.role === "player2");

        let assignedRole: "player1" | "player2" = "player2";

        if (!p1 || !p1.connected) {
          // If player1 slot is open or disconnected, assign or claim
          if (p1 && p1.name === playerName) {
            delete room.players[p1.socketId];
            assignedRole = "player1";
          } else if (!p1) {
            assignedRole = "player1";
          } else if (!p2) {
            assignedRole = "player2";
          }
        } else if (!p2 || !p2.connected) {
          if (p2) {
            delete room.players[p2.socketId];
          }
          assignedRole = "player2";
        } else {
          // Both active, check if reconnecting by name
          if (p1.name === playerName) {
            delete room.players[p1.socketId];
            assignedRole = "player1";
          } else if (p2.name === playerName) {
            delete room.players[p2.socketId];
            assignedRole = "player2";
          } else {
            // Already 2 connected players with different names
            return callback({
              success: false,
              error: "This room already has 2 active players.",
            });
          }
        }

        room.players[socket.id] = {
          socketId: socket.id,
          role: assignedRole,
          name: playerName || (assignedRole === "player1" ? "Player 1" : "Player 2"),
          connected: true,
          isTyping: false,
          lastActive: Date.now(),
        };

        if (assignedRole === "player1") {
          room.player1Name = playerName;
        } else {
          room.player2Name = playerName;
        }

        currentRoomId = code;
        currentRole = assignedRole;
        socket.join(code);

        const state = getSanitizedRoomState(room);
        callback({ success: true, roomId: code, role: assignedRole, state });

        // Broadcast to all players in the room
        io.to(code).emit("room:updated", state);
        socket.to(code).emit("player:joined", {
          role: assignedRole,
          name: playerName,
        });
      } catch (err: any) {
        callback({ success: false, error: err.message || "Failed to join room" });
      }
    });

    // 3. Typing Indicator
    socket.on("player:typing", ({ isTyping }: { isTyping: boolean }) => {
      if (!currentRoomId || !currentRole) return;
      const room = rooms.get(currentRoomId);
      if (!room || !room.players[socket.id]) return;

      room.players[socket.id].isTyping = isTyping;
      socket.to(currentRoomId).emit("player:typing", {
        role: currentRole,
        isTyping,
      });
    });

    // 4. Game Navigation
    socket.on("game:navigate", ({ mode }: { mode: string }) => {
      if (!currentRoomId) return;
      const room = rooms.get(currentRoomId);
      if (!room) return;

      room.gameMode = mode;
      // Reset temporary game turn data when switching modes if needed
      io.to(currentRoomId).emit("game:navigated", { mode });
    });

    // 5. Realtime Game Action (Choices, Answers, Reveal, Sync)
    socket.on("game:action", ({ type, payload }: { type: string; payload: any }) => {
      if (!currentRoomId || !currentRole) return;
      const room = rooms.get(currentRoomId);
      if (!room) return;

      // Update in-memory state based on action type
      if (!room.gameData[payload?.gameKey || room.gameMode]) {
        room.gameData[payload?.gameKey || room.gameMode] = {};
      }

      const activeGameKey = payload?.gameKey || room.gameMode;
      const activeState = room.gameData[activeGameKey];

      switch (type) {
        case "THIS_OR_THAT_SELECT":
        case "GET_TO_KNOW_SELECT": {
          // payload: { choice: 'A' | 'B', index: number }
          if (currentRole === "player1") {
            activeState.p1Choice = payload.choice;
          } else {
            activeState.p2Choice = payload.choice;
          }
          if (payload.index !== undefined) activeState.index = payload.index;

          // Check if both locked in
          const bothSelected = !!activeState.p1Choice && !!activeState.p2Choice;
          if (bothSelected) activeState.revealed = true;

          io.to(currentRoomId).emit("game:sync", {
            gameKey: activeGameKey,
            state: activeState,
            action: "CHOICE_UPDATED",
            senderRole: currentRole,
            bothReady: bothSelected,
          });
          break;
        }

        case "THIS_OR_THAT_START_COUNTDOWN": {
          activeState.countdown = payload.countdown ?? 3;
          io.to(currentRoomId).emit("game:sync", {
            gameKey: activeGameKey,
            state: activeState,
            action: "COUNTDOWN_TRIGGERED",
          });
          break;
        }

        case "THIS_OR_THAT_NEXT":
        case "GET_TO_KNOW_NEXT": {
          activeState.index = payload.nextIndex;
          activeState.p1Choice = null;
          activeState.p2Choice = null;
          activeState.countdown = null;
          activeState.revealed = false;
          io.to(currentRoomId).emit("game:sync", {
            gameKey: activeGameKey,
            state: activeState,
            action: "NEXT_QUESTION",
          });
          break;
        }

        case "ANSWER_SUBMIT":
        case "ANSWER_UPDATED": {
          // For Deep Talk, Daily Drop, Love & Us, Wishes, Custom Ask
          // Supports ans1/ans2, or answer string
          if (payload.ans1 !== undefined) {
            activeState.p1Answer = payload.ans1;
            activeState.p1Locked = true;
          }
          if (payload.ans2 !== undefined) {
            activeState.p2Answer = payload.ans2;
            activeState.p2Locked = true;
          }
          if (payload.answer !== undefined) {
            if (currentRole === "player1") {
              activeState.p1Answer = payload.answer;
              activeState.p1Locked = true;
            } else {
              activeState.p2Answer = payload.answer;
              activeState.p2Locked = true;
            }
          }
          if (payload.index !== undefined) activeState.index = payload.index;

          const bothLocked = (!!activeState.p1Locked && !!activeState.p2Locked) || !!payload.bothReady;
          if (bothLocked || payload.revealed) {
            activeState.revealed = true;
          }

          io.to(currentRoomId).emit("game:sync", {
            gameKey: activeGameKey,
            state: activeState,
            action: "ANSWER_LOCKED",
            senderRole: currentRole,
            bothReady: bothLocked,
          });
          break;
        }

        case "REVEAL_ANSWERS": {
          activeState.revealed = true;
          io.to(currentRoomId).emit("game:sync", {
            gameKey: activeGameKey,
            state: activeState,
            action: "ANSWERS_REVEALED",
          });
          break;
        }

        case "NEXT_ROUND":
        case "DAILY_NEXT":
        case "LOVE_NEXT":
        case "WISHES_NEXT": {
          activeState.index = payload.nextIndex ?? (activeState.index || 0) + 1;
          activeState.p1Answer = "";
          activeState.p2Answer = "";
          activeState.ans1 = "";
          activeState.ans2 = "";
          activeState.p1Locked = false;
          activeState.p2Locked = false;
          activeState.revealed = false;
          activeState.reaction = null;
          io.to(currentRoomId).emit("game:sync", {
            gameKey: activeGameKey,
            state: activeState,
            action: "ROUND_RESET",
          });
          break;
        }

        case "REACTION_SET": {
          activeState.reaction = payload.reaction;
          io.to(currentRoomId).emit("game:sync", {
            gameKey: activeGameKey,
            state: activeState,
            action: "REACTION_UPDATED",
            reaction: payload.reaction,
          });
          break;
        }

        case "VOTE_CAST":
        case "CHAOS_VOTE": {
          // Chaos mode voting
          if (currentRole === "player1") {
            activeState.p1Vote = payload.vote || payload.p1Vote;
          } else {
            activeState.p2Vote = payload.vote || payload.p2Vote;
          }
          if (payload.index !== undefined) activeState.index = payload.index;

          const bothVoted = !!activeState.p1Vote && !!activeState.p2Vote;
          if (bothVoted) activeState.revealed = true;

          io.to(currentRoomId).emit("game:sync", {
            gameKey: activeGameKey,
            state: activeState,
            action: "VOTE_CAST",
            senderRole: currentRole,
            bothVoted,
          });
          break;
        }

        case "CHAOS_NEXT": {
          activeState.index = payload.nextIndex ?? (activeState.index || 0) + 1;
          activeState.p1Vote = null;
          activeState.p2Vote = null;
          activeState.revealed = false;
          io.to(currentRoomId).emit("game:sync", {
            gameKey: activeGameKey,
            state: activeState,
            action: "CHAOS_NEXT",
          });
          break;
        }

        case "HOW_WELL_ACTUAL_SELECT":
        case "HOW_WELL_TARGET_ANSWER": {
          activeState.actualIndex = payload.actualIndex ?? payload.answerIndex;
          activeState.index = payload.index;
          activeState.guesserIsP1 = payload.guesserIsP1;
          io.to(currentRoomId).emit("game:sync", {
            gameKey: activeGameKey,
            state: activeState,
            action: "ACTUAL_SELECTED",
            senderRole: currentRole,
          });
          break;
        }

        case "HOW_WELL_GUESS_SUBMIT":
        case "HOW_WELL_GUESS_ANSWER": {
          activeState.guessedIndex = payload.guessedIndex ?? payload.guessIndex;
          if (payload.actualIndex !== undefined) activeState.actualIndex = payload.actualIndex;
          activeState.revealed = true;
          io.to(currentRoomId).emit("game:sync", {
            gameKey: activeGameKey,
            state: activeState,
            action: "GUESS_REVEALED",
            senderRole: currentRole,
          });
          break;
        }

        case "HOW_WELL_NEXT": {
          activeState.index = payload.nextIndex ?? (activeState.index || 0) + 1;
          activeState.actualIndex = null;
          activeState.guessedIndex = null;
          activeState.revealed = false;
          activeState.guesserIsP1 = payload.guesserIsP1;
          io.to(currentRoomId).emit("game:sync", {
            gameKey: activeGameKey,
            state: activeState,
            action: "NEXT_ROUND",
          });
          break;
        }

        case "TELL_ME_SHARE": {
          activeState.answer = payload.answer;
          activeState.speakerRole = currentRole;
          activeState.speakerName = currentRole === "player1" ? room.player1Name : room.player2Name;
          io.to(currentRoomId).emit("game:sync", {
            gameKey: activeGameKey,
            state: activeState,
            action: "ANSWER_SHARED",
            answer: payload.answer,
            speakerRole: currentRole,
            speakerName: activeState.speakerName,
            senderRole: currentRole,
          });
          break;
        }

        case "TELL_ME_NEXT": {
          activeState.index = payload.nextIndex ?? (activeState.index || 0) + 1;
          activeState.speakerIsP1 = payload.speakerIsP1;
          activeState.answer = "";
          io.to(currentRoomId).emit("game:sync", {
            gameKey: activeGameKey,
            state: activeState,
            action: "PROMPT_NEXT",
          });
          break;
        }

        case "LDR_SYNC": {
          // payload: partial LDR updates
          Object.assign(activeState, payload);
          io.to(currentRoomId).emit("game:sync", {
            gameKey: activeGameKey,
            state: activeState,
            action: "LDR_UPDATED",
          });
          break;
        }

        case "DATE_NIGHT_STEP": {
          activeState.step = payload.step;
          io.to(currentRoomId).emit("game:sync", {
            gameKey: activeGameKey,
            state: activeState,
            action: "DATE_NIGHT_STEP_SYNCED",
          });
          break;
        }

        case "SAVE_MEMORY": {
          const memory = payload.memory;
          room.memories.unshift(memory);
          io.to(currentRoomId).emit("memory:saved", { memory, allMemories: room.memories });
          break;
        }

        default: {
          // Generic broadcast action for flexibility
          Object.assign(activeState, payload);
          io.to(currentRoomId).emit("game:sync", {
            gameKey: activeGameKey,
            state: activeState,
            action: type,
            payload,
            senderRole: currentRole,
          });
          break;
        }
      }
    });

    // 6. Disconnect Handling
    socket.on("disconnect", () => {
      if (currentRoomId && rooms.has(currentRoomId)) {
        const room = rooms.get(currentRoomId)!;
        if (room.players[socket.id]) {
          room.players[socket.id].connected = false;
          room.players[socket.id].isTyping = false;
          room.players[socket.id].lastActive = Date.now();

          const state = getSanitizedRoomState(room);
          io.to(currentRoomId).emit("room:updated", state);
          io.to(currentRoomId).emit("player:left", {
            role: currentRole,
            name: room.players[socket.id].name,
          });
        }
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Realtime Game Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
