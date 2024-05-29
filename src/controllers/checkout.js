import dotenv from 'dotenv';
dotenv.config();

import stripe from 'stripe';

const stripeInit = stripe(process.env.STRIPE_PRIVATE_KEY);

export const checkout = async (req, res) => {
  try {
    const { data: rentData, carName, price, id, userId } = req.body;
    const { pickUpTime, dropOffDate, pickUpDate, dropOffTime } = rentData;

    const dropOffDateTime = new Date(dropOffDate.slice(0, 10));
    const [hours, minutes] = dropOffTime.split(':');
    const formattedHours = hours;
    const formattedMinutes = minutes;

    dropOffDateTime.setUTCHours(formattedHours);
    dropOffDateTime.setUTCMinutes(formattedMinutes);

    const pickUpDateTime = new Date(pickUpDate.slice(0, 10));
    const [hour, minute] = pickUpTime.split(':');
    const formattedHour = hour;
    const formattedMinute = minute;

    pickUpDateTime.setUTCHours(formattedHour);
    pickUpDateTime.setUTCMinutes(formattedMinute);

    const isGreaterThanPickUpTime = dropOffDateTime > pickUpDateTime;

    if (!isGreaterThanPickUpTime) {
      return res
        .status(400)
        .json({
          error: true,
          message:
            'Drop off date and time must be greater than pick up date and time',
        });
    }

    const customer = await stripeInit.customers.create({
      metadata: {
        data: JSON.stringify({
          rentData,
          userId: req.userId,
          price,
          carId: id,
          dropOffDateTimes: dropOffDateTime.toUTCString(),
          pickUpDateTimes: pickUpDateTime.toUTCString(),
          currentUser: req.userId,
        }),
      },
    });

    const session = await stripeInit.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: carName,
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      customer: customer.id,
      metadata: customer.metadata,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });

    res.send({ url: session.url }).end();
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: true, message: error.message });
  }
};
