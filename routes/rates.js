const express = require("express");
const rateController = require("../controllers/Rates");
const auth = require("../middlewares/auth");
const router = express.Router();

router.get("/All", rateController.countDocsToday);
router.get("/places/:placeId", rateController.getAll);
router.post("/new/places/:placeId", auth, rateController.newRate);

module.exports = router;
