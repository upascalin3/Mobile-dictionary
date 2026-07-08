import { Alert, Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';

import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Shadows, Spacing } from '@/constants/theme';
import { useDictionary } from '@/hooks/useDictionary';
import { useTheme } from '@/hooks/use-theme';

interface DrawerContentProps {
  navigation?: {
    closeDrawer?: () => void;
  };
}

function DictionaryDrawerContent({ navigation }: DrawerContentProps) {
  const { clearSearchHistory, loading, removeSearchHistoryItem, searchHistory, searchWord } =
    useDictionary();
  const router = useRouter();
  const theme = useTheme();

  const openSearch = () => {
    navigation?.closeDrawer?.();
    router.push({
      pathname: '/',
      params: {
        resetSearch: Date.now().toString(),
      },
    });
  };

  const openHistoryWord = async (word: string) => {
    const entry = await searchWord(word);
    navigation?.closeDrawer?.();
    if (entry) {
      router.push('/details');
    }
  };

  const handleClearHistory = () => {
    const clearHistory = async () => {
      await clearSearchHistory();
    };

    if (Platform.OS === 'web') {
      void clearHistory();
      return;
    }

    Alert.alert('Clear history?', 'This removes every word from your search history.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => void clearHistory() },
    ]);
  };

  const handleRemoveHistoryItem = (word: string) => {
    void removeSearchHistoryItem(word);
  };

  return (
    <ThemedView style={styles.drawer}>
      <View style={styles.drawerHeader}>
        <ThemedText style={[styles.drawerKicker, { color: theme.accentStrong }]}>Dictionary</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Search history
        </ThemedText>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={openSearch}
        style={({ pressed }) => [
          styles.drawerAction,
          Shadows.soft,
          { backgroundColor: theme.accentSoft, borderColor: theme.border },
          pressed && styles.pressed,
        ]}>
        <ThemedText style={[styles.drawerActionText, { color: theme.accentStrong }]}>
          New Search
        </ThemedText>
      </Pressable>

      {searchHistory.length > 0 ? (
        <View style={styles.historyMeta}>
          <ThemedText type="small" themeColor="textSecondary">
            {searchHistory.length} saved
          </ThemedText>
          <Pressable
            accessibilityRole="button"
            disabled={loading}
            onPress={handleClearHistory}
            style={({ pressed }) => [
              styles.clearAction,
              pressed && styles.pressed,
              loading && styles.disabled,
            ]}>
            <ThemedText style={[styles.clearActionText, { color: theme.textSecondary }]}>Clear</ThemedText>
          </Pressable>
        </View>
      ) : null}

      {loading ? <LoadingSpinner /> : null}

      <View style={[styles.historyPanel, Shadows.soft, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.historyList,
            searchHistory.length === 0 && styles.historyListEmpty,
          ]}>
          {searchHistory.length === 0 ? (
            <View style={[styles.emptyHistory, { backgroundColor: theme.accentSoft }]}>
              <SymbolView
                tintColor={theme.accentStrong}
                name={{ ios: 'clock', android: 'history', web: 'history' }}
                size={18}
              />
              <ThemedText type="small" themeColor="textSecondary" style={styles.emptyHistoryText}>
                Successful searches will appear here.
              </ThemedText>
            </View>
          ) : (
            searchHistory.map((word) => (
              <View key={word} style={[styles.historyItem, { borderColor: theme.border }]}>
                <Pressable
                  accessibilityRole="button"
                  disabled={loading}
                  onPress={() => openHistoryWord(word)}
                  style={({ pressed }) => [
                    styles.historyWordButton,
                    pressed && styles.pressed,
                    loading && styles.disabled,
                  ]}>
                  <ThemedText style={styles.historyWord}>{word}</ThemedText>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${word} from search history`}
                  disabled={loading}
                  onPress={() => handleRemoveHistoryItem(word)}
                  style={({ pressed }) => [
                    styles.removeHistoryButton,
                    { backgroundColor: theme.accentSoft },
                    pressed && styles.pressed,
                    loading && styles.disabled,
                  ]}>
                  <SymbolView
                    tintColor={theme.textSecondary}
                    name={{
                      ios: 'trash',
                      android: 'delete',
                      web: 'delete',
                    }}
                    size={18}
                  />
                </Pressable>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </ThemedView>
  );
}

export function DrawerNavigator() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const drawerWidth = Math.min(340, Math.max(280, width * 0.86));

  return (
    <Drawer
      drawerContent={(props) => <DictionaryDrawerContent navigation={props.navigation} />}
      screenOptions={{
        drawerStyle: {
          backgroundColor: theme.background,
          width: drawerWidth,
        },
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTintColor: theme.text,
        sceneStyle: {
          backgroundColor: theme.background,
        },
      }}>
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: 'Search',
          title: 'Dictionary Search',
        }}
      />
      <Drawer.Screen
        name="details"
        options={{
          drawerLabel: 'Word Details',
          title: 'Word Details',
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawer: {
    flex: 1,
    gap: Spacing.three,
    padding: Spacing.four,
    paddingTop: Spacing.six,
  },
  drawerHeader: {
    gap: Spacing.one,
  },
  drawerKicker: {
    fontSize: 24,
    fontWeight: 800,
  },
  drawerAction: {
    borderWidth: 1,
    borderRadius: 8,
    padding: Spacing.three,
  },
  drawerActionText: {
    fontWeight: 800,
  },
  historyMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clearAction: {
    borderRadius: 8,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  clearActionText: {
    fontSize: 13,
    fontWeight: 700,
  },
  historyPanel: {
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  historyList: {
    gap: Spacing.two,
    padding: Spacing.three,
    paddingBottom: Spacing.five,
  },
  historyListEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyHistory: {
    alignItems: 'center',
    borderRadius: 8,
    gap: Spacing.two,
    padding: Spacing.three,
  },
  emptyHistoryText: {
    textAlign: 'center',
  },
  historyItem: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: Spacing.two,
  },
  historyWordButton: {
    flex: 1,
    paddingVertical: Spacing.three,
  },
  historyWord: {
    fontSize: 16,
    textTransform: 'capitalize',
  },
  removeHistoryButton: {
    alignItems: 'center',
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
});
