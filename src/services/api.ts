import axios from 'axios';
import { DebateMessage, DebateSide } from '../types';

// TODO: Update this with your backend URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.45:3001';

console.log('🔧 API_BASE_URL:', API_BASE_URL);
console.log('🔧 EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);

// Configure axios with 30 second timeout for AI responses
const apiClient = axios.create({
  timeout: 30000, // 30 seconds timeout for AI responses
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
    console.log('🔧 API_BASE_URL:', API_BASE_URL);
    console.log('📋 Request payload:', { topic: params.topic, aiSide: params.aiSide, conversationHistory: params.conversationHistory.length, userMessage: params.userMessage });
    console.log('📋 Full request URL:', `${API_BASE_URL}/api/debate/generate`);
    console.log('📋 Conversation history:', params.conversationHistory.map((msg) => ({
      role: msg.sender === 'ai' ? 'assistant' : 'user',
      content: msg.content,
    })));

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
    console.log('📋 Response status:', response.status);
    console.log('📋 Response headers:', response.headers);
    console.log('📋 Response data:', response.data);
    console.log('📋 AI Response text:', response.data.response);
    console.log('📋 AI Response length:', response.data.response?.length || 0);
    console.log('📋 Response data type:', typeof response.data);
    console.log('📋 Response data keys:', Object.keys(response.data || {}));
    
    // Additional debugging
    if (!response.data) {
      console.log('❌ ERROR: response.data is undefined');
      throw new Error('No response data received from server');
    }
    if (!response.data.response) {
      console.log('❌ ERROR: response.data.response is undefined');
      console.log('❌ Available keys in response.data:', Object.keys(response.data));
      throw new Error('No response field in server response');
    }
    
    console.log('✅ Successfully extracted response:', response.data.response);
    return response.data.response;
  } catch (error) {
    console.log('❌ Error generating AI response:', error);
    console.log('❌ Error type:', typeof error);
    console.log('❌ Error constructor:', error?.constructor?.name);
    console.log('❌ Error message:', error?.message || 'No message');
    console.log('❌ Error stack:', error?.stack || 'No stack');
    console.log('❌ Full error object:', JSON.stringify(error, null, 2));
    
    if (error && typeof error === 'object' && 'code' in error) {
      console.log('❌ Error code:', error.code);
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out - AI response took too long');
      }
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to server - make sure backend is running');
      }
    }
    
    if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'status' in error.response) {
      console.log('❌ Server response status:', error.response.status);
      console.log('❌ Server response data:', error.response.data);
      throw new Error(`Server error: ${error.response.status}`);
    }
    
    // More specific error handling
    if (error && typeof error === 'object' && 'message' in error) {
      console.log('❌ Throwing specific error:', error.message);
      throw new Error(error.message);
    }
    
    console.log('❌ Throwing generic network error');
    throw new Error('Network error occurred');
  }
};

export const generateOpeningStatement = async (
  topic: string,
  aiSide: DebateSide
): Promise<string> => {
  try {
    console.log('🚀 Making API call to generate opening statement...');
    console.log('🔧 API_BASE_URL:', API_BASE_URL);
    console.log('📋 Request payload:', { topic, aiSide });
    console.log('📋 Full request URL:', `${API_BASE_URL}/api/debate/opening`);

    const response = await apiClient.post(`${API_BASE_URL}/api/debate/opening`, {
      topic,
      aiSide,
    });

    console.log('✅ Opening statement received successfully');
    console.log('📋 Response status:', response.status);
    console.log('📋 Response headers:', response.headers);
    console.log('📋 Response data:', response.data);
    console.log('📋 AI Response text:', response.data.response);
    console.log('📋 AI Response length:', response.data.response?.length || 0);
    console.log('📋 Response data type:', typeof response.data);
    console.log('📋 Response data keys:', Object.keys(response.data || {}));
    
    // Additional debugging
    if (!response.data) {
      console.log('❌ ERROR: response.data is undefined');
      throw new Error('No response data received from server');
    }
    if (!response.data.response) {
      console.log('❌ ERROR: response.data.response is undefined');
      console.log('❌ Available keys in response.data:', Object.keys(response.data));
      throw new Error('No response field in server response');
    }
    
    console.log('✅ Successfully extracted response:', response.data.response);
    return response.data.response;
  } catch (error) {
    console.log('❌ Error generating opening statement:', error);
    console.log('❌ Error type:', typeof error);
    console.log('❌ Error constructor:', error?.constructor?.name);
    console.log('❌ Error message:', error?.message || 'No message');
    console.log('❌ Error stack:', error?.stack || 'No stack');
    console.log('❌ Full error object:', JSON.stringify(error, null, 2));

    if (error && typeof error === 'object' && 'code' in error) {
      console.log('❌ Error code:', error.code);
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out - AI response took too long');
      }
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to server - make sure backend is running');
      }
    }
    
    if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'status' in error.response) {
      console.log('❌ Server response status:', error.response.status);
      console.log('❌ Server response data:', error.response.data);
      throw new Error(`Server error: ${error.response.status}`);
    }
    
    // More specific error handling
    if (error && typeof error === 'object' && 'message' in error) {
      console.log('❌ Throwing specific error:', error.message);
      throw new Error(error.message);
    }
    
    console.log('❌ Throwing generic network error');
    throw new Error('Network error occurred');
  }
};
