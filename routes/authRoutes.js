const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");

// Registration
router.get("/register", authController.showRegister);
router.post("/register", authController.register);

// Login
router.get("/login", authController.showLogin);
router.post("/login", authController.login);

// Logout must use POST because it changes session state.
router.post("/logout", requireAuth, authController.logout);

module.exports = router;