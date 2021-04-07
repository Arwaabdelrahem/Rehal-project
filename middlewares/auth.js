const jwt = require("jsonwebtoken");
const { User } = require("../models/User");

module.exports = async function (req, res, next) {
  const token = req.header("auth-token");
  if (!token) return res.status(400).send("access denied! no token provided");

  try {
    const decode = jwt.verify(token, process.env.JWT);

    let user = await User.findById(decode._id);
    if (!user) return res.status(404).send("User not found");

    req.user = user;
    next();
  } catch (error) {
    res.status(400).send(error.message);
  }
};
