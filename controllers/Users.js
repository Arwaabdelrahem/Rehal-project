const { User, register, logIn } = require("../models/User");
const bcrypt = require("bcrypt");

exports.Register = async (req, res, next) => {
  const { error } = register(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already exists");

  user = new User(req.body);
  user.password = await bcrypt.hash(req.body.password, 10);
  await user.save();

  if (req.files.length !== 0) fs.unlinkSync(req.files[0].path);
  res.status(201).send(user);
};

exports.LogIn = async (req, res, next) => {};
