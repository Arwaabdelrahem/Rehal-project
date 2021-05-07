const { User, register, logIn } = require("../models/User");
const bcrypt = require("bcrypt");
const cloud = require("../startup/cloudinary");
const nodemailer = require("nodemailer");
const CodeGenerator = require("node-code-generator");
const fs = require("fs");
const { Place } = require("../models/Place");
const _ = require("lodash");

exports.profile = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    res.status(200).send(user);
  } catch (error) {
    next(error);
  }
};

exports.sendCode = async (req, res, next) => {
  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(404).send("Invalid email");

  var generator = new CodeGenerator();
  const code = generator.generateCodes("#+#+#+", 100)[0];

  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "apprehal@gmail.com",
      pass: process.env.PASSWORD,
    },
  });

  var mailOptions = {
    from: "apprehal@gmail.com",
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

  let user = await User.findOne({ "local.email": req.body.email });
  if (user) return res.status(400).send("User with same email already exists");

  let img;
  if (req.files.length !== 0) {
    img = await cloud.cloudUpload(req.files[0].path);
    req.body.image = img.image;
  }

  var generator = new CodeGenerator();
  const code = generator.generateCodes("#+#+#+", 100)[0];

  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "apprehal@gmail.com",
      pass: process.env.PASSWORD,
    },
  });

  var mailOptions = {
    from: "apprehal@gmail.com",
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

  try {
    req.body.codeVerifing = code;
    req.body.password = await bcrypt.hash(req.body.password, 10);

    user = new User(req.body);
    await user.save();

    if (req.files.length !== 0) fs.unlinkSync(req.files[0].path);
    res.status(201).send(user);
  } catch (error) {
    next(error);
  }
};

exports.verifyCode = async (req, res, next) => {
  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("please enter a valid email");

  try {
    if (user.codeVerifing === req.body.code) {
      user.codeVerifing = "";
      user.enabled = true;
      user = await user.save();
      res.status(200).send(user);
    }
  } catch (error) {
    next(error);
  }
};

exports.LogIn = async (req, res, next) => {
  const { error } = logIn(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(404).send("Invalid email or password");

  if (user.isAdmin !== true) {
    //Not Admin
    if (!user.enabled) return res.status(401).send("Email not activated");
  }

  const compare = await bcrypt.compare(req.body.password, user.password);
  if (!compare) return res.status(404).send("Invalid email or password");

  try {
    const token = user.generateToken();
    res.status(200).send({ user, token });
  } catch (error) {
    next(error);
  }
};

exports.Oauth = async (req, res, next) => {
  try {
    const token = req.user.generateToken();
    res.status(200).send({ user: req.user, token });
  } catch (error) {
    next(error);
  }
};

exports.forgetPassword = async (req, res, next) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).send("Invalid email");

    if (user.codeVerifing === req.body.code) {
      user.password = await bcrypt.hash(req.body.newPassword, 10);
      user.codeVerifing = "";
      user = await user.save();
      res.status(200).send({ msg: "Code sent", user });
    }
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const compare = await bcrypt.compare(
      req.body.oldPassword,
      req.user.password
    );
    if (!compare) return res.status(400).send("Incorrect password");

    req.user.password = await bcrypt.hash(req.body.newPassword, 10);
    req.user = await req.user.save();
    res.status(200).send(req.user);
  } catch (error) {
    next(error);
  }
};

exports.savePlaces = async (req, res, next) => {
  try {
    let place = await Place.findById(req.params.placeId);
    if (!place) return res.status(404).send("Place not found");

    const saved = _.findKey(req.user.savedPlaces, (s) => {
      if (s.toString() === place._id.toString()) return "index";
    });

    if (saved) {
      req.user.savedPlaces.splice(saved, 1);
      await req.user.save();
      return res.status(200).send(req.user);
    }

    req.user.savedPlaces.push(place._id);
    await req.user.save();
    res.status(200).send(req.user);
  } catch (error) {
    next(error);
  }
};

exports.editProfile = async (req, res, next) => {
  try {
    if (req.user._id.toString() !== req.params.id.toString())
      return res.status(403).send("Forbidden");

    let img;
    if (req.files.length !== 0) {
      img = await cloud.cloudUpload(req.files[0].path);
      req.body.image = img.image;
    }

    delete req.body.isAdmin;
    delete req.body.codeVerifing;

    await req.user.set(req.body).save();

    if (req.files.length !== 0) fs.unlinkSync(req.files[0].path);
    res.status(200).send(req.user);
  } catch (error) {
    next(error);
  }
};

exports.deleteAccount = async (req, res, next) => {
  if (req.user._id.toString() !== req.params.id.toString())
    return res.status(403).send("Forbidden");

  try {
    await req.user.delete();
    res.status(204).json();
  } catch (error) {
    next(error);
  }
};
