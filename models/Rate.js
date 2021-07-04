const mongooseAutoIncrement = require("mongoose-auto-increment");
const mongoose = require("mongoose");
const pagination = require("mongoose-paginate-v2");

mongooseAutoIncrement.initialize(mongoose.connection);

const rateSchema = new mongoose.Schema(
  {
    place: {
      type: Number,
      ref: "Place",
      required: true,
    },
    user: {
      type: Number,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

rateSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc) {
    return {
      id: doc.id,
      place: doc.place,
      user: doc.user,
      rating: doc.rating,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  },
});

rateSchema.plugin(pagination);
rateSchema.plugin(mongooseAutoIncrement.plugin, { model: "Rate", startAt: 1 });

const Rate = mongoose.model("Rate", rateSchema);
exports.Rate = Rate;
