const express = require("express");
const userController = require("../controllers/Users");
const router = express.Router();

router.post("/register", userController.Register);
router.post("/login", userController.LogIn);

module.exports = router;
