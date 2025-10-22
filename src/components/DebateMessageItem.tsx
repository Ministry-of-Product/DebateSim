import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DebateMessage } from '../types';

interface DebateMessageItemProps {
  message: DebateMessage;
}

export const DebateMessageItem: React.FC<DebateMessageItemProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}>
      <View style={styles.header}>
        <Text style={styles.sender}>{isUser ? 'You' : 'AI Opponent'}</Text>
        <Text style={styles.timestamp}>{formatTime(message.timestamp)}</Text>
      </View>
      <Text style={styles.content}>{message.content}</Text>
      <Text style={styles.wordCount}>{message.wordCount} words</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginHorizontal: 12,
    padding: 12,
    borderRadius: 12,
    maxWidth: '85%',
  },
  userContainer: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
  },
  aiContainer: {
    backgroundColor: '#E5E5EA',
    alignSelf: 'flex-start',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sender: {
    fontWeight: '700',
    fontSize: 14,
    color: '#000',
  },
  timestamp: {
    fontSize: 11,
    color: '#666',
  },
  content: {
    fontSize: 15,
    lineHeight: 20,
    color: '#000',
  },
  wordCount: {
    fontSize: 11,
    color: '#666',
    marginTop: 6,
    textAlign: 'right',
  },
});
