
const express = require("express");
const router = express.Router();

const {
    addItem,
    getAllItems,
    getItemById,
    updateItem,
    deleteItem,
    getLowStockItems
} = require("../controllers/itemController");

const {
    issueItem,
    returnItem,
    getAllIssueRecords,
    getMyIssueHistory
} = require("../controllers/issueController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

// ADD ITEM - ADMIN
router.post(
    "/",
    authenticateToken,
    authorizeRoles("admin"),
    addItem
);

// ISSUE ITEM - ADMIN
router.post(
    "/issue",
    authenticateToken,
    authorizeRoles("admin"),
    issueItem
);

// RETURN ITEM - ADMIN
router.post(
    "/return",
    authenticateToken,
    authorizeRoles("admin"),
    returnItem
);

// GET ALL ISSUE RECORDS - ADMIN
router.get(
    "/issues",
    authenticateToken,
    authorizeRoles("admin"),
    getAllIssueRecords
);

// GET MY ISSUE HISTORY - ALL LOGGED-IN USERS
router.get(
    "/my-issues",
    authenticateToken,
    getMyIssueHistory
);

// GET ALL ACTIVE ITEMS
router.get(
    "/",
    authenticateToken,
    getAllItems
);

// GET LOW STOCK ITEMS
router.get(
    "/low-stock",
    authenticateToken,
    getLowStockItems
);

// GET ITEM BY ID
router.get(
    "/:id",
    authenticateToken,
    getItemById
);

// UPDATE ITEM - ADMIN
router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    updateItem
);

// DEACTIVATE ITEM - ADMIN
router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    deleteItem
);

module.exports = router;
