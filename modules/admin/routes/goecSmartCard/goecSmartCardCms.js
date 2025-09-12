const express = require("express");
const router = express.Router();
const authMiddleware = require('../../http/middleware/authMiddleware');
const Controller = require("../../http/controllers/goEcSmartCard/GoEcSmartCardCmsController.js");
const { createUploadMiddleware } = require("../../http/middleware/multerMiddleware.js");

// Define fields
const fields = [
    { name: "banner_media_path", maxCount: 1 },
];

// Create upload middleware with fields
const upload = createUploadMiddleware("go-ec-smart-card-cms", fields);

router.get("/", Controller.index);
// router.use(authMiddleware(["admin"]));
router.post("/", upload, Controller.update);

module.exports = router;