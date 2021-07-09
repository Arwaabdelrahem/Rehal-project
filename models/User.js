const Joi = require("joi");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const pagination = require("mongoose-paginate-v2");
const mongooseAutoIncrement = require("mongoose-auto-increment");
const notificationService = require("../services/notification");

mongooseAutoIncrement.initialize(mongoose.connection);

const userSchema = mongoose.Schema(
  {
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
    phone: {
      type: String,
    },
    image: {
      type: String,
      default:
        "http://res.cloudinary.com/dnmp0mplw/image/upload/v1624801026/ecju1eyptnbwn4teavri.jpg",
    },
    codeVerifing: {
      type: String,
      required: false,
    },
    savedPlaces: [
      {
        type: Number,
        ref: "Place",
        autopopulate: true,
      },
    ],
    city: {
      type: String,
    },
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
    // pushTokens: [
    //   new mongoose.Schema(
    //     {
    //       deviceType: {
    //         type: String,
    //         enum: ["android", "ios", "web"],
    //         required: true,
    //       },
    //       deviceToken: {
    //         type: String,
    //         required: true,
    //       },
    //     },
    //     { _id: false }
    //   ),
    // ],
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

function register(user) {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    phone: Joi.string(),
    image: Joi.string(),
    city: Joi.string(),
    location: Joi.object().keys({
      type: Joi.string(),
      coordinates: Joi.array().items(),
    }),
    // pushTokens: Joi.array().items(
    //   Joi.object().keys({
    //     deviceType: Joi.string().required(),
    //     deviceToken: Joi.string().required(),
    //   })
    // ),
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

userSchema.methods.sendNotification = async function (message) {
  let changed = false;
  let len = this.pushTokens.length;
  while (len--) {
    const deviceToken = this.pushTokens[len].deviceToken;
    try {
      console.log("1");
      await notificationService.sendNotification(deviceToken, message);
      console.log("2");
    } catch (error) {
      this.pushTokens.splice(len, 1);
      changed = true;
    }
  }
  if (changed) await this.save();
};

userSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc) {
    return {
      id: doc.id,
      name: doc.name,
      email: doc.email,
      phone: doc.phone,
      isAdmin: doc.isAdmin,
      codeVerifing: doc.codeVerifing,
      image: doc.image,
      savedPlaces: doc.savedPlaces,
      pushTokens: doc.pushTokens,
      location: doc.location,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  },
});

userSchema.plugin(pagination);
userSchema.plugin(mongooseAutoIncrement.plugin, { model: "User", startAt: 1 });
userSchema.plugin(require("mongoose-autopopulate"));
const User = mongoose.model("User", userSchema);

exports.User = User;
exports.register = register;
exports.logIn = logIn;
