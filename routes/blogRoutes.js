import express from "express";
import mongoose from "mongoose";
import { fileCheck, updateFileCheck } from "../middlewares/filecheck.js";
import { createBlog, deleteBlog, getBlog, getBlogs, updateBlog } from "../controllers/blogController.js";
import { notAllowed } from "../utils/notAllowed.js";
import { checkUser } from "../middlewares/checkUser.js";

const router = express.Router();


router.route('/').get(getBlogs).post(checkUser, fileCheck, createBlog).all(notAllowed);


router.param('id', (req, res, next, id) => {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid ID' });
  }
  req.id = id;
  next();
});

router.route('/:id').get(getBlog).patch(checkUser, updateFileCheck, updateBlog).delete(checkUser, deleteBlog).all(notAllowed);






export default router;