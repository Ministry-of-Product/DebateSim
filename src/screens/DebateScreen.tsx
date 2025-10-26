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
    const initializeDebate = async () => {
      try {
        await generateAIOpening();
      } catch (error) {
        console.error('❌ Error initializing debate:', error);
      }
    };
    
    initializeDebate();
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
    console.log('🎯 Starting AI opening generation...');
    console.log('📋 Topic:', topic);
    console.log('📋 AI Side:', aiSide);
    
    // Step 1: Show thinking state immediately
    setIsLoading(true);
    
    // Step 2: Add a "thinking" message to show the AI is working
    const thinkingMessage: DebateMessage = {
      id: 'thinking-' + Date.now(),
      sender: 'ai',
      content: '🤔 Thinking about my opening statement...',
      timestamp: new Date(),
      wordCount: 0,
    };
    
    setSession((prev) => ({
      ...prev,
      messages: [...prev.messages, thinkingMessage],
      currentTurn: 'ai', // Keep it as AI's turn while thinking
    }));

    try {
      console.log('📞 Calling generateOpeningStatement API...');
      console.log('📋 Frontend - Topic:', topic);
      console.log('📋 Frontend - AI Side:', aiSide);
      console.log('📋 Frontend - About to call API...');
      
      const response = await generateOpeningStatement(topic, aiSide);
      
      console.log('✅ Received AI response from API call');
      console.log('✅ Response type:', typeof response);
      console.log('✅ Response value:', response);
      console.log('✅ Response length:', response?.length || 0);
      console.log('✅ Response preview:', response?.substring(0, 100) + '...');

      // Step 3: Replace thinking message with actual response
      const aiMessage: DebateMessage = {
        id: Date.now().toString(),
        sender: 'ai',
        content: response,
        timestamp: new Date(),
        wordCount: countWords(response),
      };

      setSession((prev) => ({
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === thinkingMessage.id ? aiMessage : msg
        ),
        currentTurn: 'user',
      }));

      // Step 4: Speak the response
      try {
        await speakText(response);
      } catch (speakError) {
        console.log('Error speaking text:', speakError);
      }

    } catch (error) {
      console.log('❌ Error generating AI opening:', error);
      console.log('❌ Error type:', typeof error);
      console.log('❌ Error message:', error?.message || 'No message');
      console.log('❌ Error stack:', error?.stack || 'No stack');
      console.log('❌ Full error object:', JSON.stringify(error, null, 2));
      
      // Step 3 (fallback): Replace thinking message with fallback
      const fallbackMessage = `I'm here to debate the ${aiSide} side of: "${topic}". Let me start by presenting my opening argument.`;
      
      const fallbackAiMessage: DebateMessage = {
        id: Date.now().toString(),
        sender: 'ai',
        content: fallbackMessage,
        timestamp: new Date(),
        wordCount: countWords(fallbackMessage),
      };

      setSession((prev) => ({
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === thinkingMessage.id ? fallbackAiMessage : msg
        ),
        currentTurn: 'user',
      }));

      // Show error alert
      Alert.alert('Error', 'Failed to generate AI opening statement. Using fallback.');

      // Speak fallback
      try {
        await speakText(fallbackMessage);
      } catch (speakError) {
        console.log('Error speaking fallback text:', speakError);
      }
    } finally {
      // Step 5: Always clear loading state
      setIsLoading(false);
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

    // Step 1: Add user message and show thinking state
    setSession((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      currentTurn: 'ai',
    }));

    setCurrentInput('');
    setIsLoading(true);

    // Step 2: Add thinking message
    const thinkingMessage: DebateMessage = {
      id: 'thinking-' + Date.now(),
      sender: 'ai',
      content: '🤔 Thinking about my response...',
      timestamp: new Date(),
      wordCount: 0,
    };

    setSession((prev) => ({
      ...prev,
      messages: [...prev.messages, thinkingMessage],
    }));

    try {
      // Step 3: Generate AI response
      console.log('📞 Calling generateAIResponse API...');
      console.log('📋 Frontend - Topic:', topic);
      console.log('📋 Frontend - AI Side:', aiSide);
      console.log('📋 Frontend - User Message:', userMessage.content);
      console.log('📋 Frontend - Conversation History Length:', [...session.messages, userMessage].length);
      
      const response = await generateAIResponse({
        topic,
        aiSide,
        conversationHistory: [...session.messages, userMessage],
        userMessage: userMessage.content,
      });
      
      console.log('✅ Received AI response:', response.substring(0, 100) + '...');
      console.log('✅ Full AI response length:', response.length);

      // Step 4: Replace thinking message with actual response
      const aiMessage: DebateMessage = {
        id: Date.now().toString(),
        sender: 'ai',
        content: response,
        timestamp: new Date(),
        wordCount: countWords(response),
      };

      setSession((prev) => ({
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === thinkingMessage.id ? aiMessage : msg
        ),
        currentTurn: 'user',
      }));

      // Step 5: Speak the response
      try {
        await speakText(response);
      } catch (speakError) {
        console.log('Error speaking text:', speakError);
      }

    } catch (error) {
      console.log('Error generating AI response:', error);
      
      // Step 4 (fallback): Replace thinking message with error message
      const errorAiMessage: DebateMessage = {
        id: Date.now().toString(),
        sender: 'ai',
        content: 'I apologize, but I encountered an error generating my response. Please try again.',
        timestamp: new Date(),
        wordCount: 0,
      };

      setSession((prev) => ({
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === thinkingMessage.id ? errorAiMessage : msg
        ),
        currentTurn: 'user',
      }));

      Alert.alert('Error', 'Failed to generate AI response. Please try again.');
    } finally {
      // Step 6: Always clear loading state
      setIsLoading(false);
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
              console.log('💾 Saving transcript...');
              console.log('📋 Session data:', endedSession);
              const filePath = await saveTranscript(endedSession);
              console.log('✅ Transcript saved to:', filePath);
              Alert.alert('Success', 'Debate transcript saved!');
              console.log('🧭 Navigating to Transcript screen...');
              navigation.navigate('Transcript', { session: endedSession });
            } catch (error) {
              console.error('❌ Error saving transcript:', error);
              console.error('❌ Error type:', typeof error);
              console.error('❌ Error message:', error?.message || 'Unknown error');
              Alert.alert('Error', 'Failed to save transcript, but you can still review it.');
              console.log('🧭 Navigating to Transcript screen despite error...');
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
