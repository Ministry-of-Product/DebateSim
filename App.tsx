import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootStackParamList } from './src/types';
import { TopicSelectionScreen } from './src/screens/TopicSelectionScreen';
import { DebateScreen } from './src/screens/DebateScreen';
import { TranscriptScreen } from './src/screens/TranscriptScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator
          initialRouteName="TopicSelection"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#007AFF',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen
            name="TopicSelection"
            component={TopicSelectionScreen}
            options={{
              title: 'DebateSim',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Debate"
            component={DebateScreen}
            options={{
              title: 'Debate',
              headerBackTitle: 'Back',
            }}
          />
          <Stack.Screen
            name="Transcript"
            component={TranscriptScreen}
            options={{
              title: 'Transcript',
              headerBackTitle: 'Back',
              headerLeft: () => null, // Prevent going back to active debate
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
