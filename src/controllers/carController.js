import { Car } from '../models/Car.js';
import User from '../models/user.js';
import rentedCar from '../models/rentedCar.js';

// create new car
export const createCar = async (req, res) => {
  if (req.files.length < 1) {
    return res
      .status(500)
      .json({ success: false, message: 'Failed to create. Try again' });
  }
  const files = req.files.map((file) => {
    const path = file.path.replaceAll('\\', '/');
    const imagePath = `${process.env.BASE_URL}/${path}`;
    return imagePath;
  });

  req.body.carImages = files;
  req.body.user = req.userId;

  try {
    const newCar = new Car(req.body);
    const savedCar = await newCar.save();
    res.status(201).json({
      success: true,
      message: 'Successfully created',
      data: savedCar,
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: 'Failed to create. Try again' });
  }
};

// get cars
export const getCars = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      location,
      type,
      availabilityFrom,
      availabilityTo,
      title,
    } = req.query;

    const capacity = parseInt(req.query.capacity);
    const price = parseInt(req.query.price);
    const currentDate = new Date();
    const regex = new RegExp(title, 'i');
    const types = new RegExp(type, 'i');

    let query = {
      ...(title && { title: regex }),
      ...(location && { carLocation: location }),
      ...(type && { carType: { $in: types } }),
      ...(price && { price: { $lte: price } }),
      ...(capacity && { capacity: { $in: capacity } }),
    };

    const availableCarsQuery = {
      _id: {
        $not: {
          $in: await rentedCar?.distinct('carId', {
            $or: [
              {
                pickUpDate: { $lte: new Date(availabilityTo || currentDate) },
                dropOffDate: {
                  $gte: new Date(availabilityFrom || currentDate),
                },
              },
            ],
          }),
        },
      },
    };

    if (availabilityFrom || availabilityTo) {
      query = { ...query, ...availableCarsQuery };
    }

    const totalCars = await Car.countDocuments(query);

    const cars = await Car.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    res.json({ cars, totalPages: Math.ceil(totalCars / pageSize) });
  } catch (error) {
    res.status(500).json({ error: 'Error searching for cars' });
  }
};

//delete a car
export const deleteCar = async (req, res) => {
  const userID = req.userId;
  const carId = req.params.id;

  try {
    const foundCar = await Car.findById(carId);

    if (foundCar.user.equals(userID)) {
      // delete the car in user favcars
      const user = await User.findOneAndUpdate(
        { _id: userID },
        { $pull: { favCars: carId } },
        { new: true }
      );
      // delete the car
      await Car.findByIdAndDelete(carId);
      res
        .status(200)
        .json({ success: true, message: 'Successfully deleted', data: user });
    } else {
      res
        .status(403)
        .json({ success: true, message: 'This car not belongs to this user' });
    }
  } catch (err) {
    console.log(err.message);
    res
      .status(500)
      .json({ success: false, message: 'Failed to deleted. Try again' });
  }
};

//update a car
export const updateCar = async (req, res) => {
  const userID = req.userId;
  const carId = req.params.id;

  const extractImageUrls = (formDataString) => {
    if (formDataString) {
      const urlArray = formDataString.split(',');
      const imageUrls = urlArray.map((url) => decodeURIComponent(url.trim()));
      return imageUrls;
    }
    return [];
  };

  const imagesArrayFromForm = extractImageUrls(req.body.carImages);

  try {
    const foundCar = await Car.findById(carId);
    let files = [];
    if (foundCar.user.equals(userID)) {
      if (req.files.length > 0) {
        files = req.files.map((file) => `${process.env.BASE_URL}/${file.path}`);
      }

      req.body.carImages = req.body.carImages
        ? [...imagesArrayFromForm, ...files]
        : files;

      const updatedCar = await Car.findByIdAndUpdate(carId, req.body, {
        new: true,
      });

      res.status(200).json({
        success: true,
        message: 'Successfully updated',
        data: updatedCar,
      });
    } else {
      res
        .status(403)
        .json({ success: true, message: 'This car not belongs to this user' });
    }
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: 'Failed to update. Try again' });
  }
};

// add fav cars
export const addFavCar = async (req, res) => {
  try {
    const userID = req.userId;
    const user = await User.findById(userID);

    const carId = req.body.carId;
    if (!user.favCars.includes(carId)) {
      user.favCars.unshift(carId);
    }
    await user.save();
    res.status(200).json({ favCars: user.favCars });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Internal server issue',
    });
  }
};

// get fav cars
export const getFavCars = async (req, res) => {
  const userID = req.userId;

  const page = req.query.page ? parseInt(req.query.page) : 1;
  const start = (page - 1) * 12;
  const end = page * 12;

  try {
    const user = await User.findById(userID).populate('favCars');
    const favCars = user.favCars;

    res.status(200).json({
      success: true,
      count: favCars.length,
      favCars: favCars.slice(start, end),
    });
  } catch (err) {
    res.status(404).json({ success: false, message: 'Not found' });
  }
};

// delete fav cars
export const deleteFavCarID = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.userId },
      { $pull: { favCars: req.body.carId } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Successfully removed a fav car',
      data: user,
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: 'Failed to detele. Try again' });
  }
};

// get popular cars
export const getPopularCars = async (req, res) => {
  try {
    const cars = await Car.find().sort({ rentedHistory: -1 }).limit(4);
    return res.json({
      error: false,
      message: 'Popular car data retrieved successfully.',
      data: cars,
    });
  } catch (error) {
    return res.json({
      error: true,
      message: 'Something went wrong, please try again later',
    });
  }
};

// get a single car
export const getSingleCar = async (req, res) => {
  const id = req.params.id;

  try {
    const car = await Car.findById(id);

    res
      .status(200)
      .json({ success: true, message: 'Successfully get a car', data: car });
  } catch (err) {
    res.status(404).json({ success: false, message: 'Not found' });
  }
};

export const getCarsByUser = async (req, res) => {
  try {
    if (!req.userId) return res.status(403).message('unauthorized');

    const cars = await Car.find().where('user', req.userId);

    return res.json({ error: false, message: 'Success', data: cars });
  } catch (error) {
    return res.json({
      error: true,
      message: 'Something went wrong when fetch data',
    });
  }
};
