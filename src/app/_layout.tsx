import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { DictionaryProvider } from '@/context/DictionaryContext';
import { ThemePreferenceProvider, useThemePreference } from '@/context/ThemePreferenceContext';
import { DrawerNavigator } from '@/navigation/DrawerNavigator';

function RootContent() {
  const { scheme } = useThemePreference();

  return (
    <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <DictionaryProvider>
        <AnimatedSplashOverlay />
        <DrawerNavigator />
      </DictionaryProvider>
    </ThemeProvider>
  );
}

export default function TabLayout() {
  return (
    <ThemePreferenceProvider>
      <RootContent />
    </ThemePreferenceProvider>
  );
}
