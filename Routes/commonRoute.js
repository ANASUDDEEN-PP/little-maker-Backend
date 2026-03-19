const express = require("express");
const router = express.Router();

const commonController = require("../Controllers/commonController");
router.get('/get/all/notification', commonController.getAllNotification);
router.put('/mark/notifications/as/read', commonController.setMarkAsRead);
router.delete('/delete/notifications', commonController.deleteNotification)
router.get('/get/dashboard/data', commonController.dashboardAPI);
router.get('/get/search/elements', commonController.getAllSearchElements)

module.exports = router;


// /get/dashboard/data