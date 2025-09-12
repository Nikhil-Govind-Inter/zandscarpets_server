const express = require("express");
const router = express.Router();
const authMiddleware = require('../../http/middleware/authMiddleware');
const Controller = require("../../http/controllers/appPage/AppPageFeaturesController.js");
const { createUploadMiddleware } = require("../../http/middleware/multerMiddleware.js");

// Define upload fields
const fields = [
    { name: "image_one_path", maxCount: 1 },
    { name: "image_two_path", maxCount: 1 },
];


// Create upload middleware with fields
const upload = createUploadMiddleware("app-features", fields);

router.get("/", Controller.index);


router.get("/:id", Controller.show);

// Protected routes (require admin auth)
// router.use(authMiddleware(["admin"]));

router.post("/", upload, Controller.store);
router.put("/:id", upload, Controller.update);
router.delete("/:id", Controller.destroy);

module.exports = router;
