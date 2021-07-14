const mongoose = require("mongoose");
const pagination = require("mongoose-paginate-v2");
const mongooseAutoIncrement = require("mongoose-auto-increment");

mongooseAutoIncrement.initialize(mongoose.connection);

const citySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    postalCode: {
      type: Number,
      required: true,
      unique: true,
    },
    services: [
      {
        type: Number,
        ref: "Service",
        autopopulate: { select: "name image" },
      },
    ],
  },
  { timestamps: true }
);

citySchema.set("toJSON", {
  virtuals: true,
  transform: function (doc) {
    return {
      id: doc.id,
      name: doc.name,
      postalCode: doc.postalCode,
      services: doc.services,
      image: doc.image,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  },
});

citySchema.plugin(pagination);
citySchema.plugin(require("mongoose-autopopulate"));
citySchema.plugin(mongooseAutoIncrement.plugin, { model: "City", startAt: 1 });

const City = mongoose.model("City", citySchema);
exports.City = City;
