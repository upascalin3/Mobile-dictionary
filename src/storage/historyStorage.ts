import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = 'dictionary.searchHistory';
const HISTORY_LIMIT = 20;

export async function loadSearchHistory(): Promise<string[]> {
  const value = await AsyncStorage.getItem(HISTORY_KEY);
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

export async function saveSearchHistory(history: string[]): Promise<void> {
  // Keep local history bounded so the drawer stays quick and compact.
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, HISTORY_LIMIT)));
}

export async function addSearchHistoryItem(word: string): Promise<string[]> {
  const current = await loadSearchHistory();
  const next = [word, ...current.filter((item) => item !== word)].slice(0, HISTORY_LIMIT);
  await saveSearchHistory(next);
  return next;
}

export async function removeSearchHistoryItem(word: string): Promise<string[]> {
  const current = await loadSearchHistory();
  const next = current.filter((item) => item !== word);
  await saveSearchHistory(next);
  return next;
}

export async function clearSearchHistory(): Promise<void> {
  await AsyncStorage.removeItem(HISTORY_KEY);
}
