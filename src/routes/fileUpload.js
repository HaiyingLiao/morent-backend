import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

import fileUploadMiddleware from '../middleware/fileUploadMiddleware.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.post(
  '/upload',
  authenticateUser,
  fileUploadMiddleware,
  async (req, res) => {
    const files = req.files.map(
      (file) => `${process.env.BASE_URL}/${file.path}`
    );

    res.json(files);
  }
);

export default router;
