import bcrypt from 'bcrypt';

import UserModel from '../models/user.js';
import {
  deleteCookie,
  generateToken,
  sendCookie,
} from '../utils/token.utils.js';

const ACCESS_TOKEN_KEY = 'accesstoken';
const REFRESH_TOKEN_KEY = 'refreshtoken';

// User Signup
export const signup = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const oldUser = await UserModel.findOne({ email });

    if (oldUser)
      return res.status(400).json({
        message: 'User already exists',
        email: email,
        success: false,
      });

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await UserModel.create({
      name: `${firstName} ${lastName}`,
      email,
      password: hashedPassword,
    });

    const accessToken = generateToken({
      payload: { email: newUser.email, id: newUser._id },
      tokenSecret: process.env.ACCESS_TOKEN_SECRET,
      expiresIn: '10h',
    });

    const refreshToken = generateToken({
      payload: { email: newUser.email, id: newUser._id },
      tokenSecret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: '10h',
    });

    sendCookie({ res, name: ACCESS_TOKEN_KEY, token: accessToken });
    sendCookie({ res, name: REFRESH_TOKEN_KEY, token: refreshToken });

    res.status(201).json({
      message: 'User created',
      success: true,
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', success: false });
  }
};

// User Signin
export const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const oldUser = await UserModel.findOne({ email });

    if (!oldUser)
      return res
        .status(404)
        .json({ message: "User doesn't exist", email, success: false });

    const isPasswordCorrect = await bcrypt.compare(password, oldUser.password);

    if (!isPasswordCorrect)
      return res
        .status(400)
        .json({ message: 'Invalid credentials', email, success: false });

    const accessToken = generateToken({
      payload: {
        email: oldUser.email,
        id: oldUser._id,
      },
      tokenSecret: process.env.ACCESS_TOKEN_SECRET,
      expiresIn: '10h',
    });

    const refreshToken = generateToken({
      payload: {
        email: oldUser.email,
        id: oldUser._id,
      },
      tokenSecret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: '10h',
    });

    sendCookie({ res, name: ACCESS_TOKEN_KEY, token: accessToken });
    sendCookie({ res, name: REFRESH_TOKEN_KEY, token: refreshToken });

    res.status(200).json({
      message: 'Successfully logged in',
      success: true,
      userId: oldUser.id,
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: 'Something went wrong', success: false });
  }
};

// User Logout
export const logout = (req, res) => {
  try {
    deleteCookie({ res, name: ACCESS_TOKEN_KEY });
    deleteCookie({ res, name: REFRESH_TOKEN_KEY });
    res.status(200).json({ message: `Successfully logged out`, success: true });
  } catch (error) {
    res
      .status(500)
      .json({ error: 'An error occurred during logout', success: false });
  }
};

// Update user
export const updateUser = async (req, res) => {
  const { firstName, lastName, phoneNumber, address, profileImage } = req.body;

  const files = req.files.map((file) => `${process.env.BASE_URL}/${file.path}`);

  const userId = req.userId;

  const updatedUserData = {
    name: `${firstName} ${lastName}`,
    phoneNumber,
    address,
    profileImage: files ? files[0] : profileImage,
  };

  try {
    const userData = await UserModel.findById(userId);

    if (!userData) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    const user = await UserModel.findByIdAndUpdate(userId, updatedUserData, {
      new: true,
    });

    return res.status(200).json({
      message: 'User updated successfully',
      user: user,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

export const showCurrentUser = async (req, res) => {
  res.status(200).json({ userId: req.userId });
};

// remove delete car also, using daleteMany where userId = id
// find a car by userId
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  try {
    const user = await UserModel.findById(id);
    if (!user) {
      return res.send({ message: 'No user found' });
    }

    if (user.id === id) {
      let deletedCars = await Car.deleteMany({ user: userId });
      const deletedUser = await UserModel.findByIdAndDelete(user.id);
      return res.send({
        message: 'User deleted',
        deletedUser,
        deletedCars,
      });
    } else {
      return res
        .send(403)
        .json({ message: 'delete user does not belong to logged in user' });
    }
  } catch (error) {
    return res.status(500).json({
      message: 'Internal Server Error',
    });
  }
};

export const viewUsers = async (req, res) => {
  try {
    const allUsers = await UserModel.find();
    if (!allUsers) {
      return res.json({ message: 'No user existed', allUsers: [] });
    }

    return res.send(allUsers);
  } catch (error) {
    res.status(500).json({ Error: 'some internal error' });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId).populate('rentedCars');

    if (!user)
      return res.json({
        error: true,
        message: 'We can not find that user!',
      });

    const toObj = user.toObject();
    const { password, ...rest } = toObj;

    return res.json(rest);
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};
