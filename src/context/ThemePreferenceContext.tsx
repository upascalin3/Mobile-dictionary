import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

type ThemeScheme = 'light' | 'dark';

interface ThemePreferenceContextValue {
  scheme: ThemeScheme;
  toggleScheme: () => void;
}

const THEME_KEY = 'dictionary.themePreference';
const ThemePreferenceContext = createContext<ThemePreferenceContextValue | undefined>(undefined);

function isThemeScheme(value: unknown): value is ThemeScheme {
  return value === 'light' || value === 'dark';
}

export function ThemePreferenceProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [selectedScheme, setSelectedScheme] = useState<ThemeScheme>(
    systemScheme === 'dark' ? 'dark' : 'light'
  );

  useEffect(() => {
    let active = true;

    // Hydrate the explicit app theme once; invalid stored values fall back to system theme.
    AsyncStorage.getItem(THEME_KEY)
      .then((value) => {
        if (active && isThemeScheme(value)) {
          setSelectedScheme(value);
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  const toggleScheme = useCallback(() => {
    setSelectedScheme((currentScheme) => {
      const nextScheme = currentScheme === 'dark' ? 'light' : 'dark';
      // Persist asynchronously so the UI can switch immediately.
      void AsyncStorage.setItem(THEME_KEY, nextScheme);
      return nextScheme;
    });
  }, []);

  const value = useMemo(
    () => ({
      scheme: selectedScheme,
      toggleScheme,
    }),
    [selectedScheme, toggleScheme]
  );

  return <ThemePreferenceContext.Provider value={value}>{children}</ThemePreferenceContext.Provider>;
}

export function useThemePreference() {
  const context = useContext(ThemePreferenceContext);

  if (!context) {
    throw new Error('useThemePreference must be used within ThemePreferenceProvider');
  }

  return context;
}
