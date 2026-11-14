
const express = require("express");
const router = express.Router();

const {
    getDashboardStats,
    getCategoryReport,
    getIssueReturnReport,
    getLowStockReport
} = require("../controllers/reportController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

// DASHBOARD STATISTICS
router.get(
    "/dashboard",
    authenticateToken,
    authorizeRoles("admin"),
    getDashboardStats
);

// CATEGORY-WISE STOCK REPORT
router.get(
    "/category",
    authenticateToken,
    authorizeRoles("admin"),
    getCategoryReport
);

// ISSUE AND RETURN HISTORY REPORT
router.get(
    "/issue-return",
    authenticateToken,
    authorizeRoles("admin"),
    getIssueReturnReport
);

// LOW STOCK REPORT
router.get(
    "/low-stock",
    authenticateToken,
    authorizeRoles("admin"),
    getLowStockReport
);

module.exports = router;
