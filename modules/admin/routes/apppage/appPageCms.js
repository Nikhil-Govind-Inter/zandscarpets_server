const express = require("express");
const router = express.Router();
const authMiddleware = require('../../http/middleware/authMiddleware');
const Controller = require("../../http/controllers/appPage/AppPageCmsController.js");
const { createUploadMiddleware } = require("../../http/middleware/multerMiddleware.js");

// Define fields
const fields = [
    { name: "banner_media_desktop_path", maxCount: 1 },
    { name: "banner_media_mobile_path", maxCount: 1 },
    { name: "start_ur_journey_media_path", maxCount: 1 },
];

// Create upload middleware with fields
const upload = createUploadMiddleware("app-cms", fields);

router.get("/", Controller.index);
// router.use(authMiddleware(["admin"]));
router.post("/", upload, Controller.update);

module.exports = router;