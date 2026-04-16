// File: src/routes/recommendation.routes.js

import express from 'express';
import { generateRecommendations } from '../controllers/recommendation.controller.js';

const router = express.Router();

// POST request ko handle karega /api/recommend par
router.post('/recommend', generateRecommendations);

export default router;