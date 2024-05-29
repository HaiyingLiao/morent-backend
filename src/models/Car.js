import { Schema, model } from 'mongoose';

const carSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
    },
    carType: {
      type: String,
      required: [true, 'Please add a type'],
    },
    description: {
      type: String,
      required: [true, 'Please add description'],
      minlength: 30,
      maxLength: 300,
    },
    capacity: {
      type: Number,
      required: [true, 'Please add capacity'],
      min: 1,
      max: 12,
    },
    fuelTankSize: {
      type: Number,
      required: [true, 'Please add fuel tank size'],
      min: 10,
      max: 200,
    },
    transmissionType: {
      type: String,
      required: [true, 'Please add transmission type'],
    },
    price: {
      type: Number,
      validate: {
        validator: function (value) {
          return value % 1 === 0;
        },
        message: 'The field must be a whole number without decimals.',
      },
      min: 10,
      required: [true, 'Please add price'],
    },
    discountPrice: {
      type: Number,
      validate: {
        validator: function (value) {
          return value % 1 === 0;
        },
        message: 'The field must be a whole number without decimals.',
      },
    },
    carLocation: {
      type: String,
      required: [true, 'Please add location'],
      minlength: 2,
      maxLength: 200,
    },
    carImages: {
      required: [true, 'Please add car images'],
      type: [String],
      validate: (v) => Array.isArray(v) && v.length > 0 && v.length < 4,
    },

    //pick up date
    rentedDateFrom: {
      type: String,
      // validate: {
      //   validator: function (value) {
      //     // Get the current date
      //     const now = new Date();
      //     // Set the current date to midnight (beginning of the day)
      //     now.setHours(0, 0, 0, 0);
      //     // Add 30 days to the current date
      //     const thirtyDaysFromNow = new Date(
      //       now.getTime() + 30 * 24 * 60 * 60 * 1000
      //     );
      //     // Return true if the given date is greater than or equal to thirtyDaysFromNow
      //     return value >= thirtyDaysFromNow;
      //   },
      // },
    },

    //drop off date
    rentedDateTo: {
      type: String,
      // validate: {
      //   validator: function (value) {
      //     const startDate = new Date();
      //     startDate.setDate(startDate.getDate() + 1);
      //     const endDate = new Date(startDate);
      //     endDate.setMonth(endDate.getMonth() + 1);
      //     return value >= startDate && value <= endDate;
      //   },
      //   message: 'The date must be between today and one month from today.',
      // },
    },
    numberOfTimesRented: {
      type: Number,
    },
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export const Car = model('Car', carSchema);
