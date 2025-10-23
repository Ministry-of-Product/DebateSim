import axios from 'axios';
import { DebateMessage, DebateSide } from '../types';

// TODO: Update this with your backend URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.39:3001';

console.log('🔧 API_BASE_URL:', API_BASE_URL);
console.log('🔧 EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);

// Configure axios with 5 second timeout for AI responses
const apiClient = axios.create({
  timeout: 5000, // 5 seconds timeout for AI responses
  headers: {
    'Content-Type': 'application/json',
  },
});

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
    console.log('🚀 Making API call to generate AI response...');
    const response = await apiClient.post(`${API_BASE_URL}/api/debate/generate`, {
      topic: params.topic,
      aiSide: params.aiSide,
      conversationHistory: params.conversationHistory.map((msg) => ({
        role: msg.sender === 'ai' ? 'assistant' : 'user',
        content: msg.content,
      })),
      userMessage: params.userMessage,
    });

    console.log('✅ AI response received successfully');
    return response.data.response;
  } catch (error: any) {
    console.error('❌ Error generating AI response:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out - AI response took too long');
    }
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Cannot connect to server - make sure backend is running');
    }
    if (error.response?.status) {
      throw new Error(`Server error: ${error.response.status} - ${error.response.statusText}`);
    }
    throw new Error(`Network error: ${error.message}`);
  }
};

export const generateOpeningStatement = async (
  topic: string,
  aiSide: DebateSide
): Promise<string> => {
  try {
    console.log('🚀 Making API call to generate opening statement...');
    const response = await apiClient.post(`${API_BASE_URL}/api/debate/opening`, {
      topic,
      aiSide,
    });

    console.log('✅ Opening statement received successfully');
    return response.data.response;
  } catch (error: any) {
    console.error('❌ Error generating opening statement:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out - AI response took too long');
    }
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Cannot connect to server - make sure backend is running');
    }
    if (error.response?.status) {
      throw new Error(`Server error: ${error.response.status} - ${error.response.statusText}`);
    }
    throw new Error(`Network error: ${error.message}`);
  }
};
