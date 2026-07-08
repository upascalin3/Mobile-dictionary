import { createContext, PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';

import { getDictionaryError, searchDictionaryWord } from '@/services/dictionaryApi';
import {
  addSearchHistoryItem,
  clearSearchHistory as clearStoredSearchHistory,
  loadSearchHistory,
  removeSearchHistoryItem,
} from '@/storage/historyStorage';
import type { WordEntry } from '@/types/dictionary';

interface DictionaryState {
  loading: boolean;
  error: string | null;
  wordData: WordEntry | null;
  searchHistory: string[];
  lastSearchedWord: string | null;
}

interface DictionaryContextValue extends DictionaryState {
  searchWord: (word: string) => Promise<WordEntry | null>;
  retrySearch: () => Promise<WordEntry | null>;
  removeSearchHistoryItem: (word: string) => Promise<void>;
  clearSearchHistory: () => Promise<void>;
  clearError: () => void;
}

export const DictionaryContext = createContext<DictionaryContextValue | undefined>(undefined);

export function DictionaryProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wordData, setWordData] = useState<WordEntry | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [lastSearchedWord, setLastSearchedWord] = useState<string | null>(null);

  useEffect(() => {
    loadSearchHistory().then(setSearchHistory).catch(() => setSearchHistory([]));
  }, []);

  const searchWord = useCallback(async (word: string) => {
    setLoading(true);
    setError(null);
    setLastSearchedWord(word);

    try {
      const entry = await searchDictionaryWord(word);
      setWordData(entry);
      const nextHistory = await addSearchHistoryItem(entry.word.toLowerCase());
      setSearchHistory(nextHistory);
      return entry;
    } catch (searchError) {
      setError(getDictionaryError(searchError));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const retrySearch = useCallback(() => {
    if (!lastSearchedWord) {
      return Promise.resolve(null);
    }

    return searchWord(lastSearchedWord);
  }, [lastSearchedWord, searchWord]);

  const removeHistoryItem = useCallback(async (word: string) => {
    const nextHistory = await removeSearchHistoryItem(word);
    setSearchHistory(nextHistory);
  }, []);

  const clearSearchHistory = useCallback(async () => {
    await clearStoredSearchHistory();
    setSearchHistory([]);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(
    () => ({
      loading,
      error,
      wordData,
      searchHistory,
      lastSearchedWord,
      searchWord,
      retrySearch,
      removeSearchHistoryItem: removeHistoryItem,
      clearSearchHistory,
      clearError,
    }),
    [
      clearError,
      clearSearchHistory,
      error,
      lastSearchedWord,
      loading,
      removeHistoryItem,
      retrySearch,
      searchHistory,
      searchWord,
      wordData,
    ]
  );

  return <DictionaryContext.Provider value={value}>{children}</DictionaryContext.Provider>;
}
