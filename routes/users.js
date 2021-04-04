const express = require("express");
const userController = require("../controllers/Users");
const multer = require("../middlewares/multer");
const router = express.Router();

router.post("/register", multer, userController.Register);
router.post("/verifyEmail", userController.verifyEmail);
router.post("/login", userController.LogIn);

module.exports = router;
