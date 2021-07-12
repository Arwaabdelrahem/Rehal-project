const { Place } = require("../models/Place");
const { Comment } = require("../models/Comment");
const _ = require("lodash");
const { User } = require("../models/User");
const { Notification } = require("../models/Notification");

exports.countDocsToday = async (req, res, next) => {
  try {
    const today = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate()
    );
    const comments = await Comment.find({
      createdAt: { $gte: today },
    });

    res.status(200).send({ comments });
  } catch (error) {
    next(error);
  }
};

exports.fetchComment = async (req, res, next) => {
  let place, comment, type;
  const path = req.route.path.split("/");

  try {
    if (path[1] === "places") {
      type = "comment";
      place = await Place.findById(req.params.placeId);
      if (!place) return res.status(404).send("Place not found");
    } else {
      type = "reply";
      comment = await Comment.findById(req.params.commentId).populate("reply");
      if (!comment) return res.status(404).send("Comment not found");

      return res.status(200).send(comment.reply);
    }

    const comments = await Comment.find({
      place: req.params.placeId,
      depth: type === "comment" ? 0 : comment.depth + 1,
      directParent: type === "comment" ? null : comment.id,
    });
    await Comment.populate(comments, [
      { path: "author", select: "name -savedPlaces image" },
      { path: "reply", select: "author content reactions" },
    ]);
    res.status(200).send(comments);
  } catch (error) {
    //next(error);
    console.log(error);
  }
};

exports.newComment = async (req, res, next) => {
  let place, comment, type;
  const path = req.route.path.split("/");

  try {
    if (path[2] === "places") {
      type = "comment";
      place = await Place.findById(req.params.placeId);
      if (!place) return res.status(404).send("Place not found");
    } else {
      type = "reply";
      comment = await Comment.findById(req.params.commentId);
      if (!comment) return res.status(404).send("Comment not found");
    }

    let newComment = new Comment({
      place: type === "comment" ? req.params.placeId : comment.place,
      depth: type === "comment" ? 0 : comment.depth + 1,
      directParent: type === "comment" ? null : comment.id,
      author: req.user.id,
      content: req.body.content,
    });

    await newComment.save();
    if (type !== "comment") {
      req.body.reply = comment.reply.push(newComment._id);
      await comment.save();

      if (newComment.author.toString() !== comment.author.toString()) {
        // Send Notification in-app
        const clients = await User.find({ _id: comment.author });
        const targetUsers = clients.map((user) => user.id);
        const notification = await new Notification({
          title: "Rehal",
          body: `${req.user.name} replied to your comment.`,
          user: req.user._id,
          targetUsers: targetUsers,
          subjectType: "Comment",
          subject: comment._id,
        }).save();

        // push notifications
        const receivers = clients;
        for (let i = 0; i < receivers.length; i++) {
          await receivers[i].sendNotification(
            notification.toFirebaseNotification()
          );
        }
      }
    }
    res.status(201).send(newComment);
  } catch (error) {
    next(error);
  }
};

exports.React = async (req, res, next) => {
  let comment = await Comment.findById(req.params.commentId);
  if (!comment) return res.status(404).send("Comment not found");

  let reaction = {
    user: req.user._id,
    flavor: req.body.flavor,
  };

  try {
    const react = _.findKey(comment.reactions, (r) => {
      if (r.user.toString() === req.user._id.toString()) return "index";
    });

    if (react) {
      comment.reactions.splice(react, 1);
      await comment.save();
      return res.status(200).send(comment);
    }

    comment.reactions.push(reaction);
    await comment.save();

    // Send Notification in-app
    const clients = await User.find({ _id: comment.author });
    const targetUsers = clients.map((user) => user.id);
    const notification = await new Notification({
      title: "Rehal",
      body: `${req.user.name} reacted to your comment.`,
      user: req.user._id,
      targetUsers: targetUsers,
      subjectType: "Comment",
      subject: comment._id,
    }).save();

    // push notifications
    const receivers = clients;
    for (let i = 0; i < receivers.length; i++) {
      await receivers[i].sendNotification(
        notification.toFirebaseNotification()
      );
    }

    res.status(200).send(comment);
  } catch (error) {
    console.log(error);
  }
};

exports.editComment = async (req, res, next) => {
  let comment = await Comment.findById(req.params.commentId);
  if (!comment) return res.status(404).send("Comment not found");

  try {
    delete req.body.depth;
    delete req.body.place;
    delete req.body.author;

    if (req.user._id !== comment.author)
      return res.status(400).send("Only comment author can edit");

    await comment.set(req.body).save();
    res.status(200).send(comment);
  } catch (error) {
    next(error);
  }
};

exports.deleteComment = async (req, res, next) => {
  let comment = await Comment.findById(req.params.commentId);
  if (!comment) return res.status(404).send("Comment not found");

  try {
    if (req.user._id !== comment.author)
      return res.status(400).send("Only comment author can delete");

    await comment.delete();
    res.status(204).send("deleted");
  } catch (error) {
    next(error);
  }
};
