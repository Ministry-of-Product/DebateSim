import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, DebateMessage, DebateSession, DebateSide } from '../types';
import { DebateMessageItem } from '../components/DebateMessageItem';
import { WordCounter } from '../components/WordCounter';
import { countWords } from '../utils/wordCounter';
import { generateAIResponse, generateOpeningStatement } from '../services/api';
import { speakText, stopSpeaking } from '../services/speech';
import { saveTranscript } from '../services/storage';

type DebateScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Debate'>;
type DebateScreenRouteProp = RouteProp<RootStackParamList, 'Debate'>;

interface Props {
  navigation: DebateScreenNavigationProp;
  route: DebateScreenRouteProp;
}

export const DebateScreen: React.FC<Props> = ({ navigation, route }) => {
  const { topic, userSide } = route.params;
  const aiSide: DebateSide = userSide === 'for' ? 'against' : 'for';

  const [session, setSession] = useState<DebateSession>({
    id: Date.now().toString(),
    topic,
    userSide,
    aiSide,
    messages: [],
    currentTurn: 'ai', // AI starts with opening statement
    startTime: new Date(),
    isActive: true,
  });

  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const wordCount = countWords(currentInput);

  // Generate AI opening statement on mount
  useEffect(() => {
    generateAIOpening();
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (session.messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [session.messages]);

  const generateAIOpening = async () => {
    setIsLoading(true);
    let responseToSpeak = '';

    try {
      const response = await generateOpeningStatement(topic, aiSide);
      responseToSpeak = response;

      const aiMessage: DebateMessage = {
        id: Date.now().toString(),
        sender: 'ai',
        content: response,
        timestamp: new Date(),
        wordCount: countWords(response),
      };

      setSession((prev) => ({
        ...prev,
        messages: [...prev.messages, aiMessage],
        currentTurn: 'user',
      }));
    } catch (error) {
      console.error('Error generating AI opening:', error);
      Alert.alert('Error', 'Failed to generate AI opening statement. Using fallback.');

      // Fallback opening
      const fallbackMessage = `I'm here to debate the ${aiSide} side of: "${topic}". Let me start by presenting my opening argument.`;
      responseToSpeak = fallbackMessage;

      const aiMessage: DebateMessage = {
        id: Date.now().toString(),
        sender: 'ai',
        content: fallbackMessage,
        timestamp: new Date(),
        wordCount: countWords(fallbackMessage),
      };

      setSession((prev) => ({
        ...prev,
        messages: [...prev.messages, aiMessage],
        currentTurn: 'user',
      }));
    } finally {
      setIsLoading(false);
    }

    // Speak AI response AFTER loading spinner is hidden
    if (responseToSpeak) {
      await speakText(responseToSpeak);
    }
  };

  const handleSendMessage = async () => {
    if (currentInput.trim() === '' || session.currentTurn !== 'user') return;

    const userMessage: DebateMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: currentInput.trim(),
      timestamp: new Date(),
      wordCount,
    };

    // Add user message
    setSession((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      currentTurn: 'ai',
    }));

    setCurrentInput('');
    setIsLoading(true);

    let responseToSpeak = '';

    try {
      // Generate AI response
      const response = await generateAIResponse({
        topic,
        aiSide,
        conversationHistory: [...session.messages, userMessage],
        userMessage: currentInput.trim(),
      });

      responseToSpeak = response;

      const aiMessage: DebateMessage = {
        id: Date.now().toString(),
        sender: 'ai',
        content: response,
        timestamp: new Date(),
        wordCount: countWords(response),
      };

      setSession((prev) => ({
        ...prev,
        messages: [...prev.messages, aiMessage],
        currentTurn: 'user',
      }));
    } catch (error) {
      console.error('Error generating AI response:', error);
      Alert.alert('Error', 'Failed to generate AI response. Please try again.');

      // Revert turn back to user
      setSession((prev) => ({
        ...prev,
        currentTurn: 'user',
      }));
    } finally {
      setIsLoading(false);
    }

    // Speak AI response AFTER loading spinner is hidden
    if (responseToSpeak) {
      await speakText(responseToSpeak);
    }
  };

  const handleEndDebate = async () => {
    Alert.alert(
      'End Debate',
      'Are you sure you want to end this debate? The transcript will be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Debate',
          style: 'destructive',
          onPress: async () => {
            stopSpeaking();

            const endedSession: DebateSession = {
              ...session,
              endTime: new Date(),
              isActive: false,
            };

            try {
              await saveTranscript(endedSession);
              Alert.alert('Success', 'Debate transcript saved!');
              navigation.navigate('Transcript', { session: endedSession });
            } catch (error) {
              console.error('Error saving transcript:', error);
              Alert.alert('Error', 'Failed to save transcript, but you can still review it.');
              navigation.navigate('Transcript', { session: endedSession });
            }
          },
        },
      ]
    );
  };

  const renderMessage = ({ item }: { item: DebateMessage }) => (
    <DebateMessageItem message={item} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.topicContainer}>
          <Text style={styles.topicLabel}>Topic:</Text>
          <Text style={styles.topic} numberOfLines={2}>
            {topic}
          </Text>
        </View>
        <View style={styles.sidesContainer}>
          <Text style={styles.sideText}>
            You: <Text style={styles.sideBold}>{userSide}</Text>
          </Text>
          <Text style={styles.sideText}>
            AI: <Text style={styles.sideBold}>{aiSide}</Text>
          </Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={session.messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
      />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.loadingText}>Waiting for AI reply...</Text>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <View style={styles.turnIndicator}>
            <Text style={styles.turnText}>
              {session.currentTurn === 'user' ? "Your turn" : "AI's turn"}
            </Text>
          </View>

          <WordCounter count={wordCount} limit={200} />

          <TextInput
            style={styles.input}
            placeholder={
              session.currentTurn === 'user'
                ? 'Type your argument...'
                : 'Waiting for AI response...'
            }
            value={currentInput}
            onChangeText={setCurrentInput}
            multiline
            maxLength={1000}
            editable={session.currentTurn === 'user' && !isLoading}
            placeholderTextColor="#999"
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.endButton]}
              onPress={handleEndDebate}
            >
              <Text style={styles.buttonText}>End Debate</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.sendButton,
                (currentInput.trim() === '' ||
                  session.currentTurn !== 'user' ||
                  isLoading) &&
                  styles.buttonDisabled,
              ]}
              onPress={handleSendMessage}
              disabled={
                currentInput.trim() === '' ||
                session.currentTurn !== 'user' ||
                isLoading
              }
            >
              <Text style={styles.buttonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  topicContainer: {
    marginBottom: 8,
  },
  topicLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  topic: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginTop: 4,
  },
  sidesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  sideText: {
    fontSize: 14,
    color: '#666',
  },
  sideBold: {
    fontWeight: '700',
    color: '#007AFF',
  },
  messageList: {
    paddingVertical: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#F0F0F0',
  },
  loadingText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  inputContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    padding: 12,
  },
  turnIndicator: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  turnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    padding: 12,
    minHeight: 40,
    maxHeight: 100,
    fontSize: 16,
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  sendButton: {
    backgroundColor: '#007AFF',
  },
  endButton: {
    backgroundColor: '#FF3B30',
  },
  buttonDisabled: {
    backgroundColor: '#CCC',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
