import { Schema, model } from 'mongoose';

const rentedCarSchema = new Schema(
  {
    carId: {
      type: Schema.Types.ObjectId,
      ref: 'Car',
      required: [true, 'Car Id is required'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User Id is required'],
    },
    location: {
      type: String,
      required: [true, 'Please add a location'],
    },
    pickUpDateTime: {
      type: Date,
      required: [true, 'Please add a pickup date and time'],
      validate: {
        validator: function (value) {
          const now = new Date();
          return value >= now;
        },
        message: 'Pickup date and time must not be in the past.',
      },
    },
    dropOffDateTime: {
      type: Date,
      required: [true, 'Please add a dropoff date and time'],
    },
  },
  {
    timestamps: true,
  }
);

export default model('RentedCar', rentedCarSchema);
