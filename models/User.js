const Joi = require("joi");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const pagination = require("mongoose-paginate-v2");
const mongooseAutoIncrement = require("mongoose-auto-increment");

mongooseAutoIncrement.initialize(mongoose.connection);

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  image: {
    type: String,
  },
  codeVerifing: {
    type: String,
    required: false,
  },
  savedPlaces: [
    {
      type: Number,
      ref: "Place",
    },
  ],
  location: {
    type: {
      type: String,
      default: "Point",
      required: true,
    },
    coordinates: [
      // long came 1st
      {
        type: Number,
        required: true,
      },
    ],
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

function register(user) {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    image: Joi.string(),
  });
  return schema.validate(user);
}

function logIn(user) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });
  return schema.validate(user);
}

userSchema.methods.generateToken = function () {
  const token = jwt.sign(
    { _id: this._id, email: this.email, isAdmin: this.isAdmin },
    process.env.JWT
  );
  return token;
};

// userSchema.set("toJSON", {
//   virtuals: true,
//   transform: function (doc) {
//     return {
//       id: doc.id,
//       name: doc.name,
//       email: doc.email,
//       isAdmin: doc.isAdmin,
//       image: doc.image,
//     };
//   },
// });

userSchema.plugin(pagination);
userSchema.plugin(mongooseAutoIncrement.plugin, { model: "User", startAt: 1 });
const User = mongoose.model("User", userSchema);

exports.User = User;
exports.register = register;
exports.logIn = logIn;
