import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Share,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, DebateMessage } from '../types';
import { DebateMessageItem } from '../components/DebateMessageItem';

type TranscriptScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Transcript'
>;
type TranscriptScreenRouteProp = RouteProp<RootStackParamList, 'Transcript'>;

interface Props {
  navigation: TranscriptScreenNavigationProp;
  route: TranscriptScreenRouteProp;
}

export const TranscriptScreen: React.FC<Props> = ({ navigation, route }) => {
  const { session } = route.params;

  const formatDuration = (): string => {
    if (!session.endTime) return 'In progress';

    const duration = session.endTime.getTime() - session.startTime.getTime();
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);

    return `${minutes}m ${seconds}s`;
  };

  const handleShare = async () => {
    try {
      const transcript = session.messages
        .map((msg) => {
          const sender = msg.sender === 'user' ? 'You' : 'AI';
          const time = msg.timestamp.toLocaleTimeString();
          return `[${time}] ${sender}:\n${msg.content}\n`;
        })
        .join('\n');

      const shareContent = `DebateSim Transcript\n\nTopic: ${session.topic}\nYour position: ${session.userSide}\nAI position: ${session.aiSide}\nDuration: ${formatDuration()}\n\n${transcript}`;

      await Share.share({
        message: shareContent,
      });
    } catch (error) {
      console.error('Error sharing transcript:', error);
    }
  };

  const handleNewDebate = () => {
    navigation.navigate('TopicSelection');
  };

  const renderMessage = ({ item }: { item: DebateMessage }) => (
    <DebateMessageItem message={item} />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Debate Transcript</Text>

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Topic:</Text>
          <Text style={styles.infoValue}>{session.topic}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Your Position:</Text>
          <Text style={styles.infoValue}>{session.userSide}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>AI Position:</Text>
          <Text style={styles.infoValue}>{session.aiSide}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Duration:</Text>
          <Text style={styles.infoValue}>{formatDuration()}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Total Messages:</Text>
          <Text style={styles.infoValue}>{session.messages.length}</Text>
        </View>
      </View>

      <Text style={styles.messagesTitle}>Messages</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={session.messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.button, styles.shareButton]} onPress={handleShare}>
          <Text style={styles.buttonText}>Share Transcript</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.newDebateButton]}
          onPress={handleNewDebate}
        >
          <Text style={styles.buttonText}>New Debate</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    width: 120,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  messagesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 8,
  },
  messageList: {
    paddingBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 8,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  shareButton: {
    backgroundColor: '#34C759',
  },
  newDebateButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
