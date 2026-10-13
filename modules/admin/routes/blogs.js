const express = require("express");
const Controller = require("../http/controllers/blogs/blogController");
const authMiddleware = require("../http/middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware(["admin", "user"]));
router.get("/active", Controller.getActive);

module.exports = router;