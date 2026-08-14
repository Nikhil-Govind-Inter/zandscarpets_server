const express = require("express");
const AuthController = require("../http/controllers/AuthController");
const authMiddleware = require("../http/middleware/authMiddleware");

const router = express.Router();

router.post("/login", AuthController.login);
// refresh/logout authenticate via the refresh/access cookies directly, not authMiddleware,
// so logout still works even after the access token has already expired.
router.post("/refresh", AuthController.refresh);
router.post("/logout", AuthController.logout);
router.get("/me", authMiddleware(), AuthController.me);

router.post("/forgot-password", AuthController.forgotPassword);
router.post("/verify-otp", AuthController.verifyOtp);
router.post("/reset-password", AuthController.resetPassword);

module.exports = router;
