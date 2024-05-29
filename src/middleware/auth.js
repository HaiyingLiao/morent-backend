import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';

export const authenticateUser = (req, res, next) => {
  const token = req.cookies.accesstoken;

  if (!token) {
    res.status(401).json({ message: 'Not authorized' });
  } else {
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      req.userId = decoded.id;

      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized' });
    }
  }
};
