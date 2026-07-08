import { create, isAxiosError, type AxiosError } from 'axios';

import type { WordEntry } from '@/types/dictionary';

const REQUEST_TIMEOUT_MS = 12000;
const REQUEST_RETRY_DELAY_MS = 450;

const api = create({
  baseURL: 'https://api.dictionaryapi.dev/api/v2/entries/en',
  timeout: REQUEST_TIMEOUT_MS,
});

const suggestionApi = create({
  baseURL: 'https://api.datamuse.com',
  timeout: REQUEST_TIMEOUT_MS,
});

interface WordSuggestionResponse {
  word?: unknown;
}

function isWordEntry(value: unknown): value is WordEntry {
  if (!value || typeof value !== 'object') {
    return false;
  }

  // Guard the app against partial or unexpected third-party API responses.
  const entry = value as Partial<WordEntry>;
  return (
    typeof entry.word === 'string' &&
    Array.isArray(entry.phonetics) &&
    Array.isArray(entry.meanings)
  );
}

function isTransientRequestError(error: unknown) {
  return (
    isAxiosError(error) &&
    (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || !error.response)
  );
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withTransientRetry<T>(request: () => Promise<T>): Promise<T> {
  try {
    return await request();
  } catch (error) {
    if (!isTransientRequestError(error)) {
      throw error;
    }

    await wait(REQUEST_RETRY_DELAY_MS);
    return request();
  }
}

export function getDictionaryError(error: unknown): string {
  if (isAxiosError(error)) {
    const axiosError = error as AxiosError;

    if (axiosError.response?.status === 404) {
      return 'Word not found.\nTry another word.';
    }

    if (!axiosError.response) {
      return 'The dictionary service is taking too long.\nPlease check your connection and try again.';
    }
  }

  return 'Something went wrong.\nPlease try again later.';
}

export async function searchDictionaryWord(word: string): Promise<WordEntry> {
  const response = await withTransientRetry(() => api.get<unknown[]>(`/${encodeURIComponent(word)}`));
  const firstEntry = response.data?.[0];

  if (!isWordEntry(firstEntry)) {
    throw new Error('Malformed dictionary response');
  }

  return firstEntry;
}

export async function searchWordSuggestions(query: string): Promise<string[]> {
  const response = await withTransientRetry(() =>
    suggestionApi.get<WordSuggestionResponse[]>('/sug', {
      params: {
        max: 6,
        s: query,
      },
    })
  );

  return response.data
    .map((suggestion) => suggestion.word)
    .filter((word): word is string => typeof word === 'string' && /^[A-Za-z]+$/.test(word));
}
