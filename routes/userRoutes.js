import express from "express";
import { register, login, getUserBlogs } from "../controllers/userController.js";
import { notAllowed } from "../utils/notAllowed.js";
import { checkUser } from "../middlewares/checkUser.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.route("/blogs").get(checkUser, getUserBlogs).all(notAllowed);

export default router;