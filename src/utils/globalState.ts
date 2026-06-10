import Taro from '@tarojs/taro';
import { currentUser } from '@/data/mockPlayers';
import type { Skill, Player, Item } from '@/types/game';
import { mockItems } from '@/data/mockItems';

export interface PlayerProfile {
  name: string;
  avatar: string;
  color: string;
  skill: Skill | null;
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
};

export function loadGlobalState(): GlobalState {
  try {
    const raw = Taro.getStorageSync(STORAGE_KEY);
    if (raw) {
      return { ...defaultState, ...JSON.parse(raw) };
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
