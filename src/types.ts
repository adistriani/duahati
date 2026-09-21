export type GameModeId =
  | 'welcome'
  | 'lobby'
  | 'deep-talk'
  | 'this-or-that'
  | 'wishes'
  | 'get-to-know'
  | 'how-well'
  | 'love-us'
  | 'chaos'
  | 'tell-me'
  | 'daily-drop'
  | 'library';

export type QuestionCategory =
  | 'Light'
  | 'Flirty'
  | 'Deep Talk'
  | 'Love'
  | 'Communication'
  | 'Values'
  | 'Family'
  | 'Money'
  | 'Future'
  | 'Marriage'
  | 'Children'
  | 'LDR'
  | 'Intimacy'
  | 'Reflection'
  | 'Chaos';

export type QuestionDifficulty = '🌱 Easy' | '🌿 Getting deeper' | '🌙 Vulnerable' | '✨ Big conversation';

export interface BaseQuestion {
  id: string;
  category: QuestionCategory;
  text: string;
  difficulty?: QuestionDifficulty | number | string;
  subtext?: string;
}

export type QuestionItem = BaseQuestion;

export interface ThisOrThatItem {
  id: string;
  optionA: { label: string; icon: string };
  optionB: { label: string; icon: string };
  category: QuestionCategory;
  followUp: string;
}

export interface GetToKnowItem {
  id: string;
  statementA: string;
  statementB: string;
  category: QuestionCategory;
}

export interface HowWellItem {
  id: string;
  question: string;
  options: string[];
  category: QuestionCategory;
}

export interface ChaosItem {
  id: string;
  prompt: string;
}

export interface MemoryKeepsake {
  id: string;
  createdAt: string;
  title: string;
  gameType: string;
  player1Name: string;
  player2Name: string;
  player1Answer?: string;
  player2Answer?: string;
  sharedAnswer?: string;
  reaction?: string;
  category?: string;
  promptText: string;
  note?: string;
}

export interface CustomQuestion {
  id: string;
  createdAt: string;
  authorName: string;
  text: string;
  mode: 'reveal_both' | 'direct';
  player1Answer?: string;
  player2Answer?: string;
  answered: boolean;
}

export type RelationshipStage =
  | 'curiosity'
  | 'getting_closer'
  | 'knowing_each_other'
  | 'building_something'
  | 'imagining_forever';

export interface CoupleProfile {
  player1: string;
  player2: string;
  stage: RelationshipStage;
  meetingDate?: string;
  passAndPlay: boolean;
  soundEnabled: boolean;
  isOnlineMode?: boolean;
  myRole?: 'player1' | 'player2';
  roomId?: string;
}

export interface OnlinePlayerStatus {
  name: string;
  connected: boolean;
  isTyping: boolean;
  present: boolean;
}

export interface RoomStatePayload {
  roomId: string;
  gameMode: GameModeId | string;
  player1: OnlinePlayerStatus;
  player2: OnlinePlayerStatus;
  gameData: Record<string, any>;
  memories: MemoryKeepsake[];
  updatedAt: number;
}
