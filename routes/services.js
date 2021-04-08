const express = require("express");
const serviceControllers = require("../controllers/Services");
const multer = require("../middlewares/multer");
const auth = require("../middlewares/auth");
const router = express.Router();

router.get("/", serviceControllers.getAll);
router.get("/:serviceId", serviceControllers.getById);
router.post("/newService", multer, serviceControllers.newService);
router.put("/edit/:serviceId", multer, serviceControllers.editService);
router.delete("/delete/:serviceId", serviceControllers.deleteService);

module.exports = router;
