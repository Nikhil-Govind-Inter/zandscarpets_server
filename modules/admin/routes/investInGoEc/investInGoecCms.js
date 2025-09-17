const express = require("express");
const router = express.Router();
const authMiddleware = require('../../http/middleware/authMiddleware.js');
const Controller = require("../../http/controllers/investInGoEc/InvestInGoEcCmsController.js");
const { createUploadMiddleware } = require("../../http/middleware/multerMiddleware.js");

// Define fields
const fields = [
    { name: "banner_media_desktop_path", maxCount: 1 },
    { name: "banner_media_mobile_path", maxCount: 1 },
    { name: "about_media_desktop_path", maxCount: 1 },
    { name: "about_media_mobile_path", maxCount: 1 },
    { name: "growth_media_desktop_path", maxCount: 1 },
    { name: "growth_media_mobile_path", maxCount: 1 },
    { name: "why_invest_media_desktop_path", maxCount: 1 },
    { name: "why_invest_media_mobile_path", maxCount: 1 },
    { name: "invest_in_goec_media_path", maxCount: 1 },
];

// Create upload middleware with fields
const upload = createUploadMiddleware("invest-in-goec-cms", fields);

router.get("/", Controller.index);
// router.use(authMiddleware(["admin"]));
router.post("/", upload, Controller.update);

module.exports = router;
