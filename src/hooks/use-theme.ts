/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useThemePreference } from '@/context/ThemePreferenceContext';

export function useTheme() {
  const { scheme } = useThemePreference();

  return Colors[scheme];
}
