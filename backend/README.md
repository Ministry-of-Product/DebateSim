# DebateSim Backend

Node.js/Express backend for the DebateSim application, providing LLM-powered debate responses using Claude.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Add your Anthropic API key to `.env`:
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   ```

## Development

Start the development server with hot reload:
```bash
npm run dev
```

## Production

Build the TypeScript code:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## API Endpoints

### POST /api/debate/opening
Generate an AI opening statement for a debate.

**Request Body:**
```json
{
  "topic": "Should AI be regulated?",
  "aiSide": "for"
}
```

**Response:**
```json
{
  "response": "Opening statement text..."
}
```

### POST /api/debate/generate
Generate an AI response during a debate.

**Request Body:**
```json
{
  "topic": "Should AI be regulated?",
  "aiSide": "for",
  "conversationHistory": [
    {"role": "assistant", "content": "Opening statement..."},
    {"role": "user", "content": "User's first argument..."}
  ],
  "userMessage": "Latest user message..."
}
```

**Response:**
```json
{
  "response": "AI's response text..."
}
```

## Environment Variables

- `PORT`: Server port (default: 3001)
- `ANTHROPIC_API_KEY`: Your Anthropic API key (required)
