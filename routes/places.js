const express = require("express");
const placeControllers = require("../controllers/Places");
const multer = require("../middlewares/multer");
const auth = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");
const router = express.Router();

router.get("/All", placeControllers.countDocsToday);
router.get("/cities/:cityId", placeControllers.getPlacesInCity);
router.get("/best/cities/:cityId", placeControllers.bestPlaces);
router.get("/:placeId", placeControllers.getById);
router.get("/:placeId/media", placeControllers.fetchMedia);

router.use(auth);

router.get(
  "/cities/:cityId/services/:serviceId",
  placeControllers.nearestPlaces
);
router.post("/cities/:cityId", auth, placeControllers.search);

router.use(isAdmin);

router.post(
  "/new/cities/:cityId/services/:serviceId",
  multer,
  placeControllers.newPlace
);
router.post("/:placeId/media", multer, placeControllers.addMedia);
router.put("/edit/:placeId", multer, placeControllers.editPlace);
router.delete("/delete/:placeId", placeControllers.deletePlace);

module.exports = router;
