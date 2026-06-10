export interface Player {
  id: string;
  name: string;
  avatar: string;
  color: string;
  score: number;
  combo: number;
  maxCombo: number;
  isReady: boolean;
  isHost: boolean;
  isSpectator: boolean;
  skill: Skill | null;
  shieldActive: boolean;
  correctCount: number;
  wrongCount: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  cooldown: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'interfere' | 'shield' | 'emoji' | 'bonus';
  price: number;
  count?: number;
}

export interface Question {
  id: string;
  type: 'color' | 'number' | 'direction';
  content: string;
  answer: string;
  options: string[];
  color?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export interface Room {
  id: string;
  code: string;
  name: string;
  hostId: string;
  maxPlayers: number;
  gameTime: number;
  players: Player[];
  status: 'waiting' | 'playing' | 'ended';
  currentQuestion: Question | null;
  questionIndex: number;
}

export interface GameRecord {
  id: string;
  date: string;
  duration: number;
  playerCount: number;
  rank: number;
  score: number;
  correctCount: number;
  wrongCount: number;
  maxCombo: number;
  isWin: boolean;
}

export interface RankItem {
  rank: number;
  playerId: string;
  playerName: string;
  avatar: string;
  score: number;
  winRate: number;
  games: number;
  isFriend?: boolean;
  isMe?: boolean;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  reward: number;
  completed: boolean;
  progress: number;
  target: number;
}

export type GamePhase = 'ready' | 'countdown' | 'playing' | 'result';

export interface EmojiMessage {
  id: string;
  playerId: string;
  emoji: string;
  timestamp: number;
}
