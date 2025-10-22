import * as Speech from 'expo-speech';

export const speakText = async (text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    Speech.speak(text, {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.9,
      onDone: () => resolve(),
      onError: (error) => {
        console.error('Speech error:', error);
        reject(error);
      },
    });
  });
};

export const stopSpeaking = () => {
  Speech.stop();
};

export const isSpeaking = async (): Promise<boolean> => {
  return await Speech.isSpeakingAsync();
};
