const express = require("express");
const userRouter = express.Router();
const {
  registerUser,
  loginUser,
  getCurrentUser,
} = require("../controller/userController");
const { validateJWTToken } = require("../middleware/authmiddleware");

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

//protected API route
userRouter.get("/getCurrentUser", validateJWTToken, getCurrentUser);

module.exports = userRouter;
