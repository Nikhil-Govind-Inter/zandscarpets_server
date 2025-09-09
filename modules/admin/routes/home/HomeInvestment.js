const express = require("express");
const router = express.Router();
const authMiddleware = require('../../http/middleware/authMiddleware.js');
const Controller = require("../../http/controllers/home/HomeInvestmentController.js");
const { createUploadMiddleware } = require("../../http/middleware/multerMiddleware.js");

// Define upload fields
const fields = [];


// Create upload middleware with fields
const upload = createUploadMiddleware("home-investment", fields);

router.get("/", Controller.index);


router.get("/:id", Controller.show);

// Protected routes (require admin auth)
// router.use(authMiddleware(["admin"]));

router.post("/", upload, Controller.store);
router.put("/:id", upload, Controller.update);
router.delete("/:id", Controller.destroy);

module.exports = router;
