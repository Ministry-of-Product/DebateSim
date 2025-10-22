import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import debateRoutes from './routes/debate';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/debate', debateRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'DebateSim backend is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 API endpoints available at http://localhost:${PORT}/api/debate`);
});

export default app;
