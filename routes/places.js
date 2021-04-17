const express = require("express");
const placeControllers = require("../controllers/Places");
const multer = require("../middlewares/multer");
const auth = require("../middlewares/auth");
const router = express.Router();

router.get("/cities/:cityId", placeControllers.getPlacesInCity);
//TODO: fetch bestPlaces
//router.get("/cities/:cityId", placeControllers.bestPlaces);
router.get("/:placeId", placeControllers.getById);
router.get("/:placeId/media", placeControllers.fetchMedia);
router.get("/services/:serviceId", auth, placeControllers.nearestPlaces);
router.post("/services/:serviceId", auth, placeControllers.searchPlaces);
router.post(
  "/new/cities/:cityId/services/:serviceId",
  multer,
  placeControllers.newPlace
);
router.post("/:placeId/media", multer, placeControllers.addMedia);
router.put("/edit/:placeId", multer, placeControllers.editPlace);
router.delete("/delete/:placeId", placeControllers.deletePlace);

module.exports = router;
