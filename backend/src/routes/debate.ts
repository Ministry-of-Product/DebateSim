import { Router } from 'express';
import { generateOpeningStatement, generateDebateResponse } from '../controllers/debateController';

const router = Router();

// Generate AI opening statement
router.post('/opening', generateOpeningStatement);

// Generate AI debate response
router.post('/generate', generateDebateResponse);

export default router;
