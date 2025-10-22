import axios from 'axios';
import { DebateMessage, DebateSide } from '../types';

// TODO: Update this with your backend URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

export interface GenerateResponseParams {
  topic: string;
  aiSide: DebateSide;
  conversationHistory: DebateMessage[];
  userMessage: string;
}

export const generateAIResponse = async (
  params: GenerateResponseParams
): Promise<string> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/debate/generate`, {
      topic: params.topic,
      aiSide: params.aiSide,
      conversationHistory: params.conversationHistory.map((msg) => ({
        role: msg.sender === 'ai' ? 'assistant' : 'user',
        content: msg.content,
      })),
      userMessage: params.userMessage,
    });

    return response.data.response;
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw new Error('Failed to generate AI response');
  }
};

export const generateOpeningStatement = async (
  topic: string,
  aiSide: DebateSide
): Promise<string> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/debate/opening`, {
      topic,
      aiSide,
    });

    return response.data.response;
  } catch (error) {
    console.error('Error generating opening statement:', error);
    throw new Error('Failed to generate opening statement');
  }
};
