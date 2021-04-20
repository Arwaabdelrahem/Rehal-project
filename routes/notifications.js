const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const notificationCntrl = require("../controllers/Notifications");

// public end point
// router.post(
//   "/notifications",
//   require("../controllers/NotificationCtrl/sendNotification")
// ); // dev

router.use(auth);

// private end points
router.post("/notify-clients", notificationCntrl.sendToAll);
router.get("/", notificationCntrl.fetchAll);
router.get("/count", notificationCntrl.numberOfUnSeen);
router.post("/subscribe", notificationCntrl.subscribe);
router.post("/unsubscribe", notificationCntrl.unsubscribe);

module.exports = router;
