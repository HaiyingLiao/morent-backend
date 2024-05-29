import express from 'express';
import { authenticateUser } from '../middleware/auth.js';
import { checkout } from '../controllers/checkout.js';

const router = express.Router();

router.post('/checkout', authenticateUser, checkout);

export default router;
