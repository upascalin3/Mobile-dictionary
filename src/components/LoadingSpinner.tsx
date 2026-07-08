import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function LoadingSpinner() {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <ActivityIndicator color={theme.accentStrong} />
      <ThemedText themeColor="textSecondary" style={styles.text}>
        Searching dictionary...
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  text: {
    fontSize: 14,
  },
});
