const mongoose = require("mongoose");
const mongooseAutoIncrement = require("mongoose-auto-increment");
const pagination = require("mongoose-paginate-v2");
mongooseAutoIncrement.initialize(mongoose.connection);

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    user: {
      type: Number,
      ref: "User",
    },
    targetUsers: [
      {
        type: Number,
        ref: "User",
      },
    ],
    subjectType: {
      type: String,
    },
    subject: {
      type: Number,
      refPath: "subjectType",
    },
    seen: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: String,
      default:
        "https://res.cloudinary.com/derossy-backup/image/upload/v1555206853/deross-samples/notifications/bell.png",
    },
  },
  { timestamps: true }
);

notificationSchema.methods.toFirebaseNotification = function () {
  return {
    notification: {
      title: this.title,
      body: this.body,
    },
  };
};

notificationSchema.plugin(pagination);
notificationSchema.plugin(mongooseAutoIncrement.plugin, {
  model: "Notification",
  startAt: 1,
});

notificationSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc) {
    return {
      title: doc.title,
      body: doc.body,
      user: doc.user,
      icon: doc.icon,
      seen: doc.seen,
      subjectType: doc.subjectType,
      subject: doc.subject,
      targetUsers: doc.targetUsers,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  },
});

const Notification = mongoose.model("Notification", notificationSchema);
module.exports.Notification = Notification;
