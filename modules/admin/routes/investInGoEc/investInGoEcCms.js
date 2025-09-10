const express = require("express");
const router = express.Router();
const authMiddleware = require('../../http/middleware/authMiddleware');
const Controller = require("../../http/controllers/investInGoEc/InvestInGoEcCmsController.js");
const { createUploadMiddleware } = require("../../http/middleware/multerMiddleware.js");

// Define fields
const fields = [
    { name: "invest_media_path", maxCount: 1 },
    { name: "future_transportation_media_path", maxCount: 1 },
    { name: "why_invest_media_path", maxCount: 1 },
    { name: "invest_in_goec_media_path", maxCount: 1 },
];

// Create upload middleware with fields
const upload = createUploadMiddleware("invest-in-goec-cms", fields);

router.get("/", Controller.index);
// router.use(authMiddleware(["admin"]));
router.post("/", upload, Controller.update);

module.exports = router;
