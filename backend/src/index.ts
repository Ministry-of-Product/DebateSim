import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import debateRoutes from './routes/debate';

dotenv.config();

console.log('🔧 Environment variables loaded:');
console.log('📋 PORT:', process.env.PORT || 3001);
console.log('🔑 ANTHROPIC_API_KEY present:', !!process.env.ANTHROPIC_API_KEY);
console.log('🔑 API Key starts with sk-:', process.env.ANTHROPIC_API_KEY?.startsWith('sk-') || false);

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Middleware - Allow all origins for development
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json());

// Routes
app.use('/api/debate', debateRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'DebateSim backend is running' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📝 API endpoints available at http://0.0.0.0:${PORT}/api/debate`);
  console.log(`📱 Mobile access: http://192.168.1.45:${PORT}/api/debate`);
});

export default app;
