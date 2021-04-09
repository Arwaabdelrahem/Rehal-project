const { Place } = require("../models/Place");
const { Comment } = require("../models/Comment");
const _ = require("lodash");

exports.fetchComment = async (req, res, next) => {
  let place, comment, type;
  const path = req.route.path.split("/");

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
  res.status(200).send(comments);
};

exports.newComment = async (req, res, next) => {
  let place, comment, type;
  const path = req.route.path.split("/");

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
    parents: [
      ...(type !== "comment" ? [comment.id] : []),
      ...(type === "reply" ? comment.parents : []),
    ],
    author: req.user.id,
    content: req.body.content,
  });

  await newComment.save();
  if (type !== "comment") {
    req.body.reply = comment.reply.push(newComment._id);
    await comment.save();
  }
  res.status(201).send(newComment);
};

exports.React = async (req, res, next) => {
  let comment = await Comment.findById(req.params.commentId);
  if (!comment) return res.status(404).send("Comment not found");

  let reaction = {
    user: req.user._id,
    flavor: req.body.flavor,
  };

  const react = _.findKey(comment.reactions, (r) => {
    if (r.user.toString() === req.user._id.toString()) return "index";
  });
  console.log(react);
  if (react) {
    comment.reactions.splice(react, 1);
    await comment.save();
    return res.status(200).send(comment);
  }

  comment.reactions.push(reaction);
  await comment.save();
  res.status(200).send(comment);
};
