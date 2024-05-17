const UserModal = require("../modal/userModal");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  try {
    const isUserExists = await UserModal.findOne({ email: req.body.email });

    if (isUserExists) {
      return res
        .status(200)
        .json({ success: false, message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPassword;
    const user = new UserModal(req.body);
    const response = await user.save();
    res.status(200).json({
      success: true,
      data: response,
      message: "Resgistration Successful, please login",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const isUserExists = await UserModal.findOne({ email: req.body.email });
    if (!isUserExists) {
      return res
        .status(200)
        .json({ success: false, message: "User doesn't exists" });
    }

    //validate password
    const validPassword = await bcrypt.compare(
      req.body.password,
      isUserExists.password
    );

    if (!validPassword) {
      return res
        .status(200)
        .json({ success: false, message: "Invalid Password" });
    } else {
      const token = jwt.sign(
        { userId: isUserExists._id },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      res.status(200).json({
        success: true,
        data: isUserExists,
        message: "Login Successful",
        token: token,
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await UserModal.findById(req.body.userId).select("-password");
    if (!user) {
      return res
        .status(200)
        .json({ success: false, message: "User doesn't exists" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { registerUser, loginUser, getCurrentUser };
