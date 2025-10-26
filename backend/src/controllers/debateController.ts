import { Request, Response } from 'express';
import { generateAIResponse, getAIConfig, AIMessage } from '../services/aiService';

const AI_CONFIG = getAIConfig();
console.log('🔧 AI CONFIG LOADED:', AI_CONFIG);

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const generateOpeningStatement = async (req: Request, res: Response) => {
  try {
    console.log('🎯 generateOpeningStatement called');
    console.log('📝 Request body:', JSON.stringify(req.body, null, 2));
    console.log('🔧 CURRENT AI CONFIG:', AI_CONFIG);
    
    const { topic, aiSide } = req.body;

    if (!topic || !aiSide) {
      console.log('❌ Missing required fields - topic:', topic, 'aiSide:', aiSide);
      return res.status(400).json({ error: 'Topic and aiSide are required' });
    }

    console.log('✅ Required fields present - topic:', topic, 'aiSide:', aiSide);

    const systemPrompt = `You are a skilled debater participating in a formal debate. You are arguing ${aiSide} the following topic: "${topic}".

Your task is to provide a concise opening statement (under 280 characters, like a tweet) that:
1. Clearly states your position
2. Presents 1-2 key arguments
3. Is engaging and persuasive
4. Sets the tone for the debate

Remember: Be respectful, logical, and evidence-based. Keep it under 280 characters.`;

    const messages: AIMessage[] = [
      {
        role: 'user',
        content: `I need an opening statement for a debate on: "${topic}". I am arguing ${aiSide} this topic. Please provide a compelling opening statement that clearly states my position and presents strong arguments.`,
      },
    ];

    console.log('🚀 Making AI API call...');
    console.log('📋 System prompt length:', systemPrompt.length);
    console.log('📋 Messages count:', messages.length);

    const aiResponse = await generateAIResponse(systemPrompt, messages);

    console.log('✅ AI API call successful');
    console.log('🔍 Response ID:', aiResponse.id);
    console.log('🔍 Response model:', aiResponse.model);
    console.log('🔍 Response usage:', JSON.stringify(aiResponse.usage, null, 2));
    console.log('🔍 Response content length:', aiResponse.content.length);
    console.log('🔍 Response content:', aiResponse.content);

    console.log('📤 Sending response to client');
    console.log('📋 Response preview:', aiResponse.content.substring(0, 100) + '...');
    
    try {
      res.json({ response: aiResponse.content });
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
    console.log('🔧 CURRENT AI CONFIG:', AI_CONFIG);
    
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
5. Keep your response under 280 characters (like a tweet)

Debate Guidelines:
- Address the opponent's specific arguments
- Use clear, logical reasoning
- Avoid personal attacks
- Stay focused on the topic
- Be persuasive but fair`;

    // Build conversation history
    const messages: AIMessage[] = [];

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

    console.log('🚀 Making AI API call for debate response...');
    console.log('📋 System prompt length:', systemPrompt.length);
    console.log('📋 Messages count:', messages.length);
    console.log('📋 User message being sent to AI:', userMessage);
    console.log('📋 Full conversation history:', messages.map(msg => ({ role: msg.role, content: msg.content.substring(0, 100) + '...' })));

    const aiResponse = await generateAIResponse(systemPrompt, messages);

    console.log('✅ AI API call successful for debate response');
    console.log('🔍 Response ID:', aiResponse.id);
    console.log('🔍 Response model:', aiResponse.model);
    console.log('🔍 Response usage:', JSON.stringify(aiResponse.usage, null, 2));
    console.log('🔍 Response content length:', aiResponse.content.length);
    console.log('🔍 Response content:', aiResponse.content);

    console.log('📤 Sending debate response to client');
    console.log('📋 Response preview:', aiResponse.content.substring(0, 100) + '...');
    
    try {
      res.json({ response: aiResponse.content });
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
