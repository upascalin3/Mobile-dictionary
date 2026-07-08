import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { SymbolView } from 'expo-symbols';
import { Link, useRouter } from 'expo-router';

import { DefinitionCard } from '@/components/DefinitionCard';
import { ErrorMessage } from '@/components/ErrorMessage';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, MaxContentWidth, Shadows, Spacing } from '@/constants/theme';
import { useDictionary } from '@/hooks/useDictionary';
import { useTheme } from '@/hooks/use-theme';

interface PronunciationTrack {
  audioUrl: string;
  label: string;
  phoneticText?: string;
}

function getPronunciationTracks(phonetics: { audio?: string; text?: string }[]): PronunciationTrack[] {
  const seenUrls = new Set<string>();

  // Dictionary responses can repeat the same audio URL across phonetic entries.
  return phonetics.reduce<PronunciationTrack[]>((tracks, phonetic) => {
    if (!phonetic.audio || !/^https?:\/\//.test(phonetic.audio) || seenUrls.has(phonetic.audio)) {
      return tracks;
    }

    seenUrls.add(phonetic.audio);
    tracks.push({
      audioUrl: phonetic.audio,
      label: `Pronunciation ${tracks.length + 1}`,
      phoneticText: phonetic.text,
    });
    return tracks;
  }, []);
}

