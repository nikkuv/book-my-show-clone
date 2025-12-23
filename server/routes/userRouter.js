const express = require("express");
const userRouter = express.Router();
const {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
} = require("../controller/userController");
const { validateJWTToken } = require("../middleware/authmiddleware");

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

//protected API route
userRouter.get("/get-current-user", validateJWTToken, getCurrentUser);
userRouter.post("/logout", validateJWTToken, logoutUser);

module.exports = userRouter;
