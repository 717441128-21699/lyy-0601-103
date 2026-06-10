export function calculateScore(
  baseScore: number,
  combo: number,
  isCorrect: boolean
): number {
  if (!isCorrect) {
    return -10;
  }
  
  const comboBonus = Math.floor(combo * 0.5);
  return baseScore + comboBonus;
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function getRankIcon(rank: number): string {
  switch (rank) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return rank.toString();
  }
}

export function getScoreLevel(score: number): { level: string; color: string } {
  if (score >= 2500) {
    return { level: '反应之神', color: '#f59e0b' };
  } else if (score >= 2000) {
    return { level: '闪电手', color: '#8b5cf6' };
  } else if (score >= 1500) {
    return { level: '快手达人', color: '#6366f1' };
  } else if (score >= 1000) {
    return { level: '反应新秀', color: '#06b6d4' };
  } else {
    return { level: '初出茅庐', color: '#64748b' };
  }
}

export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
