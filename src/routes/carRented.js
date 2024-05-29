import express from 'express';

import { authenticateUser } from '../middleware/auth.js';
import RentedCarModel from '../models/rentedCar.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const {
    location,
    pickUpDate,
    pickUpTime,
    dropOffDate,
    dropOffTime,
    carId,
    userId,
  } = req.body;

  if (
    !location ||
    !pickUpDate ||
    !pickUpTime ||
    !dropOffDate ||
    !dropOffTime ||
    !carId ||
    !userId
  ) {
    return res.json({ error: true, message: 'All fields required' });
  }

  const newRentedCar = await RentedCarModel.create({
    location,
    pickUpTime,
    dropOffTime,
    pickUpDate,
    dropOffDate,
    carId,
    userId,
  });

  res.status(201).json({
    message: 'Rented Car Created',
    success: true,
    rentedCar: newRentedCar,
  });

  try {
  } catch (error) {
    res.json({ error: true, message: error.message });
  }
});

export default router;
