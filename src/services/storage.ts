import * as FileSystem from 'expo-file-system';
import { DebateSession } from '../types';

const TRANSCRIPTS_DIR = `${FileSystem.documentDirectory}transcripts/`;

// Ensure the transcripts directory exists
const ensureDirectoryExists = async () => {
  const dirInfo = await FileSystem.getInfoAsync(TRANSCRIPTS_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(TRANSCRIPTS_DIR, { intermediates: true });
  }
};

export const saveTranscript = async (session: DebateSession): Promise<string> => {
  try {
    console.log('💾 Starting transcript save process...');
    console.log('📋 Session ID:', session.id);
    console.log('📋 Messages count:', session.messages.length);
    
    await ensureDirectoryExists();
    console.log('✅ Directory ensured');

    const fileName = `transcript_${session.id}_${Date.now()}.json`;
    const filePath = `${TRANSCRIPTS_DIR}${fileName}`;
    console.log('📋 File path:', filePath);

    const transcriptData = {
      ...session,
      messages: session.messages.map((msg) => ({
        ...msg,
        timestamp: msg.timestamp.toISOString(),
      })),
      startTime: session.startTime.toISOString(),
      endTime: session.endTime?.toISOString(),
    };

    console.log('📋 Transcript data prepared, writing to file...');
    await FileSystem.writeAsStringAsync(
      filePath,
      JSON.stringify(transcriptData, null, 2)
    );
    console.log('✅ File written successfully');

    return filePath;
  } catch (error) {
    console.error('❌ Error saving transcript:', error);
    console.error('❌ Error type:', typeof error);
    console.error('❌ Error message:', error?.message || 'Unknown error');
    console.error('❌ Error stack:', error?.stack || 'No stack trace');
    throw new Error(`Failed to save transcript: ${error?.message || 'Unknown error'}`);
  }
};

export const loadTranscript = async (fileName: string): Promise<DebateSession> => {
  try {
    const filePath = `${TRANSCRIPTS_DIR}${fileName}`;
    const content = await FileSystem.readAsStringAsync(filePath);
    const data = JSON.parse(content);

    return {
      ...data,
      messages: data.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })),
      startTime: new Date(data.startTime),
      endTime: data.endTime ? new Date(data.endTime) : undefined,
    };
  } catch (error) {
    console.error('Error loading transcript:', error);
    throw new Error('Failed to load transcript');
  }
};

export const getAllTranscripts = async (): Promise<string[]> => {
  try {
    await ensureDirectoryExists();
    const files = await FileSystem.readDirectoryAsync(TRANSCRIPTS_DIR);
    return files.filter((file) => file.endsWith('.json'));
  } catch (error) {
    console.error('Error getting transcripts:', error);
    return [];
  }
};
