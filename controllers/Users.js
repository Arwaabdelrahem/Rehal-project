const { User, register, logIn } = require("../models/User");
const bcrypt = require("bcrypt");
const cloud = require("../startup/cloudinary");
const nodemailer = require("nodemailer");
const CodeGenerator = require("node-code-generator");
const fs = require("fs");

exports.profile = async (req, res, next) => {
  const user = await User.findOne({ email: req.user.email });
  res.status(200).send(user);
};

exports.sendCode = async (req, res, next) => {
  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(404).send("Invalid email");

  var generator = new CodeGenerator();
  const code = generator.generateCodes("#+#+#+", 100)[0];

  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "arwaabdelrahem2@gmail.com",
      pass: process.env.PASSWORD,
    },
  });

  var mailOptions = {
    from: "arwaabdelrahem2@gmail.com",
    to: req.body.email,
    subject: "Verfication Code",
    text: `Reset password code ${code}`,
  };

  transporter.sendMail(mailOptions, async function (error, info) {
    if (error) {
      res.status(400).send(error);
    } else {
      req.body.codeVerifing = code;
      await user.set(req.body).save();
      res.status(200).send(`Email sent: ${info.response}`);
    }
  });
};

exports.Register = async (req, res, next) => {
  const { error } = register(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already exists");

  let img;
  if (req.files.length !== 0) {
    img = await cloud.cloudUpload(req.files[0].path);
    req.body.image = img.image;
  }

  req.body.password = await bcrypt.hash(req.body.password, 10);

  var generator = new CodeGenerator();
  const code = generator.generateCodes("#+#+#+", 100)[0];

  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "arwaabdelrahem2@gmail.com",
      pass: process.env.PASSWORD,
    },
  });

  var mailOptions = {
    from: "arwaabdelrahem2@gmail.com",
    to: req.body.email,
    subject: "Verfication Code",
    text: `your verfication code ${code}`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log(`Email sent: ${info.response}`);
    }
  });

  req.body.codeVerifing = code;
  user = new User(req.body);
  await user.save();

  if (req.files.length !== 0) fs.unlinkSync(req.files[0].path);
  res.status(201).send(user);
};

exports.verifyCode = async (req, res, next) => {
  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("please enter a valid email");

  try {
    if (user.codeVerifing === req.body.code) {
      user.codeVerifing = "";
      user = await user.save();
      res.status(200).send(user);
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

exports.LogIn = async (req, res, next) => {
  const { error } = logIn(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email or password");

  const compare = await bcrypt.compare(req.body.password, user.password);
  if (!compare) return res.status(400).send("Invalid email or password");

  const token = user.generateToken();
  res.status(200).send({ user, token });
};

exports.forgetPassword = async (req, res, next) => {
  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(404).send("Invalid email");

  try {
    if (user.codeVerifing === req.body.code) {
      user.password = await bcrypt.hash(req.body.newPassword, 10);
      user.codeVerifing = "";
      user = await user.save();
      res.status(200).send({ msg: "Code sent", user });
    }
  } catch (error) {
    console.log("catch");
    res.status(400).send(error.message);
  }
};

exports.changePassword = async (req, res, next) => {
  const compare = await bcrypt.compare(req.body.oldPassword, req.user.password);
  if (!compare) return res.status(400).send("Incorrect password");

  try {
    req.user.password = await bcrypt.hash(req.body.newPassword, 10);
    req.user = await req.user.save();
    res.status(200).send(req.user);
  } catch (error) {
    res.status(400).send(error.message);
  }
};
