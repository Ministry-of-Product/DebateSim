import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getWordCountStatus } from '../utils/wordCounter';

interface WordCounterProps {
  count: number;
  limit?: number;
}

export const WordCounter: React.FC<WordCounterProps> = ({ count, limit = 200 }) => {
  const { color, isOverLimit } = getWordCountStatus(count, limit);

  return (
    <View style={styles.container}>
      <Text style={[styles.text, { color }]}>
        {count} / {limit} words
      </Text>
      {isOverLimit && (
        <Text style={styles.warning}>
          ⚠️ Over limit! Please shorten your response.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
  warning: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 4,
  },
});
