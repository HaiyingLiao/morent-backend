import express from 'express';

import RentedCarModel from '../models/rentedCar.js';
import { Car } from '../models/Car.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
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

    const currentCar = await Car.findById(carId);
    console.log(currentCar);
    const rentedDateTo = new Date(currentCar.rentedDateTo).getDate();
    const userPickUpDate = new Date(pickUpDate).getDate();

    if (rentedDateTo > userPickUpDate) {
      return res.json({
        error: true,
        message: 'This car is not available for rent',
      });
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

    const updatedCar = await currentCar.updateOne(
      carId,
      {
        rentedDateFrom: pickUpDate,
        rentedDateTo: dropOffDate,
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
