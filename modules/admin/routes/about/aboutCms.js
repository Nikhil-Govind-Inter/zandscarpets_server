const express = require("express");
const router = express.Router();
const authMiddleware = require('../../http/middleware/authMiddleware');
const Controller = require("../../http/controllers/about/AboutCms.js");
const { createUploadMiddleware } = require("../../http/middleware/multerMiddleware.js");

// Define fields
const fields = [
    { name: "banner_media_desktop_path", maxCount: 1 },
    { name: "banner_media_mobile_path", maxCount: 1 },
    { name: "about_media_desktop_path", maxCount: 1 },
    { name: "about_media_mobile_path", maxCount: 1 },
    { name: "learn_more_media_path", maxCount: 1 },
    { name: "meet_team_media_path", maxCount: 1 },
];

// Create upload middleware with fields
const upload = createUploadMiddleware("about-cms", fields);

router.get("/", Controller.index);
// router.use(authMiddleware(["admin"]));
router.post("/", upload, Controller.update);

module.exports = router;
