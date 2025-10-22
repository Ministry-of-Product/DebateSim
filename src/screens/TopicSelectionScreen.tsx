import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, DebateSide } from '../types';

type TopicSelectionScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'TopicSelection'
>;

interface Props {
  navigation: TopicSelectionScreenNavigationProp;
}

export const TopicSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const [topic, setTopic] = useState('');
  const [selectedSide, setSelectedSide] = useState<DebateSide | null>(null);

  const handleStartDebate = () => {
    if (topic.trim() && selectedSide) {
      navigation.navigate('Debate', {
        topic: topic.trim(),
        userSide: selectedSide,
      });
    }
  };

  const isFormValid = topic.trim().length > 0 && selectedSide !== null;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={styles.title}>DebateSim</Text>
            <Text style={styles.subtitle}>Practice your debating skills</Text>

            <View style={styles.section}>
              <Text style={styles.label}>Debate Topic</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter a debate question (e.g., 'Should AI be regulated?')"
                value={topic}
                onChangeText={setTopic}
                multiline
                numberOfLines={3}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Choose Your Position</Text>
              <View style={styles.sideButtons}>
                <TouchableOpacity
                  style={[
                    styles.sideButton,
                    selectedSide === 'for' && styles.sideButtonSelected,
                  ]}
                  onPress={() => setSelectedSide('for')}
                >
                  <Text
                    style={[
                      styles.sideButtonText,
                      selectedSide === 'for' && styles.sideButtonTextSelected,
                    ]}
                  >
                    For
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.sideButton,
                    selectedSide === 'against' && styles.sideButtonSelected,
                  ]}
                  onPress={() => setSelectedSide('against')}
                >
                  <Text
                    style={[
                      styles.sideButtonText,
                      selectedSide === 'against' && styles.sideButtonTextSelected,
                    ]}
                  >
                    Against
                  </Text>
                </TouchableOpacity>
              </View>

              {selectedSide && (
                <Text style={styles.hint}>
                  AI will argue {selectedSide === 'for' ? 'against' : 'for'} the topic
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.startButton, !isFormValid && styles.startButtonDisabled]}
              onPress={handleStartDebate}
              disabled={!isFormValid}
            >
              <Text style={styles.startButtonText}>Start Debate</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  section: {
    marginBottom: 30,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#DDD',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  sideButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  sideButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#DDD',
    alignItems: 'center',
  },
  sideButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  sideButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  sideButtonTextSelected: {
    color: 'white',
  },
  hint: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  startButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
  },
  startButtonDisabled: {
    backgroundColor: '#CCC',
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
});
