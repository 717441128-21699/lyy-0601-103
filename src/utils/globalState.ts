import Taro from '@tarojs/taro';
import { currentUser } from '@/data/mockPlayers';
import type { Skill, Player, Item, GameRecord, RankItem } from '@/types/game';
import { mockItems } from '@/data/mockItems';
import { seasonRankList as defaultSeasonRank, dailyRankList as defaultDailyRank, friendRankList as defaultFriendRank, mockGameRecords as defaultRecords } from '@/data/mockRecords';

export interface PlayerProfile {
  name: string;
  avatar: string;
  color: string;
  skill: Skill | null;
}

export interface RoomData {
  code: string;
  hostId: string;
  players: Player[];
  spectators: Player[];
  status: 'waiting' | 'playing' | 'ended';
  gameTime: number;
}

export interface GlobalState {
  playerProfile: PlayerProfile;
  coins: number;
  myItems: Item[];
  roomCode: string;
  isSpectator: boolean;
  isReady: boolean;
  roomPlayers: Player[];
  roomSpectators: Player[];
  roomRegistry: Record<string, RoomData>;
  gameRecords: GameRecord[];
  seasonRank: RankItem[];
  dailyRank: RankItem[];
  friendRank: RankItem[];
}

const STORAGE_KEY = 'reaction_game_state';

const defaultProfile: PlayerProfile = {
  name: currentUser.name,
  avatar: currentUser.avatar,
  color: currentUser.color,
  skill: currentUser.skill
};

const defaultState: GlobalState = {
  playerProfile: defaultProfile,
  coins: 1250,
  myItems: [...mockItems],
  roomCode: '',
  isSpectator: false,
  isReady: false,
  roomPlayers: [],
  roomSpectators: [],
  roomRegistry: {},
  gameRecords: [...defaultRecords],
  seasonRank: [...defaultSeasonRank],
  dailyRank: [...defaultDailyRank],
  friendRank: [...defaultFriendRank],
};

export function loadGlobalState(): GlobalState {
  try {
    const raw = Taro.getStorageSync(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...defaultState,
        ...parsed,
        roomRegistry: { ...defaultState.roomRegistry, ...(parsed.roomRegistry || {}) },
        gameRecords: parsed.gameRecords || defaultState.gameRecords,
        seasonRank: parsed.seasonRank || defaultState.seasonRank,
        dailyRank: parsed.dailyRank || defaultState.dailyRank,
        friendRank: parsed.friendRank || defaultState.friendRank,
      };
    }
  } catch (e) {
    console.error('[GlobalState] 读取状态失败:', e);
  }
  return { ...defaultState };
}

export function saveGlobalState(state: Partial<GlobalState>): void {
  try {
    const current = loadGlobalState();
    const merged = { ...current, ...state };
    Taro.setStorageSync(STORAGE_KEY, JSON.stringify(merged));
  } catch (e) {
    console.error('[GlobalState] 保存状态失败:', e);
  }
}

export function getPlayerProfile(): PlayerProfile {
  return loadGlobalState().playerProfile;
}

export function savePlayerProfile(profile: PlayerProfile): void {
  saveGlobalState({ playerProfile: profile });
}

export function getMyCoins(): number {
  return loadGlobalState().coins;
}

export function saveMyCoins(coins: number): void {
  saveGlobalState({ coins });
}

export function getMyItems(): Item[] {
  return loadGlobalState().myItems;
}

export function saveMyItems(items: Item[]): void {
  saveGlobalState({ myItems: items });
}

export function saveRoomToRegistry(room: RoomData): void {
  const state = loadGlobalState();
  state.roomRegistry[room.code] = room;
  saveGlobalState({ roomRegistry: state.roomRegistry });
}

export function getRoomFromRegistry(code: string): RoomData | null {
  const state = loadGlobalState();
  return state.roomRegistry[code] || null;
}

export function removeRoomFromRegistry(code: string): void {
  const state = loadGlobalState();
  delete state.roomRegistry[code];
  saveGlobalState({ roomRegistry: state.roomRegistry });
}

export function addGameRecord(record: GameRecord): void {
  const state = loadGlobalState();
  state.gameRecords.unshift(record);
  saveGlobalState({ gameRecords: state.gameRecords });
}

export function updateRankAfterGame(myScore: number, isWin: boolean): void {
  const state = loadGlobalState();
  const profile = state.playerProfile;

  const meSeason = state.seasonRank.find(r => r.isMe);
  if (meSeason) {
    meSeason.score += myScore;
    meSeason.games += 1;
    const totalWins = Math.round(meSeason.winRate * (meSeason.games - 1) / 100) + (isWin ? 1 : 0);
    meSeason.winRate = Math.round(totalWins / meSeason.games * 100);
    meSeason.playerName = profile.name;
    meSeason.avatar = profile.avatar;
    state.seasonRank.sort((a, b) => b.score - a.score);
    state.seasonRank.forEach((r, i) => { r.rank = i + 1; });
  }

  const meDaily = state.dailyRank.find(r => r.isMe);
  if (meDaily) {
    meDaily.score += myScore;
    meDaily.games += 1;
    const totalWins = Math.round(meDaily.winRate * (meDaily.games - 1) / 100) + (isWin ? 1 : 0);
    meDaily.winRate = Math.round(totalWins / meDaily.games * 100);
    meDaily.playerName = profile.name;
    meDaily.avatar = profile.avatar;
    state.dailyRank.sort((a, b) => b.score - a.score);
    state.dailyRank.forEach((r, i) => { r.rank = i + 1; });
  }

  const meFriend = state.friendRank.find(r => r.isMe);
  if (meFriend) {
    meFriend.score += myScore;
    meFriend.games += 1;
    const totalWins = Math.round(meFriend.winRate * (meFriend.games - 1) / 100) + (isWin ? 1 : 0);
    meFriend.winRate = Math.round(totalWins / meFriend.games * 100);
    meFriend.playerName = profile.name;
    meFriend.avatar = profile.avatar;
    state.friendRank.sort((a, b) => b.score - a.score);
    state.friendRank.forEach((r, i) => { r.rank = i + 1; });
  }

  saveGlobalState({
    seasonRank: state.seasonRank,
    dailyRank: state.dailyRank,
    friendRank: state.friendRank,
    coins: state.coins + Math.floor(myScore / 10),
  });
}
