import { SymbolView } from 'expo-symbols';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Shadows, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface SearchBarProps {
  value: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  loading?: boolean;
}

export function SearchBar({ value, onChangeText, onSubmit, loading = false }: SearchBarProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isWide = width >= 640;

  return (
    <View style={[styles.container, isWide && styles.containerWide]}>
      <View
        style={[
          styles.inputShell,
          Shadows.soft,
          isWide && styles.inputShellWide,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: theme.border,
          },
        ]}>
        <SymbolView
          tintColor={theme.textSecondary}
          name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
          size={18}
        />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
          placeholder="Enter an English word"
          placeholderTextColor={theme.textSecondary}
          returnKeyType="search"
          style={[styles.input, { color: theme.text }]}
        />
        {value.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search input"
            disabled={loading}
            onPress={() => onChangeText('')}
            style={({ pressed }) => [
              styles.clearButton,
              { backgroundColor: theme.accentSoft },
              pressed && styles.pressed,
              loading && styles.disabled,
            ]}>
            <SymbolView
              tintColor={theme.textSecondary}
              name={{ ios: 'xmark', android: 'close', web: 'close' }}
              size={16}
            />
          </Pressable>
        ) : null}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Search dictionary"
        disabled={loading}
        onPress={onSubmit}
        style={({ pressed }) => [
          styles.button,
          Shadows.soft,
          isWide && styles.buttonWide,
          { backgroundColor: theme.accentStrong },
          pressed && styles.pressed,
          loading && styles.disabled,
        ]}>
        {loading ? (
          <ActivityIndicator color={theme.background} size="small" />
        ) : (
          <SymbolView
            tintColor={theme.background}
            name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
            size={18}
          />
        )}
        <ThemedText style={[styles.buttonText, { color: theme.background }]}>
          {loading ? 'Searching' : 'Search'}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  containerWide: {
    alignItems: 'stretch',
    flexDirection: 'row',
  },
  inputShell: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: Spacing.two,
    minHeight: 56,
    paddingHorizontal: Spacing.three,
  },
  inputShellWide: {
    flex: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    minHeight: 56,
    minWidth: 0,
  },
  clearButton: {
    alignItems: 'center',
    borderRadius: 8,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  button: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: Spacing.two,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: Spacing.three,
  },
  buttonWide: {
    minWidth: 136,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: 800,
  },
  pressed: {
    opacity: 0.75,
  },
  disabled: {
    opacity: 0.55,
  },
});
