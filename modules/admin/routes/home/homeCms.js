const express = require("express");
const router = express.Router();
const authMiddleware = require('../../http/middleware/authMiddleware');
const Controller = require("../../http/controllers/home/HomeCmsController.js");
const { createUploadMiddleware } = require("../../http/middleware/multerMiddleware.js");

// Define fields
const fields = [
    { name: "make_ride_media_desktop_path", maxCount: 1 },
    { name: "make_ride_media_mobile_path", maxCount: 1 },
    { name: "app_feature_media_desktop_path", maxCount: 1 },
    { name: "app_feature_media_mobile_path", maxCount: 1 },
    { name: "investment_media_desktop_path", maxCount: 1 },
    { name: "investment_media_mobile_path", maxCount: 1 },
];

// Create upload middleware with fields
const upload = createUploadMiddleware("home-cms", fields);

router.get("/", Controller.index);
// router.use(authMiddleware(["admin"]));
router.post("/", upload, Controller.update);

module.exports = router;