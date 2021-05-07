const express = require("express");
const cityControllers = require("../controllers/Cities");
const multer = require("../middlewares/multer");
const isAdmin = require("../middlewares/isAdmin");
const auth = require("../middlewares/auth");
const router = express.Router();

router.get("/", cityControllers.getAll);
router.get("/:cityId", cityControllers.getCity);
router.get("/services/:cityId", cityControllers.cityServices);

router.use(isAdmin);

router.post("/newCity", multer, cityControllers.newCity);
router.post(
  "/:cityId/services/:serviceId",
  multer,
  cityControllers.addServiceToCity
);
router.put("/editCity/:cityId", multer, cityControllers.editCity);
router.delete("/delete/:cityId", cityControllers.deleteCity);

module.exports = router;
