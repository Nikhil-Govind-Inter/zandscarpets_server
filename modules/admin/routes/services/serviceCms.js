const express = require("express");
const Controller = require("../../http/controllers/services/serviceCmsController");
const authMiddleware = require("../../http/middleware/authMiddleware");

const router = express.Router();
router.use(authMiddleware(["admin", "user"]));
router.get("/", Controller.get);
router.put("/:id", Controller.update);

module.exports = router;
