export type DebateSide = 'for' | 'against';

export type MessageSender = 'user' | 'ai';

export interface DebateMessage {
  id: string;
  sender: MessageSender;
  content: string;
  timestamp: Date;
  wordCount: number;
}

export interface DebateSession {
  id: string;
  topic: string;
  userSide: DebateSide;
  aiSide: DebateSide;
  messages: DebateMessage[];
  currentTurn: MessageSender;
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
}

export type RootStackParamList = {
  TopicSelection: undefined;
  Debate: {
    topic: string;
    userSide: DebateSide;
  };
  Transcript: {
    session: DebateSession;
  };
};
