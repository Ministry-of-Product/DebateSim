import { Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-3-7-sonnet-20250219';
const MAX_TOKENS = 300; // Keep responses concise (roughly 200 words)

console.log('🔧 MODEL CONSTANT SET TO:', MODEL);

// Initialize Anthropic client with API key
const getAnthropicClient = () => {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
};

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const generateOpeningStatement = async (req: Request, res: Response) => {
  try {
    console.log('🎯 generateOpeningStatement called');
    console.log('📝 Request body:', JSON.stringify(req.body, null, 2));
    console.log('🔧 CURRENT MODEL BEING USED:', MODEL);
    
    const { topic, aiSide } = req.body;

    if (!topic || !aiSide) {
      console.log('❌ Missing required fields - topic:', topic, 'aiSide:', aiSide);
      return res.status(400).json({ error: 'Topic and aiSide are required' });
    }

    console.log('✅ Required fields present - topic:', topic, 'aiSide:', aiSide);

    const systemPrompt = `You are a skilled debater participating in a formal debate. You are arguing ${aiSide} the following topic: "${topic}".

Your task is to provide a concise opening statement (under 200 words) that:
1. Clearly states your position
2. Presents 2-3 key arguments
3. Is engaging and persuasive
4. Sets the tone for the debate

Remember: Be respectful, logical, and evidence-based. Keep it under 200 words.`;

    console.log('🤖 Creating Anthropic client...');
    const anthropic = getAnthropicClient();
    console.log('📋 Using model:', MODEL);
    console.log('🔑 API Key present:', !!process.env.ANTHROPIC_API_KEY);
    
    console.log('🚀 Making API call to Anthropic...');
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: 'Please provide your opening statement.',
        },
      ],
    });

    console.log('✅ API call successful');
    console.log('🔍 ACTUAL MODEL USED BY API:', message.model);
    console.log('🔍 Response ID:', message.id);

    const response = message.content[0].type === 'text' ? message.content[0].text : '';

    console.log('📤 Sending response to client');
    console.log('📋 Response length:', response.length);
    console.log('📋 Response preview:', response.substring(0, 100) + '...');
    console.log('📋 Full response object:', { response });
    
    try {
      res.json({ response });
      console.log('✅ Response sent successfully to client');
    } catch (sendError) {
      console.error('❌ Error sending response to client:', sendError);
      throw sendError;
    }
  } catch (error) {
    console.error('❌ Error generating opening statement:');
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Full error object:', JSON.stringify(error, null, 2));
    res.status(500).json({ error: 'Failed to generate opening statement' });
  }
};

export const generateDebateResponse = async (req: Request, res: Response) => {
  try {
    console.log('🎯 generateDebateResponse called');
    console.log('📝 Request body:', JSON.stringify(req.body, null, 2));
    
    const { topic, aiSide, conversationHistory, userMessage } = req.body;

    if (!topic || !aiSide || !userMessage) {
      console.log('❌ Missing required fields - topic:', topic, 'aiSide:', aiSide, 'userMessage:', userMessage);
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('✅ Required fields present for debate response');

    const systemPrompt = `You are a skilled debater participating in a formal debate. You are arguing ${aiSide} the following topic: "${topic}".

Your task is to:
1. Respond directly to your opponent's points
2. Present counter-arguments or rebuttals
3. Support your position with logic and reasoning
4. Maintain a respectful but firm tone
5. Keep your response under 200 words

Debate Guidelines:
- Address the opponent's specific arguments
- Use clear, logical reasoning
- Avoid personal attacks
- Stay focused on the topic
- Be persuasive but fair`;

    // Build conversation history
    const messages: ConversationMessage[] = [];

    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach((msg: ConversationMessage) => {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      });
    }

    // Add the latest user message
    messages.push({
      role: 'user',
      content: userMessage,
    });

    console.log('🤖 Creating Anthropic client for debate response...');
    const anthropic = getAnthropicClient();
    console.log('📋 Using model:', MODEL);
    console.log('🔑 API Key present:', !!process.env.ANTHROPIC_API_KEY);
    
    console.log('🚀 Making API call to Anthropic for debate response...');
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages,
    });

    console.log('✅ API call successful for debate response');
    console.log('🔍 ACTUAL MODEL USED BY API:', message.model);
    console.log('🔍 Response ID:', message.id);

    const response = message.content[0].type === 'text' ? message.content[0].text : '';

    console.log('📤 Sending debate response to client');
    console.log('📋 Response length:', response.length);
    console.log('📋 Response preview:', response.substring(0, 100) + '...');
    console.log('📋 Full response object:', { response });
    
    try {
      res.json({ response });
      console.log('✅ Debate response sent successfully to client');
    } catch (sendError) {
      console.error('❌ Error sending debate response to client:', sendError);
      throw sendError;
    }
  } catch (error) {
    console.error('❌ Error generating debate response:');
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Full error object:', JSON.stringify(error, null, 2));
    res.status(500).json({ error: 'Failed to generate debate response' });
  }
};
