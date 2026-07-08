import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: theme.border,
          borderLeftColor: theme.danger,
        },
      ]}>
      <ThemedText style={[styles.message, { color: theme.danger }]}>{message}</ThemedText>
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          style={({ pressed }) => [
            styles.retryButton,
            { borderColor: theme.danger },
            pressed && styles.pressed,
          ]}>
          <ThemedText style={[styles.retryText, { color: theme.danger }]}>Retry Search</ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: 8,
    gap: Spacing.two,
    padding: Spacing.three,
  },
  message: {
    fontWeight: 700,
  },
  retryButton: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  retryText: {
    fontWeight: 700,
  },
  pressed: {
    opacity: 0.7,
  },
});
