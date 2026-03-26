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
// No JWT required: always clear cookie (avoids "Invalid Token" if token expired or double-submit)
userRouter.post("/logout", logoutUser);

module.exports = userRouter;
