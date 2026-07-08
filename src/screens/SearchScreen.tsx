import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { ErrorMessage } from '@/components/ErrorMessage';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { SearchBar } from '@/components/SearchBar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Shadows, Spacing } from '@/constants/theme';
import { useThemePreference } from '@/context/ThemePreferenceContext';
import { useDictionary } from '@/hooks/useDictionary';
import { useTheme } from '@/hooks/use-theme';
import { searchWordSuggestions } from '@/services/dictionaryApi';
import { validateWordInput } from '@/utils/validators';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { error, loading, searchHistory, searchWord, retrySearch, wordData } = useDictionary();
  const { resetSearch } = useLocalSearchParams<{ resetSearch?: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { scheme, toggleScheme } = useThemePreference();
  const { width } = useWindowDimensions();
  const isCompact = width < 380;
  const isTablet = width >= 768;

  useEffect(() => {
    if (!resetSearch) {
      return;
    }

    // Defer the reset so route-param updates do not synchronously cascade into render.
    const timeout = setTimeout(() => {
      setQuery('');
      setSuggestions([]);
      setSuggestionsLoading(false);
      setValidationError(null);
    }, 0);

    return () => clearTimeout(timeout);
  }, [resetSearch]);

  useEffect(() => {
    const trimmedQuery = query.trim().toLowerCase();

    if (trimmedQuery.length < 2 || !/^[a-z]+$/.test(trimmedQuery)) {
      return;
    }

    let active = true;

    // Debounce suggestion requests so typing does not fire an API call per keystroke.
    const timeout = setTimeout(() => {
      setSuggestionsLoading(true);
      searchWordSuggestions(trimmedQuery)
        .then((nextSuggestions) => {
          if (active) {
            setSuggestions(nextSuggestions.filter((word) => word !== trimmedQuery));
          }
        })
        .catch(() => {
          if (active) {
            setSuggestions([]);
          }
        })
        .finally(() => {
          if (active) {
            setSuggestionsLoading(false);
          }
        });
    }, 250);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [query]);

  const runSearch = async (word: string) => {
    setValidationError(null);
    setSuggestions([]);
    const entry = await searchWord(word);
    if (entry) {
      router.push('/details');
    }
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setSuggestions([]);
    setSuggestionsLoading(false);
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleSearch = async () => {
    Keyboard.dismiss();
    const result = validateWordInput(query);

    if (!result.valid) {
      setValidationError(result.message ?? 'Please enter a valid word.');
      return;
    }

    await runSearch(result.word);
  };

  const handleSuggestionPress = async (word: string) => {
    Keyboard.dismiss();
    setQuery(word);
    await runSearch(word);
  };

  const handleRetry = async () => {
    const entry = await retrySearch();
    if (entry) {
      router.push('/details');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        alwaysBounceVertical={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={[styles.scrollView, { backgroundColor: theme.background }]}
        contentContainerStyle={[
          styles.scrollContent,
          isCompact && styles.scrollContentCompact,
          isTablet && styles.scrollContentTablet,
        ]}>
        <SafeAreaView style={styles.safeArea}>
          <View style={[styles.content, isTablet && styles.contentTablet]}>
            <View style={[styles.topBar, isCompact && styles.topBarCompact]}>
              <View style={styles.brandBlock}>
                <View style={[styles.brandMark, { backgroundColor: theme.accentSoft }]}>
                  <SymbolView
                    tintColor={theme.accentStrong}
                    name={{ ios: 'text.book.closed.fill', android: 'menu_book', web: 'menu_book' }}
                    size={18}
                  />
                </View>
                <View>
                <ThemedText style={[styles.topKicker, { color: theme.accentStrong }]}>
                  LexiTech
                </ThemedText>
                <ThemedText style={styles.topTitle}>Dictionary Search</ThemedText>
                </View>
              </View>

              <Pressable
                accessibilityRole="switch"
                accessibilityLabel="Toggle color theme"
                accessibilityState={{ checked: scheme === 'dark' }}
                onPress={toggleScheme}
                style={({ pressed }) => [
                  styles.themeToggle,
                  isCompact && styles.themeToggleCompact,
                  { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                  pressed && styles.pressed,
                ]}>
                <SymbolView
                  tintColor={theme.accentStrong}
                  name={
                    scheme === 'dark'
                      ? { ios: 'moon.fill', android: 'dark_mode', web: 'dark_mode' }
                      : { ios: 'sun.max.fill', android: 'light_mode', web: 'light_mode' }
                  }
                  size={18}
                />
                <ThemedText style={[styles.themeToggleText, { color: theme.accentStrong }]}>
                  {scheme === 'dark' ? 'Dark' : 'Light'}
                </ThemedText>
              </Pressable>
            </View>

            <View
              style={[
                styles.appPanel,
                Shadows.raised,
                isCompact && styles.appPanelCompact,
                isTablet && styles.appPanelTablet,
                { backgroundColor: theme.backgroundElement, borderColor: theme.border },
              ]}>
              <View
                style={[
                  styles.hero,
                  Shadows.soft,
                  isCompact && styles.heroCompact,
                  isTablet && styles.heroTablet,
                  { backgroundColor: theme.accentSoft },
                ]}>
                <View style={styles.header}>
                  <View style={[styles.heroIcon, { backgroundColor: theme.backgroundElement }]}>
                    <SymbolView
                      tintColor={theme.accentStrong}
                      name={{ ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' }}
                      size={20}
                    />
                  </View>
                  <ThemedText style={[styles.kicker, { color: theme.accentStrong }]}>
                    LexiTech Solutions Ltd
                  </ThemedText>
                  <ThemedText type="subtitle" style={[styles.title, isCompact && styles.titleCompact]}>
                    Find the right word
                  </ThemedText>
                  <ThemedText themeColor="textSecondary" style={[styles.subtitle, isCompact && styles.subtitleCompact]}>
                    Search definitions, phonetics, examples, pronunciations, and nearby word suggestions.
                  </ThemedText>
                </View>

                <View style={[styles.quickStats, isCompact && styles.quickStatsCompact]}>
                  <View style={[styles.statPill, { backgroundColor: theme.backgroundElement }]}>
                    <ThemedText style={[styles.statValue, { color: theme.accentStrong }]}>
                      {searchHistory.length}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">history</ThemedText>
                  </View>
                  <View style={[styles.statPill, { backgroundColor: theme.backgroundElement }]}>
                    <ThemedText style={[styles.statValue, { color: theme.accentStrong }]}>6</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">suggestions</ThemedText>
                  </View>
                </View>
              </View>

              <View
                style={[
                  styles.searchSection,
                  isCompact && styles.searchSectionCompact,
                  { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                ]}>
                <ThemedText style={styles.sectionTitle}>Search word</ThemedText>
                <SearchBar value={query} onChangeText={handleQueryChange} onSubmit={handleSearch} loading={loading} />
              </View>

              {query.trim().length >= 2 && !loading && (suggestionsLoading || suggestions.length > 0) ? (
                <View
                  style={[
                    styles.suggestions,
                    Shadows.soft,
                    { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                  ]}>
                  <View style={styles.suggestionsHeader}>
                    <ThemedText type="small" themeColor="textSecondary">
                      Suggestions
                    </ThemedText>
                    {suggestionsLoading ? <ActivityIndicator color={theme.accentStrong} size="small" /> : null}
                  </View>

                  {suggestions.map((word) => (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Search ${word}`}
                      key={word}
                      onPress={() => handleSuggestionPress(word)}
                      style={({ pressed }) => [
                        styles.suggestionItem,
                        { borderColor: theme.border },
                        pressed && styles.pressed,
                      ]}>
                      <ThemedText style={styles.suggestionWord}>{word}</ThemedText>
                    </Pressable>
                  ))}
                </View>
              ) : null}

              {loading ? <LoadingSpinner /> : null}
              {validationError ? <ErrorMessage message={validationError} /> : null}
              {!validationError && error ? <ErrorMessage message={error} onRetry={handleRetry} /> : null}

              {!loading && !validationError && !error ? (
                <View
                  style={[
                    styles.emptyState,
                    Shadows.soft,
                    { backgroundColor: theme.accentSoft, borderColor: theme.border },
                  ]}>
                  <SymbolView
                    tintColor={theme.accentStrong}
                    name={{ ios: 'book.fill', android: 'menu_book', web: 'menu_book' }}
                    size={20}
                  />
                  <ThemedText themeColor="textSecondary" style={styles.emptyText}>
                    {wordData
                      ? `Last result: ${wordData.word}. Open the details screen or search again.`
                      : 'Search for a word to get started.'}
                  </ThemedText>
                </View>
              ) : null}
            </View>
          </View>
        </SafeAreaView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    flexGrow: 1,
    paddingBottom: Spacing.five,
  },
  scrollContentCompact: {
    paddingBottom: Spacing.four,
  },
  scrollContentTablet: {
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
  },
  content: {
    flex: 1,
    maxWidth: MaxContentWidth,
    padding: Spacing.three,
    width: '100%',
  },
  contentTablet: {
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.four,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  brandBlock: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
    minWidth: 0,
  },
  brandMark: {
    alignItems: 'center',
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  topBarCompact: {
    alignItems: 'flex-start',
    flexDirection: 'column',
    gap: Spacing.two,
  },
  topKicker: {
    fontSize: 12,
    fontWeight: 900,
    textTransform: 'uppercase',
  },
  topTitle: {
    fontSize: 18,
    fontWeight: 800,
  },
  themeToggle: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: Spacing.two,
    minHeight: 40,
    paddingHorizontal: Spacing.three,
  },
  themeToggleCompact: {
    alignSelf: 'flex-start',
  },
  themeToggleText: {
    fontSize: 13,
    fontWeight: 800,
  },
  appPanel: {
    borderRadius: 8,
    borderWidth: 1,
    gap: Spacing.four,
    padding: Spacing.two,
  },
  appPanelCompact: {
    gap: Spacing.three,
    padding: Spacing.two,
  },
  appPanelTablet: {
    padding: Spacing.three,
  },
  hero: {
    borderRadius: 8,
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
  },
  heroCompact: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
  },
  heroTablet: {
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.five,
  },
  header: {
    gap: Spacing.two,
  },
  heroIcon: {
    alignItems: 'center',
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    marginBottom: Spacing.one,
    width: 40,
  },
  kicker: {
    fontSize: 13,
    fontWeight: 800,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 36,
    lineHeight: 40,
  },
  titleCompact: {
    fontSize: 30,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  subtitleCompact: {
    fontSize: 14,
    lineHeight: 21,
  },
  quickStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  quickStatsCompact: {
    alignItems: 'stretch',
  },
  statPill: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: Spacing.two,
    minWidth: 0,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 900,
  },
  emptyState: {
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: 'row',
    gap: Spacing.two,
    padding: Spacing.four,
  },
  emptyText: {
    lineHeight: 22,
  },
  suggestions: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  searchSection: {
    borderRadius: 8,
    borderWidth: 1,
    gap: Spacing.two,
    padding: Spacing.three,
  },
  searchSectionCompact: {
    padding: Spacing.two,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 900,
  },
  suggestionsHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
  },
  suggestionItem: {
    borderBottomWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  suggestionWord: {
    fontSize: 16,
    textTransform: 'capitalize',
  },
  pressed: {
    opacity: 0.7,
  },
});
