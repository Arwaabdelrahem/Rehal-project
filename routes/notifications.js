const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const notificationCntrl = require("../controllers/Notifications");

router.get("/All", notificationCntrl.countDocsToday);

router.use(auth);
// private end points
router.get("/", notificationCntrl.fetchAll);
router.post("/notify-clients", notificationCntrl.sendToAll);
router.get("/count", notificationCntrl.numberOfUnSeen);
router.post("/subscribe", notificationCntrl.subscribe);
router.post("/unsubscribe", notificationCntrl.unsubscribe);

module.exports = router;
