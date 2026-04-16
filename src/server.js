// File: src/server.js

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import recommendationRoutes from './routes/recommendation.routes.js'; // <-- NEW IMPORT

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Basic Health Check Route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'active', message: 'TravelGenieAi Backend is running smoothly.' });
});

// APIs Routes <-- NEW ROUTE MOUNTED HERE
app.use('/api', recommendationRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Server fired up and running on http://localhost:${PORT}`);
});