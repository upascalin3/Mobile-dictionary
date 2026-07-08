/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1D2418',
    background: '#F4F1E7',
    backgroundElement: '#FFFDF4',
    backgroundSelected: '#D9DFC7',
    textSecondary: '#66705A',
    accent: '#567C2C',
    accentStrong: '#2F5B1F',
    accentSoft: '#DCE8BF',
    border: '#D8D1BD',
    danger: '#B42318',
  },
  dark: {
    text: '#F7F4EA',
    background: '#11150F',
    backgroundElement: '#1D2419',
    backgroundSelected: '#33402C',
    textSecondary: '#B9C4A8',
    accent: '#A4C86F',
    accentStrong: '#C8E395',
    accentSoft: '#2B371F',
    border: '#3E4935',
    danger: '#F47B6F',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Shadows = {
  soft: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 18,
    },
    android: {
      elevation: 3,
    },
    default: {
      boxShadow: '0 12px 30px rgba(0, 0, 0, 0.10)',
    },
  }),
  raised: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 14 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
    },
    android: {
      elevation: 5,
    },
    default: {
      boxShadow: '0 18px 42px rgba(0, 0, 0, 0.14)',
    },
  }),
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
