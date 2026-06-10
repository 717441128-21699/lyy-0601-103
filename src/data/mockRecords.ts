import { GameRecord, RankItem, DailyChallenge } from '@/types/game';

export const mockGameRecords: GameRecord[] = [
  {
    id: 'record-1',
    date: '2024-01-15 20:30',
    duration: 180,
    playerCount: 4,
    rank: 1,
    score: 2450,
    correctCount: 28,
    wrongCount: 3,
    maxCombo: 12,
    isWin: true
  },
  {
    id: 'record-2',
    date: '2024-01-15 19:15',
    duration: 180,
    playerCount: 3,
    rank: 2,
    score: 1980,
    correctCount: 24,
    wrongCount: 5,
    maxCombo: 8,
    isWin: false
  },
  {
    id: 'record-3',
    date: '2024-01-14 21:00',
    duration: 180,
    playerCount: 5,
    rank: 1,
    score: 2680,
    correctCount: 31,
    wrongCount: 2,
    maxCombo: 15,
    isWin: true
  },
  {
    id: 'record-4',
    date: '2024-01-14 18:45',
    duration: 180,
    playerCount: 4,
    rank: 3,
    score: 1560,
    correctCount: 20,
    wrongCount: 7,
    maxCombo: 6,
    isWin: false
  },
  {
    id: 'record-5',
    date: '2024-01-13 20:00',
    duration: 180,
    playerCount: 6,
    rank: 2,
    score: 2200,
    correctCount: 26,
    wrongCount: 4,
    maxCombo: 10,
    isWin: false
  },
  {
    id: 'record-6',
    date: '2024-01-12 19:30',
    duration: 180,
    playerCount: 4,
    rank: 1,
    score: 2380,
    correctCount: 27,
    wrongCount: 3,
    maxCombo: 11,
    isWin: true
  },
  {
    id: 'record-7',
    date: '2024-01-11 21:15',
    duration: 180,
    playerCount: 3,
    rank: 1,
    score: 2100,
    correctCount: 25,
    wrongCount: 4,
    maxCombo: 9,
    isWin: true
  },
  {
    id: 'record-8',
    date: '2024-01-10 20:00',
    duration: 180,
    playerCount: 5,
    rank: 4,
    score: 1420,
    correctCount: 18,
    wrongCount: 8,
    maxCombo: 5,
    isWin: false
  }
];

export const seasonRankList: RankItem[] = [
  {
    rank: 1,
    playerId: 'p1',
    playerName: '闪电侠',
    avatar: 'https://picsum.photos/id/64/200/200',
    score: 15680,
    winRate: 85,
    games: 42,
    isFriend: true
  },
  {
    rank: 2,
    playerId: 'p2',
    playerName: '疾风少年',
    avatar: 'https://picsum.photos/id/91/200/200',
    score: 14520,
    winRate: 78,
    games: 38,
    isFriend: true
  },
  {
    rank: 3,
    playerId: 'p3',
    playerName: '彩虹糖',
    avatar: 'https://picsum.photos/id/177/200/200',
    score: 13890,
    winRate: 72,
    games: 45,
    isFriend: false
  },
  {
    rank: 4,
    playerId: 'me',
    playerName: '我',
    avatar: 'https://picsum.photos/id/1025/200/200',
    score: 12450,
    winRate: 65,
    games: 35,
    isMe: true
  },
  {
    rank: 5,
    playerId: 'p5',
    playerName: '夜行者',
    avatar: 'https://picsum.photos/id/338/200/200',
    score: 11800,
    winRate: 60,
    games: 40,
    isFriend: true
  },
  {
    rank: 6,
    playerId: 'p6',
    playerName: '光速小子',
    avatar: 'https://picsum.photos/id/1074/200/200',
    score: 10560,
    winRate: 58,
    games: 32,
    isFriend: false
  },
  {
    rank: 7,
    playerId: 'p7',
    playerName: '反应王',
    avatar: 'https://picsum.photos/id/1005/200/200',
    score: 9870,
    winRate: 55,
    games: 28,
    isFriend: false
  },
  {
    rank: 8,
    playerId: 'p8',
    playerName: '小旋风',
    avatar: 'https://picsum.photos/id/1012/200/200',
    score: 8920,
    winRate: 52,
    games: 25,
    isFriend: true
  },
  {
    rank: 9,
    playerId: 'p9',
    playerName: '疾风',
    avatar: 'https://picsum.photos/id/1027/200/200',
    score: 7650,
    winRate: 48,
    games: 20,
    isFriend: false
  },
  {
    rank: 10,
    playerId: 'p10',
    playerName: '闪电',
    avatar: 'https://picsum.photos/id/1062/200/200',
    score: 6540,
    winRate: 45,
    games: 18,
    isFriend: false
  }
];

