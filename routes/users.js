const express = require("express");
const userController = require("../controllers/Users");
const multer = require("../middlewares/multer");
const auth = require("../middlewares/auth");
const passport = require("passport");
const passportConfig = require("../passport");

const router = express.Router();

router.post("/register", multer, userController.Register);
router.post("/sendCode", userController.sendCode);
router.post("/verifyEmail", userController.verifyCode);
router.post("/forgetPassword", userController.forgetPassword);
router.post("/login", userController.LogIn);
router.post(
  "/Oauth/google",
  passport.authenticate("googleToken", { session: false }),
  userController.Oauth
);
router.post(
  "/Oauth/facebook",
  passport.authenticate("facebookToken", { session: false }),
  userController.Oauth
);

router.use(auth);

router.get("/profile", userController.profile);
router.post("/changePassword", userController.changePassword);
router.post("/savePlaces/:placeId", userController.savePlaces);
router.put("/edit/:id", multer, userController.editProfile);
router.delete("/delete/:id", userController.deleteAccount);

module.exports = router;
