const mongoose = require("mongoose");
const pagination = require("mongoose-paginate-v2");
const mongooseAutoIncrement = require("mongoose-auto-increment");

mongooseAutoIncrement.initialize(mongoose.connection);

const schema = new mongoose.Schema(
  {
    place: {
      type: Number,
      ref: "Place",
      required: true,
    },
    depth: {
      type: Number,
      required: true,
    },
    directParent: {
      type: Number,
      ref: "Comment",
    },
    author: {
      type: Number,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    reactions: [reactionSchema()],
    reply: [
      {
        type: Number,
        ref: "Comment",
      },
    ],
  },
  { timestamps: true }
);

schema.virtual("kind").get(function () {
  if (this.depth === 0) return "comment";
  else if (this.depth === 1) return "reply";
  return null;
});

schema.set("toJSON", {
  transform: function (doc) {
    return {
      id: doc.id,
      place: doc.place,
      kind: doc.kind,
      author: doc.author,
      content: doc.content,
      reactions: doc.reactions,
      reply: doc.reply,
      metadata: {
        // total reactions ,, total comments
        reactions: doc.reactions.length,
        reply: doc.reply ? doc.reply.length : 0,
      },
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  },
});

// reaction subdocument
function reactionSchema() {
  const schema = new mongoose.Schema(
    {
      user: {
        type: Number,
        ref: "user",
        required: true,
      },
      flavor: {
        type: String,
        enum: ["like", "dislike", "love", "haha", "sad", "angry"],
        required: true,
      },
    },
    { _id: false }
  );

  schema.set("toJSON", {
    transform: function (doc, ret) {
      return {
        user: doc.user,
        flavor: doc.flavor,
      };
    },
  });

  return schema;
}

schema.plugin(pagination);
schema.plugin(mongooseAutoIncrement.plugin, { model: "Comment", startAt: 1 });

const Comment = mongoose.model("Comment", schema);
exports.Comment = Comment;
