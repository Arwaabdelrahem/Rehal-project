const express = require("express");
const placeControllers = require("../controllers/Places");
const multer = require("../middlewares/multer");
const auth = require("../middlewares/auth");
const router = express.Router();

router.get("/cities/:cityId", placeControllers.getPlacesInCity);
router.get("/:placeId", placeControllers.getById);
//TODO: fetch bestPlaces
//TODO: fetch neartestPlaces
//TODO: add place media {imgs , videos}
router.post(
  "/new/cities/:cityId/services/:serviceId",
  multer,
  placeControllers.newPlace
);
router.put("/edit/:placeId", multer, placeControllers.editPlace);
router.delete("/delete/:placeId", placeControllers.deletePlace);

module.exports = router;
