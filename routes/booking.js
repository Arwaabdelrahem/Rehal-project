const express = require("express");
const bookingcntrl = require("../controllers/Bookings");
const auth = require("../middlewares/auth");
const router = express.Router();

router.use(auth);

router.get("/bookings", bookingcntrl.getAll);
router.get("/bookings/:bookingId", bookingcntrl.getById);
router.post("/newBooking/:placeId", bookingcntrl.newBooking);
router.put("/bookings/edit/:bookingId", bookingcntrl.editBooking);
router.delete("/bookings/delete/:bookingId", bookingcntrl.deleteBooking);

module.exports = router;
