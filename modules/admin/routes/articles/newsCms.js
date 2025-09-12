const express = require("express");
const router = express.Router();
const authMiddleware = require('../../http/middleware/authMiddleware.js');
const Controller = require("../../http/controllers/news/NewsCmsController.js");
const { createUploadMiddleware } = require("../../http/middleware/multerMiddleware.js");

// Define fields
const fields = [
];

// Create upload middleware with fields
const upload = createUploadMiddleware("blog-cms", fields);

router.get("/", Controller.index);
// router.use(authMiddleware(["admin"]));
router.post("/", upload, Controller.update);

module.exports = router;