export const dailyRankList: RankItem[] = [
  {
    rank: 1,
    playerId: 'p1',
    playerName: '闪电侠',
    avatar: 'https://picsum.photos/id/64/200/200',
    score: 2890,
    winRate: 100,
    games: 3,
    isFriend: true
  },
  {
    rank: 2,
    playerId: 'p3',
    playerName: '彩虹糖',
    avatar: 'https://picsum.photos/id/177/200/200',
    score: 2680,
    winRate: 100,
    games: 2,
    isFriend: false
  },
  {
    rank: 3,
    playerId: 'me',
    playerName: '我',
    avatar: 'https://picsum.photos/id/1025/200/200',
    score: 2450,
    winRate: 66,
    games: 3,
    isMe: true
  },
  {
    rank: 4,
    playerId: 'p2',
    playerName: '疾风少年',
    avatar: 'https://picsum.photos/id/91/200/200',
    score: 1980,
    winRate: 50,
    games: 2,
    isFriend: true
  },
  {
    rank: 5,
    playerId: 'p5',
    playerName: '夜行者',
    avatar: 'https://picsum.photos/id/338/200/200',
    score: 1750,
    winRate: 50,
    games: 2,
    isFriend: true
  }
];

export const friendRankList: RankItem[] = [
  {
    rank: 1,
    playerId: 'p1',
    playerName: '闪电侠',
    avatar: 'https://picsum.photos/id/64/200/200',
    score: 15680,
    winRate: 85,
    games: 42,
    isFriend: true
  },
  {
    rank: 2,
    playerId: 'p2',
    playerName: '疾风少年',
    avatar: 'https://picsum.photos/id/91/200/200',
    score: 14520,
    winRate: 78,
    games: 38,
    isFriend: true
  },
  {
    rank: 3,
    playerId: 'me',
    playerName: '我',
    avatar: 'https://picsum.photos/id/1025/200/200',
    score: 12450,
    winRate: 65,
    games: 35,
    isMe: true
  },
  {
    rank: 4,
    playerId: 'p5',
    playerName: '夜行者',
    avatar: 'https://picsum.photos/id/338/200/200',
    score: 11800,
    winRate: 60,
    games: 40,
    isFriend: true
  },
  {
    rank: 5,
    playerId: 'p8',
    playerName: '小旋风',
    avatar: 'https://picsum.photos/id/1012/200/200',
    score: 8920,
    winRate: 52,
    games: 25,
    isFriend: true
  }
];

export const dailyChallenges: DailyChallenge[] = [
  {
    id: 'dc-1',
    title: '初次挑战',
    description: '完成今日首局游戏',
    reward: 50,
    completed: true,
    progress: 1,
    target: 1
  },
  {
    id: 'dc-2',
    title: '连胜达人',
    description: '连续获胜3局',
    reward: 100,
    completed: false,
    progress: 1,
    target: 3
  },
  {
    id: 'dc-3',
    title: '连击大师',
    description: '单局达成10连击',
    reward: 80,
    completed: true,
    progress: 12,
    target: 10
  },
  {
    id: 'dc-4',
    title: '社交达人',
    description: '邀请好友加入游戏',
    reward: 60,
    completed: false,
    progress: 0,
    target: 1
  }
];
