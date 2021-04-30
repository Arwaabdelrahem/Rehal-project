const mongoose = require("mongoose");
const pagination = require("mongoose-paginate-v2");
const mongooseAutoIncrement = require("mongoose-auto-increment");

mongooseAutoIncrement.initialize(mongoose.connection);

const placeSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  rating: {
    type: Number,
  },
  city: {
    type: Number,
    ref: "City",
    required: true,
  },
  service: {
    type: Number,
    ref: "Service",
    required: true,
  },
  media: [{ type: String }],
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
});

placeSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc) {
    return {
      id: doc.id,
      name: doc.name,
      address: doc.address,
      rating: doc.rating,
      city: doc.city,
      service: doc.service,
      comments: doc.comments,
      image: doc.image,
      media: doc.media,
      location: doc.location,
    };
  },
});

placeSchema.index({ location: "2dsphere" });
placeSchema.plugin(pagination);

placeSchema.plugin(mongooseAutoIncrement.plugin, {
  model: "Place",
  startAt: 1,
});

const Place = mongoose.model("Place", placeSchema);
exports.Place = Place;
