import { Player, Skill } from '@/types/game';

export const mockSkills: Skill[] = [
  {
    id: 'skill-1',
    name: '时间减缓',
    description: '减慢题目出现速度3秒',
    icon: '⏱️',
    cooldown: 15
  },
  {
    id: 'skill-2',
    name: '双倍积分',
    description: '接下来5题得分翻倍',
    icon: '✨',
    cooldown: 20
  },
  {
    id: 'skill-3',
    name: '错误免疫',
    description: '免疫下一次误触扣分',
    icon: '🛡️',
    cooldown: 12
  },
  {
    id: 'skill-4',
    name: '连击加速',
    description: '连击加成提高50%持续8秒',
    icon: '⚡',
    cooldown: 18
  }
];

export const mockPlayers: Player[] = [
  {
    id: 'player-1',
    name: '闪电侠',
    avatar: 'https://picsum.photos/id/64/200/200',
    color: '#6366f1',
    score: 0,
    combo: 0,
    maxCombo: 0,
    isReady: true,
    isHost: true,
    isSpectator: false,
    skill: mockSkills[0],
    shieldActive: false,
    correctCount: 0,
    wrongCount: 0
  },
  {
    id: 'player-2',
    name: '疾风少年',
    avatar: 'https://picsum.photos/id/91/200/200',
    color: '#ec4899',
    score: 0,
    combo: 0,
    maxCombo: 0,
    isReady: true,
    isHost: false,
    isSpectator: false,
    skill: mockSkills[1],
    shieldActive: false,
    correctCount: 0,
    wrongCount: 0
  },
  {
    id: 'player-3',
    name: '彩虹糖',
    avatar: 'https://picsum.photos/id/177/200/200',
    color: '#f59e0b',
    score: 0,
    combo: 0,
    maxCombo: 0,
    isReady: false,
    isHost: false,
    isSpectator: false,
    skill: mockSkills[2],
    shieldActive: false,
    correctCount: 0,
    wrongCount: 0
  },
  {
    id: 'player-4',
    name: '夜行者',
    avatar: 'https://picsum.photos/id/338/200/200',
    color: '#06b6d4',
    score: 0,
    combo: 0,
    maxCombo: 0,
    isReady: true,
    isHost: false,
    isSpectator: false,
    skill: mockSkills[3],
    shieldActive: false,
    correctCount: 0,
    wrongCount: 0
  },
  {
    id: 'player-5',
    name: '观察者小王',
    avatar: 'https://picsum.photos/id/1027/200/200',
    color: '#94a3b8',
    score: 0,
    combo: 0,
    maxCombo: 0,
    isReady: true,
    isHost: false,
    isSpectator: true,
    skill: null,
    shieldActive: false,
    correctCount: 0,
    wrongCount: 0
  }
];

export const currentUser: Player = {
  id: 'me',
  name: '我',
  avatar: 'https://picsum.photos/id/1025/200/200',
  color: '#6366f1',
  score: 0,
  combo: 0,
  maxCombo: 0,
  isReady: false,
  isHost: true,
  isSpectator: false,
  skill: mockSkills[0],
  shieldActive: false,
  correctCount: 0,
  wrongCount: 0
};

export const avatarOptions = [
  { id: 1, url: 'https://picsum.photos/id/64/200/200' },
  { id: 2, url: 'https://picsum.photos/id/91/200/200' },
  { id: 3, url: 'https://picsum.photos/id/177/200/200' },
  { id: 4, url: 'https://picsum.photos/id/338/200/200' },
  { id: 5, url: 'https://picsum.photos/id/1025/200/200' },
  { id: 6, url: 'https://picsum.photos/id/1027/200/200' },
  { id: 7, url: 'https://picsum.photos/id/237/200/200' },
  { id: 8, url: 'https://picsum.photos/id/1062/200/200' }
];

export const colorOptions = [
  '#6366f1',
  '#ec4899',
  '#f59e0b',
  '#06b6d4',
  '#10b981',
  '#ef4444',
  '#8b5cf6',
  '#f97316'
];
