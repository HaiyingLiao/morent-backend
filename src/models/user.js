import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: 1,
      maxLength: 100,
    },
    email: {
      type: String,
      required: true,
      minLength: 5,
      unique: true,
      maxLength: 100,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      maxLength: 12,
    },
    profileImage: {
      type: String,
    },
    profileBanner: {
      type: String,
    },
    address: {
      type: String,
      maxLength: 200,
    },
    favCars: [{ type: Schema.Types.ObjectId, ref: 'Car' }],
    rentedCars: [{ type: Schema.Types.ObjectId, ref: 'Car' }],
  },
  { timestamps: true }
);

export default model('User', userSchema);
