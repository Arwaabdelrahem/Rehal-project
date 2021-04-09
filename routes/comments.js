const express = require("express");
const commentsCntrl = require("../controllers/Comments");
const multer = require("../middlewares/multer");
const auth = require("../middlewares/auth");
const router = express.Router();

router.get("/places/:placeId", auth, commentsCntrl.fetchComment);
router.get("/reply/:commentId", auth, commentsCntrl.fetchComment);
router.post("/new/places/:placeId", auth, commentsCntrl.newComment);
router.post("/new/reply/:commentId", auth, commentsCntrl.newComment);
router.post("/react/:commentId", auth, commentsCntrl.React);
router.put("/edit/:commentId", auth, commentsCntrl.editComment);
router.delete("/delete/:commentId", auth, commentsCntrl.deleteComment);

module.exports = router;
