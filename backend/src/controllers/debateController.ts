import { Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = 'claude-3-5-sonnet-20241022';
const MAX_TOKENS = 300; // Keep responses concise (roughly 200 words)

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const generateOpeningStatement = async (req: Request, res: Response) => {
  try {
    const { topic, aiSide } = req.body;

    if (!topic || !aiSide) {
      return res.status(400).json({ error: 'Topic and aiSide are required' });
    }

    const systemPrompt = `You are a skilled debater participating in a formal debate. You are arguing ${aiSide} the following topic: "${topic}".

Your task is to provide a concise opening statement (under 200 words) that:
1. Clearly states your position
2. Presents 2-3 key arguments
3. Is engaging and persuasive
4. Sets the tone for the debate

Remember: Be respectful, logical, and evidence-based. Keep it under 200 words.`;

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

    const response = message.content[0].type === 'text' ? message.content[0].text : '';

    res.json({ response });
  } catch (error) {
    console.error('Error generating opening statement:', error);
    res.status(500).json({ error: 'Failed to generate opening statement' });
  }
};

export const generateDebateResponse = async (req: Request, res: Response) => {
  try {
    const { topic, aiSide, conversationHistory, userMessage } = req.body;

    if (!topic || !aiSide || !userMessage) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

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

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages,
    });

    const response = message.content[0].type === 'text' ? message.content[0].text : '';

    res.json({ response });
  } catch (error) {
    console.error('Error generating debate response:', error);
    res.status(500).json({ error: 'Failed to generate debate response' });
  }
};
