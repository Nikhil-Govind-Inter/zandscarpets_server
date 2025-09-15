const express = require("express");
const router = express.Router();
const authMiddleware = require('../../http/middleware/authMiddleware');
const Controller = require("../../http/controllers/common/HeaderFooterController.js");
const { createUploadMiddleware } = require("../../http/middleware/multerMiddleware.js");

// Define upload fields
const fields = [
    { name: "header_logo", maxCount: 1 },
    { name: "footer_logo", maxCount: 1 },
    { name: "favicon", maxCount: 1 },
    { name: "app_store_image", maxCount: 1 },
    { name: "playstore_image", maxCount: 1 },
];


// Create upload middleware with fields
const upload = createUploadMiddleware("header-footer", fields);

router.get("/", Controller.index);


// Protected routes (require admin auth)
// router.use(authMiddleware(["admin"]));

router.post("/", upload, Controller.store);


module.exports = router;
