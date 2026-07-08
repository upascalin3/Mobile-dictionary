import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Shadows, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Meaning } from '@/types/dictionary';

interface DefinitionCardProps {
  meaning: Meaning;
}

export function DefinitionCard({ meaning }: DefinitionCardProps) {
  const theme = useTheme();

  return (
    <View style={[styles.card, Shadows.soft, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <ThemedText style={[styles.partOfSpeech, { color: theme.accentStrong }]}>
        {meaning.partOfSpeech}
      </ThemedText>
      {meaning.definitions.map((definition, index) => (
        <View key={`${meaning.partOfSpeech}-${index}`} style={styles.definitionBlock}>
          <ThemedText style={styles.definition}>
            {index + 1}. {definition.definition}
          </ThemedText>
          {definition.example ? (
            <ThemedText themeColor="textSecondary" style={styles.example}>
              Example: {definition.example}
            </ThemedText>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 8,
    gap: Spacing.three,
    padding: Spacing.four,
  },
  partOfSpeech: {
    fontSize: 18,
    fontWeight: 800,
    textTransform: 'capitalize',
  },
  definitionBlock: {
    gap: Spacing.one,
  },
  definition: {
    fontSize: 15,
    lineHeight: 22,
  },
  example: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
});
