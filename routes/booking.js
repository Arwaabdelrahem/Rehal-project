const express = require("express");
const bookingcntrl = require("../controllers/Bookings");
const auth = require("../middlewares/auth");
const router = express.Router();

router.use(auth);

router.get("/", bookingcntrl.getAll);
router.get("/:bookingId", bookingcntrl.getById);
router.post("/newBooking/:placeId", bookingcntrl.newBooking);
router.put("/edit/:bookingId", bookingcntrl.editBooking);
router.delete("/delete/:bookingId", bookingcntrl.deleteBooking);

module.exports = router;
