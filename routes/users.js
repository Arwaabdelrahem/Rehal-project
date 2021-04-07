const express = require("express");
const userController = require("../controllers/Users");
const multer = require("../middlewares/multer");
const auth = require("../middlewares/auth");
const router = express.Router();

router.get("/profile", auth, userController.profile);

router.post("/register", multer, userController.Register);
router.post("/sendCode", userController.sendCode);
router.post("/verifyEmail", userController.verifyCode);
router.post("/forgetPassword", userController.forgetPassword);
router.post("/changePassword", auth, userController.changePassword);
router.post("/login", userController.LogIn);

module.exports = router;
