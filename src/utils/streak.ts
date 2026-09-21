export interface StreakData {
  currentStreak: number;
  lastPlayedDate: string; // YYYY-MM-DD
}

const STREAK_KEY = 'aboutus_daily_streak_data';
const EXPLORED_KEY = 'aboutus_questions_explored_count';

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function loadStreakData(): StreakData {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) {
      // Default to 1 day streak for a warm initial welcome
      return { currentStreak: 1, lastPlayedDate: getTodayString() };
    }
    const data: StreakData = JSON.parse(raw);
    const today = getTodayString();
    const yesterday = getYesterdayString();

    if (data.lastPlayedDate === today) {
      return data;
    } else if (data.lastPlayedDate === yesterday) {
      return data;
    } else {
      // Missed more than a day, reset streak to 1
      return { currentStreak: 1, lastPlayedDate: data.lastPlayedDate };
    }
  } catch {
    return { currentStreak: 1, lastPlayedDate: getTodayString() };
  }
}

export function recordGameActivity(): StreakData {
  try {
    const current = loadStreakData();
    const today = getTodayString();
    const yesterday = getYesterdayString();

    let newStreak = current.currentStreak;
    if (current.lastPlayedDate === today) {
      // Already recorded today, maintain current streak (minimum 1)
      newStreak = Math.max(1, current.currentStreak);
    } else if (current.lastPlayedDate === yesterday) {
      // Played yesterday, increment streak!
      newStreak = (current.currentStreak || 0) + 1;
    } else {
      // First time or broken streak, start at 1
      newStreak = 1;
    }

    const updated: StreakData = {
      currentStreak: newStreak,
      lastPlayedDate: today
    };
    localStorage.setItem(STREAK_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return { currentStreak: 1, lastPlayedDate: getTodayString() };
  }
}

export function loadExploredCount(): number {
  try {
    const raw = localStorage.getItem(EXPLORED_KEY);
    return raw ? Math.max(0, parseInt(raw, 10)) : 6; // warm default start count
  } catch {
    return 6;
  }
}

export function incrementExploredCount(): number {
  try {
    const current = loadExploredCount();
    const next = current + 1;
    localStorage.setItem(EXPLORED_KEY, String(next));
    recordGameActivity();
    return next;
  } catch {
    return 7;
  }
}
