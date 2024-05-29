import dotenv from 'dotenv';
dotenv.config();

import { raw, Router } from 'express';
import Stripe from 'stripe';
import RentedCarModel from '../models/rentedCar.js';
import { Car } from '../models/Car.js';
import User from '../models/user.js';

const router = Router();
const stripeInit = new Stripe(process.env.STRIPE_PRIVATE_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post('/', raw({ type: 'application/json' }), async (req, res) => {
  let event;

  try {
    const signature = req.headers['stripe-signature'];
    const rawBody = req.rawBody.toString();
    event = stripeInit.webhooks.constructEvent(
      rawBody,
      signature,
      endpointSecret
    );
  } catch (err) {
    console.log(`⚠️  Webhook signature verification failed.`, err.message);
    return res.sendStatus(400);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object.metadata;
    const datas = JSON.parse(session.data);
    const {
      rentData: { location },
      price,
      carId,
      userId,
      dropOffDateTimes,
      pickUpDateTimes,
      currentUser,
    } = datas;

    await RentedCarModel.create({
      location,
      pickUpDateTime: dropOffDateTimes,
      dropOffDateTime: pickUpDateTimes,
      carId,
      userId,
    });
    await Car.findByIdAndUpdate(carId, {
      rentedDateFrom: pickUpDateTimes,
      rentedDateTo: dropOffDateTimes,
      $inc: { numberOfTimesRented: 1 },
    });
    await User.findByIdAndUpdate(currentUser, {
      rentedCars: carId,
    });
  }
  res.status(200).end();
});

export default router;
