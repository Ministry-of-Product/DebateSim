import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

export type AIProvider = 'anthropic' | 'openai';

export interface AIConfig {
  provider: AIProvider;
  model: string;
  maxTokens: number;
}

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    total_tokens?: number;
  };
  model: string;
  id: string;
}

// Configuration
const AI_CONFIG: AIConfig = {
  provider: (process.env.AI_PROVIDER as AIProvider) || 'anthropic',
  model: process.env.AI_MODEL || 'claude-3-7-sonnet-20250219',
  maxTokens: parseInt(process.env.AI_MAX_TOKENS || '1000'),
};

console.log('🔧 AI Configuration:', AI_CONFIG);

// Anthropic client
const getAnthropicClient = () => {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set');
  }
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
};

// OpenAI client
const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
};

export const generateAIResponse = async (
  systemPrompt: string,
  messages: AIMessage[]
): Promise<AIResponse> => {
  console.log('🤖 Generating AI response with provider:', AI_CONFIG.provider);
  console.log('📋 Model:', AI_CONFIG.model);
  console.log('📋 Max tokens:', AI_CONFIG.maxTokens);
  console.log('📋 Messages count:', messages.length);

  const startTime = Date.now();

  try {
    if (AI_CONFIG.provider === 'anthropic') {
      return await generateAnthropicResponse(systemPrompt, messages);
    } else if (AI_CONFIG.provider === 'openai') {
      return await generateOpenAIResponse(systemPrompt, messages);
    } else {
      throw new Error(`Unsupported AI provider: ${AI_CONFIG.provider}`);
    }
  } finally {
    const endTime = Date.now();
    console.log('⏱️ Total AI response time:', endTime - startTime, 'ms');
  }
};

const generateAnthropicResponse = async (
  systemPrompt: string,
  messages: AIMessage[]
): Promise<AIResponse> => {
  console.log('🔵 Using Anthropic API...');
  
  const anthropic = getAnthropicClient();
  
  // Convert messages to Anthropic format
  const anthropicMessages = messages.map(msg => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
  }));

  const requestPayload = {
    model: AI_CONFIG.model,
    max_tokens: AI_CONFIG.maxTokens,
    system: systemPrompt,
    messages: anthropicMessages,
  };

  console.log('📋 Anthropic request payload:', JSON.stringify(requestPayload, null, 2));

  const response = await anthropic.messages.create(requestPayload);

  console.log('✅ Anthropic API call successful');
  console.log('🔍 Response ID:', response.id);
  console.log('🔍 Response model:', response.model);
  console.log('🔍 Response usage:', JSON.stringify(response.usage, null, 2));

  const content = response.content[0].type === 'text' ? response.content[0].text : '';

  return {
    content,
    usage: response.usage,
    model: response.model,
    id: response.id,
  };
};

const generateOpenAIResponse = async (
  systemPrompt: string,
  messages: AIMessage[]
): Promise<AIResponse> => {
  console.log('🟢 Using OpenAI API...');
  
  const openai = getOpenAIClient();
  
  // Convert messages to OpenAI format
  const openaiMessages = [
    { role: 'system' as const, content: systemPrompt },
    ...messages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
  ];

  const requestPayload = {
    model: AI_CONFIG.model,
    max_tokens: AI_CONFIG.maxTokens,
    messages: openaiMessages,
  };

  console.log('📋 OpenAI request payload:', JSON.stringify(requestPayload, null, 2));

  const response = await openai.chat.completions.create(requestPayload);

  console.log('✅ OpenAI API call successful');
  console.log('🔍 Response ID:', response.id);
  console.log('🔍 Response model:', response.model);
  console.log('🔍 Response usage:', JSON.stringify(response.usage, null, 2));

  const content = response.choices[0]?.message?.content || '';

  return {
    content,
    usage: response.usage,
    model: response.model,
    id: response.id,
  };
};

export const getAIConfig = (): AIConfig => AI_CONFIG;

