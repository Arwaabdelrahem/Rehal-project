const mongoose = require("mongoose");
const pagination = require("mongoose-paginate-v2");
const mongooseAutoIncrement = require("mongoose-auto-increment");

mongooseAutoIncrement.initialize(mongoose.connection);

const serviceSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true }
);

serviceSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc) {
    return {
      id: doc.id,
      name: doc.name,
      image: doc.image,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  },
});

serviceSchema.plugin(pagination);
serviceSchema.plugin(mongooseAutoIncrement.plugin, {
  model: "Service",
  startAt: 1,
});

const Service = mongoose.model("Service", serviceSchema);
module.exports.Service = Service;
