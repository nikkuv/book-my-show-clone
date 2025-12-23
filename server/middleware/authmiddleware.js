const jwt = require("jsonwebtoken");

const validateJWTToken = (req, res, next) => {
  try {
    // authorization: bearer token
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.body.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(400).send({ success: false, message: "Invalid Token" });
  }
};

const validateAdmin = (req, res, next) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin) {
      return res.status(400).send({ success: false, message: "Not an admin" });
    }
    req.body.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(400).send({ success: false, message: "Invalid Token" });
  }
}

module.exports = {
  validateJWTToken,
  validateAdmin,
};
