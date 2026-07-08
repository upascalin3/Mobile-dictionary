import { useContext } from 'react';

import { DictionaryContext } from '@/context/DictionaryContext';

export function useDictionary() {
  const context = useContext(DictionaryContext);

  if (!context) {
    throw new Error('useDictionary must be used within DictionaryProvider');
  }

  return context;
}

