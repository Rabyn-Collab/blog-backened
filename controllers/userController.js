import bcrypt from 'bcrypt';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import Blog from '../models/Blog.js';



export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    return res.status(200).json(user);
  } catch (err) {
    return res.status(400).json({
      message: err.message
    });
  }
}

export const updateUser = async (req, res) => {
  const { fullname, email } = req.body || {};
  try {

    const isExist = await User.findById(req.userId);

    isExist.fullname = fullname || isExist.fullname;
    isExist.email = email || isExist.email;
    if (req.imagePath) {
      fs.unlink(`./uploads/${isExist.image}`, async (err) => {
        if (err) {
          return res.status(500).json({
            message: err.message
          });
        }
        isExist.image = req.imagePath;
        await isExist.save();
      })

    } else {
      await isExist.save();
    }


    return res.status(200).json({ message: "User updated" });
  } catch (err) {

    if (req.imagePath) {
      fs.unlink(`./uploads/${req.imagePath}`, (imageErr) => {
        if (imageErr) {
          return res.status(500).json({
            message: err.message
          });
        }
      });
    } else {
      return res.status(400).json({
        message: err.message
      });
    }

  }
}



export const login = async (req, res) => {
  const { email, password } = req.body || {};

  try {

    const isExist = await User.findOne({ email });
    if (!isExist) return res.status(404).json({ message: "User not found" });

    const passCheck = bcrypt.compareSync(password, isExist.password);
    if (!passCheck) return res.status(401).json({ message: "Invalid Credential" });


    const token = jwt.sign({
      id: isExist._id
    }, 'secret');

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: true, // required for sameSite: 'none'
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000,
    });


    return res.status(200).json({
      token,
      id: isExist._id
    });


  } catch (err) {

    return res.status(400).json({
      message: err.message
    });

  }

}


export const register = async (req, res) => {
  const { email, fullname, password } = req.body || {};
  try {

    const isExist = await User.findOne({ email });
    if (isExist) {
      return res.status(409).json({ message: "User already exists" });
    }
    const hashPass = bcrypt.hashSync(password, 10);
    await User.create({
      fullname,
      email,
      password: hashPass,
    });
    return res.status(201).json({ message: "User created" });
  } catch (err) {
    return res.status(400).json({ message: err.message });


  }
}


export const getUserBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ user: req.userId }).populate('user', 'fullname email');
    return res.status(200).json(blogs);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}