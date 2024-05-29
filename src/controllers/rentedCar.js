import express from 'express';

import RentedCarModel from '../models/rentedCar.js';
import { Car } from '../models/Car.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateUser, async (req, res) => {
  try {
    const { location, pickUpDateTime, dropOffDateTime, carId, userId } =
      req.body;

    if (!location || !pickUpDateTime || !dropOffDateTime || !carId || !userId) {
      return res.json({ error: true, message: 'All fields required' });
    }

    const currentCar = await Car.findById(carId);
    const rentedDateTo = new Date(currentCar.rentedDateTo).getDate();
    const userPickUpDate = new Date(pickUpDateTime).getDate();

    if (rentedDateTo > userPickUpDate) {
      return res.json({
        error: true,
        message: 'This car is not available for rent',
      });
    }

    const newRentedCar = await RentedCarModel.create({
      location,
      pickUpDateTime,
      dropOffDateTime,
      carId,
      userId,
    });

    const updatedCar = await currentCar.updateOne(
      carId,
      {
        rentedDateFrom: pickUpDateTime,
        rentedDateTo: dropOffDateTime,
        $inc: { numberOfTimesRented: 1 },
      },
      {
        new: true,
      }
    );

    res.status(201).json({
      message: 'Rented Car Created',
      success: true,
      rentedCar: newRentedCar,
      updatedCar,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(
        (err) => err.message
      );
      const errorMessage = errorMessages.join(', ');
      res.json({ error: true, message: errorMessage });
    } else {
      res.json({ error: true, message: error.message });
    }
  }
});

export default router;
