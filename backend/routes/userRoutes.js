
const express = require("express");
const router = express.Router();

const {
    getAllUsers,
    getUserById,
    updateUser,
    updateUserStatus
} = require("../controllers/userController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

// GET ALL USERS - ADMIN
router.get("/", authenticateToken, authorizeRoles("admin"), getAllUsers);

// GET USER BY ID - ADMIN
router.get("/:id", authenticateToken, authorizeRoles("admin"), getUserById);

// UPDATE USER - ADMIN
router.put("/:id", authenticateToken, authorizeRoles("admin"), updateUser);

// ACTIVATE / DEACTIVATE USER - ADMIN
router.patch("/:id/status", authenticateToken, authorizeRoles("admin"), updateUserStatus);

module.exports = router;
