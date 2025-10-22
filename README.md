# DebateSim

A React Native/Expo mobile application that helps users practice debating skills through AI-powered debates using Claude.

## Features

### Topic & Side Selection
- Enter any debate question or topic
- Choose your position (for or against)
- AI automatically takes the opposite side
- Quick, seamless setup

### Turn-Based Debate
- Organized turn-taking with the AI opponent
- Clear indication of whose turn it is
- 200-word limit for concise arguments
- Real-time word counter with visual feedback
- Warnings for responses exceeding the limit
- Voice input support (speak your arguments)
- Text-to-speech for AI responses
- End debate at any time

### Transcript Management
- Real-time display of the full debate
- Clear attribution (You vs AI Opponent)
- Timestamps for each message
- Review entire debate after completion
- Auto-save transcripts
- Share transcripts

## Tech Stack

### Frontend
- **React Native** with **Expo** for cross-platform development
- **TypeScript** for type safety
- **React Navigation** for screen navigation
- **Expo Speech** for text-to-speech
- **Expo File System** for transcript storage

### Backend
- **Node.js** with **Express**
- **TypeScript**
- **Anthropic Claude API** for AI debate responses
- **CORS** enabled for mobile app access

## Project Structure

```
DebateSim/
├── src/
│   ├── screens/
│   │   ├── TopicSelectionScreen.tsx  # Topic and side selection
│   │   ├── DebateScreen.tsx          # Main debate interface
│   │   └── TranscriptScreen.tsx      # Debate review and sharing
│   ├── components/
│   │   ├── WordCounter.tsx           # Word count display
│   │   └── DebateMessageItem.tsx     # Message bubble component
│   ├── services/
│   │   ├── api.ts                    # Backend API client
│   │   ├── speech.ts                 # Text-to-speech service
│   │   └── storage.ts                # Transcript storage
│   ├── types/
│   │   └── index.ts                  # TypeScript type definitions
│   └── utils/
│       └── wordCounter.ts            # Word counting utilities
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── debateController.ts   # Debate logic
│   │   ├── routes/
│   │   │   └── debate.ts             # API routes
│   │   └── index.ts                  # Express server
│   └── README.md                     # Backend documentation
├── App.tsx                           # Main app component with navigation
└── package.json

```

## Setup Instructions

### Prerequisites
- Node.js (v16 or later)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Anthropic API key ([Get one here](https://console.anthropic.com/))

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Add your Anthropic API key to `.env`:
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   PORT=3001
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```

   The server will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to the root directory:
   ```bash
   cd ..
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Configure the API URL:
   - Create a `.env` file in the root directory
   - Add: `EXPO_PUBLIC_API_URL=http://localhost:3001`
   - For physical devices, use your computer's local IP address instead of localhost

4. Start the Expo development server:
   ```bash
   npm start
   ```

5. Run the app:
   - **iOS Simulator**: Press `i`
   - **Android Emulator**: Press `a`
   - **Physical Device**: Scan the QR code with Expo Go app

## Usage

1. **Start a Debate**
   - Enter a debate topic or question
   - Choose your position (for or against)
   - Tap "Start Debate"

2. **Debate**
   - AI provides an opening statement (spoken aloud)
   - Type or speak your response (max 200 words)
   - Watch the word counter as you type
   - Send your argument
   - AI responds with a counter-argument
   - Continue back-and-forth

3. **End & Review**
   - Tap "End Debate" when finished
   - Review the full transcript with timestamps
   - Share the transcript if desired
   - Start a new debate

## Development

### Frontend Development
```bash
npm start          # Start Expo dev server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web
```

### Backend Development
```bash
cd backend
npm run dev        # Start with hot reload
npm run build      # Build TypeScript
npm start          # Run production build
```

## Future Enhancements

- [ ] Voice-to-text for speech input (currently supports text-to-speech only)
- [ ] Debate scoring and feedback
- [ ] Multiple debate formats (Oxford, Lincoln-Douglas, etc.)
- [ ] Adjustable word limits
- [ ] Debate history and statistics
- [ ] User accounts and profile
- [ ] Topic suggestions and categories
- [ ] Multi-round tournament mode
- [ ] Share debates on social media

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

## Acknowledgments

- Built with [Expo](https://expo.dev/)
- Powered by [Anthropic Claude](https://www.anthropic.com/)
- React Native community for excellent tooling and support
