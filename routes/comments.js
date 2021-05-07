const express = require("express");
const commentsCntrl = require("../controllers/Comments");
const multer = require("../middlewares/multer");
const auth = require("../middlewares/auth");
const router = express.Router();

router.use(auth);

router.get("/places/:placeId", commentsCntrl.fetchComment);
router.get("/reply/:commentId", commentsCntrl.fetchComment);
router.post("/new/places/:placeId", commentsCntrl.newComment);
router.post("/new/reply/:commentId", commentsCntrl.newComment);
router.post("/react/:commentId", commentsCntrl.React);
router.put("/edit/:commentId", commentsCntrl.editComment);
router.delete("/delete/:commentId", commentsCntrl.deleteComment);

module.exports = router;