export default function WordDetailScreen() {
  const { error, loading, retrySearch, wordData } = useDictionary();
  const [activeAudioUrl, setActiveAudioUrl] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const router = useRouter();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isCompact = width < 420;
  const isTablet = width >= 768;
  const pronunciationTracks = useMemo(
    () => (wordData ? getPronunciationTracks(wordData.phonetics) : []),
    [wordData]
  );
  const player = useAudioPlayer(null, { updateInterval: 250 });
  const playerStatus = useAudioPlayerStatus(player);

  const phoneticText =
    wordData?.phonetic ?? wordData?.phonetics.find((phonetic) => Boolean(phonetic.text))?.text;

  const playAudio = async (audioUrl: string) => {
    try {
      setAudioError(null);

      // Replace the player source only when switching tracks or replaying a finished track.
      if (activeAudioUrl !== audioUrl || playerStatus.didJustFinish) {
        player.replace(audioUrl);
        await player.seekTo(0);
        setActiveAudioUrl(audioUrl);
      }

      player.play();
    } catch {
      setAudioError('Unable to play pronunciation.');
    }
  };

  const pauseAudio = () => {
    player.pause();
  };

  const stopAudio = async () => {
    try {
      player.pause();
      await player.seekTo(0);
      setActiveAudioUrl(null);
    } catch {
      setAudioError('Unable to stop pronunciation.');
    }
  };

  const getAudioState = (audioUrl: string) => {
    if (activeAudioUrl !== audioUrl) {
      return 'Ready';
    }

    if (playerStatus.error) {
      return 'Error';
    }

    if (playerStatus.isBuffering || !playerStatus.isLoaded) {
      return 'Loading';
    }

    if (playerStatus.playing) {
      return 'Playing';
    }

    return playerStatus.currentTime > 0 && !playerStatus.didJustFinish ? 'Paused' : 'Stopped';
  };

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/');
  };

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <LoadingSpinner />
      </ThemedView>
    );
  }

  if (!wordData) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText themeColor="textSecondary" style={styles.empty}>
          Search for a word to get started.
        </ThemedText>
        {error ? <ErrorMessage message={error} onRetry={retrySearch} /> : null}
        <Link href="/" asChild>
          <Pressable style={[styles.secondaryButton, { borderColor: theme.accentStrong }]}>
            <ThemedText style={[styles.secondaryButtonText, { color: theme.accentStrong }]}>
              Search Word
            </ThemedText>
          </Pressable>
        </Link>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
        style={[styles.scrollView, { backgroundColor: theme.background }]}
        contentContainerStyle={[
          styles.scrollContent,
          isCompact && styles.scrollContentCompact,
          isTablet && styles.scrollContentTablet,
        ]}>
        <SafeAreaView style={styles.safeArea}>
          <View style={[styles.content, isCompact && styles.contentCompact, isTablet && styles.contentTablet]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={goBack}
              style={({ pressed }) => [
                styles.backButton,
                Shadows.soft,
                { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                pressed && styles.pressed,
              ]}>
              <SymbolView
                tintColor={theme.accentStrong}
                name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
                size={18}
              />
              <ThemedText style={[styles.backButtonText, { color: theme.accentStrong }]}>Back</ThemedText>
            </Pressable>

            <View
              style={[
                styles.wordHeader,
                Shadows.soft,
                isCompact && styles.wordHeaderCompact,
                isTablet && styles.wordHeaderTablet,
                { backgroundColor: theme.accentSoft },
              ]}>
              <View style={styles.wordTitleBlock}>
                <ThemedText type="subtitle" style={[styles.word, isCompact && styles.wordCompact]}>
                  {wordData.word}
                </ThemedText>
                <ThemedText themeColor="textSecondary" style={[styles.phonetic, isCompact && styles.phoneticCompact]}>
                  {phoneticText ?? 'No phonetic spelling available.'}
                </ThemedText>
              </View>
            </View>

            {pronunciationTracks.length > 0 ? (
              <View
                style={[
                  styles.audioPanel,
                  Shadows.soft,
                  { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                ]}>
                <ThemedText style={styles.audioTitle}>Audio pronunciations</ThemedText>
                {pronunciationTracks.map((track) => {
                  const isActiveTrack = activeAudioUrl === track.audioUrl;
                  const audioState = getAudioState(track.audioUrl);
                  const canPause = isActiveTrack && playerStatus.playing;
                  const canStop = isActiveTrack && audioState !== 'Stopped';
                  const canPlay = !isActiveTrack || !playerStatus.playing;

                  return (
                    <View
                      key={track.audioUrl}
                      style={[
                        styles.audioRow,
                        isCompact && styles.audioRowCompact,
                        { backgroundColor: theme.accentSoft, borderColor: theme.backgroundSelected },
                      ]}>
                      <View style={styles.audioInfo}>
                        <ThemedText style={styles.audioLabel}>{track.label}</ThemedText>
                        <ThemedText themeColor="textSecondary" style={styles.audioMeta}>
                          {track.phoneticText ?? 'No phonetic label'}
                        </ThemedText>
                        <ThemedText
                          style={[
                            styles.audioState,
                            { color: theme.textSecondary },
                            audioState === 'Error' && { color: theme.danger },
                            audioState === 'Playing' && { color: theme.accentStrong },
                          ]}>
                          {`State: ${audioState}`}
                        </ThemedText>
                      </View>

                      <View style={[styles.audioControls, isCompact && styles.audioControlsCompact]}>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Play ${track.label}`}
                          disabled={!canPlay}
                          onPress={() => playAudio(track.audioUrl)}
                          style={({ pressed }) => [
                            styles.audioButton,
                            { backgroundColor: theme.accentStrong },
                            pressed && styles.pressed,
                            !canPlay && styles.disabled,
                          ]}>
                          <SymbolView
                            tintColor={Colors.dark.text}
                            name={{ ios: 'play.fill', android: 'play_arrow', web: 'play_arrow' }}
                            size={20}
                          />
                        </Pressable>

                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Pause ${track.label}`}
                          disabled={!canPause}
                          onPress={pauseAudio}
                          style={({ pressed }) => [
                            styles.pauseButton,
                            { borderColor: theme.border },
                            pressed && styles.pressed,
                            !canPause && styles.disabled,
                          ]}>
                          <SymbolView
                            tintColor={theme.accentStrong}
                            name={{ ios: 'pause.fill', android: 'pause', web: 'pause' }}
                            size={20}
                          />
                        </Pressable>

                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Stop ${track.label}`}
                          disabled={!canStop}
                          onPress={stopAudio}
                          style={({ pressed }) => [
                            styles.stopButton,
                            { borderColor: theme.border },
                            pressed && styles.pressed,
                            !canStop && styles.disabled,
                          ]}>
                          <SymbolView
                            tintColor={theme.danger}
                            name={{ ios: 'stop.fill', android: 'stop', web: 'stop' }}
                            size={20}
                          />
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <ThemedText themeColor="textSecondary" style={styles.noAudio}>
                No pronunciation available.
              </ThemedText>
            )}
            {audioError || playerStatus.error ? (
              <ErrorMessage message={audioError ?? playerStatus.error ?? 'Unable to play pronunciation.'} />
            ) : null}
            {error ? <ErrorMessage message={error} onRetry={retrySearch} /> : null}

            <View style={styles.meanings}>
              {wordData.meanings.map((meaning, index) => (
                <DefinitionCard key={`${meaning.partOfSpeech}-${index}`} meaning={meaning} />
              ))}
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
    paddingBottom: Spacing.five,
  },
  scrollContentCompact: {
    paddingBottom: Spacing.four,
  },
  scrollContentTablet: {
    paddingTop: Spacing.three,
  },
  safeArea: {
    width: '100%',
  },
  content: {
    gap: Spacing.three,
    maxWidth: MaxContentWidth,
    padding: Spacing.four,
    width: '100%',
  },
  contentCompact: {
    padding: Spacing.three,
  },
  contentTablet: {
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.four,
  },
  backButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  backButtonText: {
    fontWeight: 700,
  },
  wordHeader: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: Spacing.three,
    justifyContent: 'space-between',
    padding: Spacing.four,
  },
  wordHeaderCompact: {
    padding: Spacing.three,
  },
  wordHeaderTablet: {
    padding: Spacing.five,
  },
  wordTitleBlock: {
    flex: 1,
    gap: Spacing.one,
  },
  word: {
    fontSize: 38,
    lineHeight: 44,
    textTransform: 'capitalize',
  },
  wordCompact: {
    fontSize: 31,
    lineHeight: 36,
  },
  phonetic: {
    fontSize: 18,
  },
  phoneticCompact: {
    fontSize: 15,
    lineHeight: 21,
  },
  audioPanel: {
    borderWidth: 1,
    borderRadius: 8,
    gap: Spacing.two,
    padding: Spacing.three,
  },
  audioTitle: {
    fontSize: 16,
    fontWeight: 800,
  },
  audioRow: {
    alignItems: 'center',
    borderRadius: 8,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: Spacing.three,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  audioRowCompact: {
    alignItems: 'stretch',
    flexDirection: 'column',
  },
  audioInfo: {
    flex: 1,
    gap: Spacing.half,
  },
  audioLabel: {
    fontSize: 15,
    fontWeight: 700,
  },
  audioMeta: {
    fontSize: 14,
  },
  audioState: {
    fontSize: 12,
    fontWeight: 700,
  },
  audioControls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  audioControlsCompact: {
    justifyContent: 'flex-start',
  },
  audioButton: {
    alignItems: 'center',
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  pauseButton: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  stopButton: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  noAudio: {
    fontSize: 14,
  },
  meanings: {
    gap: Spacing.three,
    paddingBottom: Spacing.four,
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    gap: Spacing.three,
    justifyContent: 'center',
    padding: Spacing.four,
  },
  empty: {
    textAlign: 'center',
  },
  secondaryButton: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  secondaryButtonText: {
    fontWeight: 700,
  },
  pressed: {
    opacity: 0.75,
  },
  disabled: {
    opacity: 0.45,
  },
});
