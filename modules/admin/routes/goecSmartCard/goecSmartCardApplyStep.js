const express = require("express");
const router = express.Router();
const authMiddleware = require('../../http/middleware/authMiddleware.js');
const Controller = require("../../http/controllers/goEcSmartCard/goEcSmartCardApplyStepController.js");
const { createUploadMiddleware } = require("../../http/middleware/multerMiddleware.js");

// Define upload fields
const fields = [
    { name: "banner_media_path", maxCount: 1 },
];


// Create upload middleware with fields
const upload = createUploadMiddleware("go-ec-smart-card-apply-step", fields);

router.get("/", Controller.index);


router.get("/:id", Controller.show);

// Protected routes (require admin auth)
// router.use(authMiddleware(["admin"]));

router.post("/", upload, Controller.store);
router.put("/:id", upload, Controller.update);
router.delete("/:id", Controller.destroy);

module.exports = router;
