const mongoose = require("mongoose");
const pagination = require("mongoose-paginate-v2");
const mongooseAutoIncrement = require("mongoose-auto-increment");

mongooseAutoIncrement.initialize(mongoose.connection);

const bookingSchema = mongoose.Schema(
  {
    user: {
      type: Number,
      ref: "User",
      required: true,
      autopopulate: true,
    },
    place: {
      type: Number,
      ref: "Place",
      required: true,
    },
    ticketsNo: {
      type: Number,
    },
  },
  { timestamps: true }
);

bookingSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc) {
    return {
      id: doc.id,
      user: doc.user,
      place: doc.place,
      ticketsNo: doc.ticketsNo,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  },
});

bookingSchema.plugin(pagination);
bookingSchema.plugin(mongooseAutoIncrement.plugin, {
  model: "Booking",
  startAt: 1,
});

const Booking = mongoose.model("Booking", bookingSchema);
module.exports.Booking = Booking;
